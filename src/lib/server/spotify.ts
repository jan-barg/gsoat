import { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } from '$env/static/private';
import { SpotifyTrackSchema, type SpotifyTrack } from '$lib/types';
import { z } from 'zod';

let accessToken: string | null = null;
let tokenExpiry: number = 0;

/**
 * Get Spotify access token (client credentials flow)
 */
async function getAccessToken(): Promise<string> {
	if (accessToken && Date.now() < tokenExpiry) {
		return accessToken;
	}

	const response = await fetch('https://accounts.spotify.com/api/token', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			Authorization: `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`
		},
		body: 'grant_type=client_credentials'
	});

	if (!response.ok) {
		throw new Error('Failed to get Spotify access token');
	}

	const data = await response.json();
	accessToken = data.access_token as string;
	tokenExpiry = Date.now() + (data.expires_in - 60) * 1000; // Refresh 1 min early

	return accessToken as string;
}

/**
 * Search for tracks on Spotify
 */
export async function searchTracks(query: string, limit = 10): Promise<SpotifyTrack[]> {
	const token = await getAccessToken();

	const response = await fetch(
		`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`,
		{
			headers: {
				Authorization: `Bearer ${token}`
			}
		}
	);

	if (!response.ok) {
		throw new Error('Spotify search failed');
	}

	const data = await response.json();

	// Validate response with Zod
	const TracksResponseSchema = z.object({
		tracks: z.object({
			items: z.array(SpotifyTrackSchema)
		})
	});

	const parsed = TracksResponseSchema.safeParse(data);
	if (!parsed.success) {
		throw new Error('Invalid Spotify response format');
	}

	return parsed.data.tracks.items;
}
