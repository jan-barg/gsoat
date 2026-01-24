-- Atomic vote processing function
-- This ensures ELO updates and vote recording happen in a single transaction

CREATE OR REPLACE FUNCTION process_vote(
    p_winner_id UUID,
    p_loser_id UUID,
    p_new_winner_rating INTEGER,
    p_new_loser_rating INTEGER,
    p_winner_wins INTEGER,
    p_user_session TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Update winner's rating and increment wins
    UPDATE tracks
    SET elo_rating = p_new_winner_rating,
        matchups_won = p_winner_wins
    WHERE id = p_winner_id;

    -- Update loser's rating
    UPDATE tracks
    SET elo_rating = p_new_loser_rating
    WHERE id = p_loser_id;

    -- Record the vote
    INSERT INTO votes (winner_id, loser_id, user_session)
    VALUES (p_winner_id, p_loser_id, p_user_session);
END;
$$;

-- Grant execute permission to authenticated users (service role will use this)
GRANT EXECUTE ON FUNCTION process_vote TO authenticated;
GRANT EXECUTE ON FUNCTION process_vote TO service_role;
