import { z } from 'zod';

// Track schema and type
export const TrackSchema = z.object({
	id: z.string().uuid(),
	isrc: z.string().min(1),
	title: z.string().min(1),
	artist: z.string().min(1),
	cover_image_url: z.string().url().nullable(),
	elo_rating: z.number().int().default(1200),
	matchups_won: z.number().int().default(0),
	created_at: z.string().datetime()
});

export type Track = z.infer<typeof TrackSchema>;

// Vote schema and type
export const VoteSchema = z.object({
	id: z.string().uuid(),
	winner_id: z.string().uuid(),
	loser_id: z.string().uuid(),
	user_session: z.string().min(1),
	created_at: z.string().datetime()
});

export type Vote = z.infer<typeof VoteSchema>;

// Vote payload (what client sends)
export const VotePayloadSchema = z.object({
	winner_id: z.string().uuid(),
	loser_id: z.string().uuid(),
	matchup_token: z.string().min(1)
});

export type VotePayload = z.infer<typeof VotePayloadSchema>;

// Matchup session schema
export const MatchupSessionSchema = z.object({
	id: z.string().uuid(),
	user_session: z.string().min(1),
	song_a_id: z.string().uuid(),
	song_b_id: z.string().uuid(),
	token: z.string().min(1),
	token_expires_at: z.string().datetime(),
	created_at: z.string().datetime()
});

export type MatchupSession = z.infer<typeof MatchupSessionSchema>;

// Spotify search result (for adding songs)
export const SpotifyTrackSchema = z.object({
	id: z.string(),
	name: z.string(),
	artists: z.array(z.object({ name: z.string() })),
	album: z.object({
		images: z.array(z.object({ url: z.string() }))
	}),
	external_ids: z.object({
		isrc: z.string().optional()
	})
});

export type SpotifyTrack = z.infer<typeof SpotifyTrackSchema>;

// Add song payload
export const AddSongPayloadSchema = z.object({
	isrc: z.string().min(1),
	title: z.string().min(1),
	artist: z.string().min(1),
	cover_image_url: z.string().url().nullable()
});

export type AddSongPayload = z.infer<typeof AddSongPayloadSchema>;
