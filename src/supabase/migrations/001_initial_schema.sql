-- GSOAT Initial Schema
-- Tables: tracks, votes, matchup_sessions
-- Security: RLS enabled, public read on tracks only

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

--------------------------------------------------------------------------------
-- TRACKS TABLE
--------------------------------------------------------------------------------
CREATE TABLE tracks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    isrc TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    cover_image_url TEXT,
    elo_rating INTEGER NOT NULL DEFAULT 1200,
    matchups_won INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for leaderboard queries (sorted by ELO)
CREATE INDEX idx_tracks_elo_rating ON tracks (elo_rating DESC);

-- Enable RLS
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;

-- Allow public SELECT (leaderboard is public)
CREATE POLICY "tracks_select_public" ON tracks
    FOR SELECT
    USING (true);

-- Explicit DENY for anonymous writes (defense in depth)
CREATE POLICY "tracks_insert_deny" ON tracks
    FOR INSERT
    WITH CHECK (false);

CREATE POLICY "tracks_update_deny" ON tracks
    FOR UPDATE
    USING (false);

CREATE POLICY "tracks_delete_deny" ON tracks
    FOR DELETE
    USING (false);

--------------------------------------------------------------------------------
-- VOTES TABLE
--------------------------------------------------------------------------------
CREATE TABLE votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    winner_id UUID NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
    loser_id UUID NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
    user_session TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Prevent voting for the same song against itself
    CONSTRAINT votes_different_tracks CHECK (winner_id != loser_id)
);

-- Index for session-based queries
CREATE INDEX idx_votes_user_session ON votes (user_session);

-- Index for tracking matchup history
CREATE INDEX idx_votes_winner_loser ON votes (winner_id, loser_id);

-- Enable RLS
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Explicit DENY all operations for anonymous users
CREATE POLICY "votes_select_deny" ON votes
    FOR SELECT
    USING (false);

CREATE POLICY "votes_insert_deny" ON votes
    FOR INSERT
    WITH CHECK (false);

CREATE POLICY "votes_update_deny" ON votes
    FOR UPDATE
    USING (false);

CREATE POLICY "votes_delete_deny" ON votes
    FOR DELETE
    USING (false);

--------------------------------------------------------------------------------
-- MATCHUP SESSIONS TABLE
--------------------------------------------------------------------------------
CREATE TABLE matchup_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_session TEXT NOT NULL,
    song_a_id UUID NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
    song_b_id UUID NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    token_expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Prevent matching a song against itself
    CONSTRAINT matchup_different_tracks CHECK (song_a_id != song_b_id)
);

-- Index for token lookup (vote validation)
CREATE INDEX idx_matchup_sessions_token ON matchup_sessions (token);

-- Index for finding user's active matchups
CREATE INDEX idx_matchup_sessions_user_expires ON matchup_sessions (user_session, token_expires_at);

-- Enable RLS
ALTER TABLE matchup_sessions ENABLE ROW LEVEL SECURITY;

-- Explicit DENY all operations for anonymous users
CREATE POLICY "matchup_sessions_select_deny" ON matchup_sessions
    FOR SELECT
    USING (false);

CREATE POLICY "matchup_sessions_insert_deny" ON matchup_sessions
    FOR INSERT
    WITH CHECK (false);

CREATE POLICY "matchup_sessions_update_deny" ON matchup_sessions
    FOR UPDATE
    USING (false);

CREATE POLICY "matchup_sessions_delete_deny" ON matchup_sessions
    FOR DELETE
    USING (false);
