-- Add spotify_id column to tracks table for embed player
ALTER TABLE tracks ADD COLUMN spotify_id TEXT;

-- Create index for potential lookups
CREATE INDEX idx_tracks_spotify_id ON tracks (spotify_id);
