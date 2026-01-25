import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { supabaseAdmin } from '$lib/server/supabase';
import { voteRateLimiter } from '$lib/server/redis';
import { getOrCreateSessionId, getNextMatchup, validateMatchupToken, invalidateMatchupToken } from '$lib/server/matchup';
import { calculateNewRatings } from '$lib/elo';
import { VotePayloadSchema } from '$lib/types';
import { logger } from '$lib/logger';

export const load: PageServerLoad = async ({ cookies }) => {
	const sessionId = getOrCreateSessionId(cookies);

	// Get stats
	const [{ count: totalSongs }, { count: totalVotes }] = await Promise.all([
		supabaseAdmin.from('tracks').select('*', { count: 'exact', head: true }),
		supabaseAdmin.from('votes').select('*', { count: 'exact', head: true })
	]);

	// Get next matchup (spotify_id is included from database)
	const matchup = await getNextMatchup(sessionId);

	return {
		matchup,
		stats: {
			totalSongs: totalSongs ?? 0,
			totalVotes: totalVotes ?? 0
		}
	};
};

export const actions: Actions = {
	vote: async ({ request, cookies, getClientAddress }) => {
		const ip = getClientAddress();

		// 1. Rate limiting
		const { success, remaining } = await voteRateLimiter.limit(ip);
		if (!success) {
			logger.warn('Rate limit exceeded', { ip, remaining });
			return fail(429, { error: 'Too many votes. Please wait a moment.' });
		}

		// 2. Parse form data
		const formData = await request.formData();
		const rawPayload = {
			winner_id: formData.get('winner_id'),
			loser_id: formData.get('loser_id'),
			matchup_token: formData.get('matchup_token')
		};

		// 3. Validate with Zod
		const result = VotePayloadSchema.safeParse(rawPayload);
		if (!result.success) {
			logger.warn('Invalid vote payload', { errors: result.error.errors });
			return fail(400, { error: 'Invalid vote data.' });
		}

		const { winner_id, loser_id, matchup_token } = result.data;
		const sessionId = getOrCreateSessionId(cookies);

		// 4. Validate matchup token
		const matchup = await validateMatchupToken(matchup_token, sessionId);
		if (!matchup) {
			logger.warn('Invalid matchup token', { sessionId });
			return fail(400, { error: 'Invalid or expired matchup. Please try again.' });
		}

		// 5. Verify winner/loser are from this matchup
		const validIds = new Set([matchup.songAId, matchup.songBId]);
		if (!validIds.has(winner_id) || !validIds.has(loser_id) || winner_id === loser_id) {
			logger.warn('Vote IDs do not match matchup', { winner_id, loser_id, matchup });
			return fail(400, { error: 'Invalid vote selection.' });
		}

		// 6. Fetch current ratings from DB (never trust client)
		const { data: tracks, error: fetchError } = await supabaseAdmin
			.from('tracks')
			.select('id, elo_rating, matchups_won')
			.in('id', [winner_id, loser_id]);

		if (fetchError || !tracks || tracks.length !== 2) {
			logger.error('Failed to fetch tracks', { error: fetchError });
			return fail(500, { error: 'Failed to process vote.' });
		}

		const winner = tracks.find((t) => t.id === winner_id)!;
		const loser = tracks.find((t) => t.id === loser_id)!;

		// 7. Calculate new ELO ratings
		const { newWinnerRating, newLoserRating } = calculateNewRatings(
			winner.elo_rating,
			loser.elo_rating
		);

		// 8. Atomic transaction: update ratings + record vote
		const { error: updateError } = await supabaseAdmin.rpc('process_vote', {
			p_winner_id: winner_id,
			p_loser_id: loser_id,
			p_new_winner_rating: newWinnerRating,
			p_new_loser_rating: newLoserRating,
			p_winner_wins: winner.matchups_won + 1,
			p_user_session: sessionId
		});

		if (updateError) {
			// Fallback: non-atomic updates if RPC doesn't exist
			logger.warn('RPC not available, using fallback', { error: updateError });

			const updates = await Promise.all([
				supabaseAdmin
					.from('tracks')
					.update({ elo_rating: newWinnerRating, matchups_won: winner.matchups_won + 1 })
					.eq('id', winner_id),
				supabaseAdmin
					.from('tracks')
					.update({ elo_rating: newLoserRating })
					.eq('id', loser_id),
				supabaseAdmin.from('votes').insert({
					winner_id,
					loser_id,
					user_session: sessionId
				})
			]);

			const failed = updates.find((u) => u.error);
			if (failed?.error) {
				logger.error('Failed to update ratings', { error: failed.error });
				return fail(500, { error: 'Failed to record vote.' });
			}
		}

		// 9. Invalidate used token
		await invalidateMatchupToken(matchup_token);

		logger.info('Vote recorded', {
			winner_id,
			loser_id,
			oldRatings: { winner: winner.elo_rating, loser: loser.elo_rating },
			newRatings: { winner: newWinnerRating, loser: newLoserRating }
		});

		// Redirect to prevent form resubmission on refresh (POST-Redirect-GET)
		redirect(303, '/');
	},

	skip: async ({ cookies }) => {
		const sessionId = getOrCreateSessionId(cookies);

		// Delete current matchup session to get a new one on redirect
		await supabaseAdmin
			.from('matchup_sessions')
			.delete()
			.eq('user_session', sessionId);

		redirect(303, '/');
	}
};
