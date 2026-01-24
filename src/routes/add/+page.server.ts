import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { supabaseAdmin } from '$lib/server/supabase';
import { addSongRateLimiter } from '$lib/server/redis';
import { searchTracks } from '$lib/server/spotify';
import { AddSongPayloadSchema } from '$lib/types';
import { DEFAULT_ELO } from '$lib/elo';
import { logger } from '$lib/logger';
import { getOrCreateSessionId } from '$lib/server/matchup';

export const load: PageServerLoad = async ({ url }) => {
	const query = url.searchParams.get('q');

	if (!query || query.length < 2) {
		return { searchResults: [], query: query ?? '' };
	}

	try {
		const results = await searchTracks(query, 10);

		// Get existing ISRCs to mark duplicates
		const isrcs = results
			.map((r) => r.external_ids?.isrc)
			.filter((isrc): isrc is string => !!isrc);

		const { data: existingTracks } = await supabaseAdmin
			.from('tracks')
			.select('isrc')
			.in('isrc', isrcs);

		const existingIsrcs = new Set(existingTracks?.map((t) => t.isrc) ?? []);

		const searchResults = results.map((track) => ({
			spotifyId: track.id,
			title: track.name,
			artist: track.artists.map((a) => a.name).join(', '),
			coverUrl: track.album.images[0]?.url ?? null,
			isrc: track.external_ids?.isrc ?? null,
			alreadyExists: track.external_ids?.isrc ? existingIsrcs.has(track.external_ids.isrc) : false
		}));

		return { searchResults, query };
	} catch (error) {
		logger.error('Spotify search failed', { error });
		return { searchResults: [], query, error: 'Search failed. Please try again.' };
	}
};

export const actions: Actions = {
	add: async ({ request, cookies, getClientAddress }) => {
		const ip = getClientAddress();

		// Rate limiting: 5 song additions per minute
		const { success } = await addSongRateLimiter.limit(ip);
		if (!success) {
			logger.warn('Add song rate limit exceeded', { ip });
			return fail(429, { error: 'Too many songs added. Please wait a moment.' });
		}

		const formData = await request.formData();
		const rawPayload = {
			isrc: formData.get('isrc'),
			title: formData.get('title'),
			artist: formData.get('artist'),
			cover_image_url: formData.get('cover_url') || null,
			spotify_id: formData.get('spotify_id') || null
		};

		// Validate with Zod
		const result = AddSongPayloadSchema.safeParse(rawPayload);
		if (!result.success) {
			logger.warn('Invalid add song payload', { errors: result.error.errors });
			return fail(400, { error: 'Invalid song data.' });
		}

		const { isrc, title, artist, cover_image_url, spotify_id } = result.data;

		// Check for duplicate
		const { data: existing } = await supabaseAdmin
			.from('tracks')
			.select('id')
			.eq('isrc', isrc)
			.single();

		if (existing) {
			return fail(400, { error: 'This song already exists in the database.' });
		}

		// Insert new track
		const { data: newTrack, error } = await supabaseAdmin
			.from('tracks')
			.insert({
				isrc,
				title,
				artist,
				cover_image_url,
				spotify_id,
				elo_rating: DEFAULT_ELO,
				matchups_won: 0
			})
			.select('id')
			.single();

		if (error) {
			logger.error('Failed to add track', { error: error.message, code: error.code, details: error.details });
			return fail(500, { error: 'Failed to add song. Please try again.' });
		}

		logger.info('Track added', { trackId: newTrack.id, title, artist });

		// Store the new track ID in session for priority matchup
		const sessionId = getOrCreateSessionId(cookies);
		await supabaseAdmin
			.from('matchup_sessions')
			.delete()
			.eq('user_session', sessionId); // Clear existing matchups to force new one with this song

		// Redirect to voting arena
		redirect(303, '/');
	}
};
