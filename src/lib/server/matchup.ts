import { randomBytes } from 'crypto';
import { supabaseAdmin } from './supabase';
import { isWithinMatchRange } from '$lib/elo';
import type { Track } from '$lib/types';
import type { Cookies } from '@sveltejs/kit';

const TOKEN_EXPIRY_MINUTES = 10;

/**
 * Generate a cryptographically secure matchup token
 */
export function generateMatchupToken(): string {
	return randomBytes(32).toString('hex');
}

/**
 * Get or create a session ID from cookies
 */
export function getOrCreateSessionId(cookies: Cookies): string {
	let sessionId = cookies.get('gsoat_session');

	if (!sessionId) {
		sessionId = randomBytes(16).toString('hex');
		cookies.set('gsoat_session', sessionId, {
			path: '/',
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production', // Only secure in production
			sameSite: 'strict',
			maxAge: 60 * 60 * 24 * 365 // 1 year
		});
	}

	return sessionId;
}

/**
 * Find two tracks for a matchup, preferring similar ELO ratings
 * Excludes pairs the user has already voted on
 */
export async function getNextMatchup(
	sessionId: string
): Promise<{ songA: Track; songB: Track; token: string } | null> {
	// Get all tracks
	const { data: tracks, error: tracksError } = await supabaseAdmin
		.from('tracks')
		.select('*')
		.order('elo_rating', { ascending: false });

	if (tracksError || !tracks || tracks.length < 2) {
		return null;
	}

	// Get pairs this user has already voted on
	const { data: votes } = await supabaseAdmin
		.from('votes')
		.select('winner_id, loser_id')
		.eq('user_session', sessionId);

	const votedPairs = new Set<string>();
	if (votes) {
		for (const vote of votes) {
			// Store both directions since A vs B is same as B vs A
			votedPairs.add(`${vote.winner_id}-${vote.loser_id}`);
			votedPairs.add(`${vote.loser_id}-${vote.winner_id}`);
		}
	}

	// Find a valid pair (similar ELO, not already voted on)
	let songA: Track | null = null;
	let songB: Track | null = null;

	// Try to find a pair within ELO range first
	for (let i = 0; i < tracks.length && !songA; i++) {
		for (let j = i + 1; j < tracks.length; j++) {
			const pairKey = `${tracks[i].id}-${tracks[j].id}`;

			if (!votedPairs.has(pairKey) && isWithinMatchRange(tracks[i].elo_rating, tracks[j].elo_rating)) {
				songA = tracks[i] as Track;
				songB = tracks[j] as Track;
				break;
			}
		}
	}

	// If no pair within range, try any unvoted pair
	if (!songA) {
		for (let i = 0; i < tracks.length && !songA; i++) {
			for (let j = i + 1; j < tracks.length; j++) {
				const pairKey = `${tracks[i].id}-${tracks[j].id}`;

				if (!votedPairs.has(pairKey)) {
					songA = tracks[i] as Track;
					songB = tracks[j] as Track;
					break;
				}
			}
		}
	}

	if (!songA || !songB) {
		return null; // User has voted on all pairs
	}

	// Generate token and store matchup session
	const token = generateMatchupToken();
	const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_MINUTES * 60 * 1000).toISOString();

	const { error: sessionError } = await supabaseAdmin
		.from('matchup_sessions')
		.insert({
			user_session: sessionId,
			song_a_id: songA.id,
			song_b_id: songB.id,
			token,
			token_expires_at: expiresAt
		});

	if (sessionError) {
		return null;
	}

	return { songA, songB, token };
}

/**
 * Validate a matchup token and return the matchup details
 */
export async function validateMatchupToken(
	token: string,
	sessionId: string
): Promise<{ songAId: string; songBId: string } | null> {
	const { data, error } = await supabaseAdmin
		.from('matchup_sessions')
		.select('song_a_id, song_b_id, token_expires_at')
		.eq('token', token)
		.eq('user_session', sessionId)
		.single();

	if (error || !data) {
		return null;
	}

	// Check if token has expired
	if (new Date(data.token_expires_at) < new Date()) {
		return null;
	}

	return {
		songAId: data.song_a_id,
		songBId: data.song_b_id
	};
}

/**
 * Invalidate a used matchup token
 */
export async function invalidateMatchupToken(token: string): Promise<void> {
	await supabaseAdmin
		.from('matchup_sessions')
		.delete()
		.eq('token', token);
}
