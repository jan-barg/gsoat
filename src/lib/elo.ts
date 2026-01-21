/**
 * ELO Rating System
 * K-Factor: 32 (standard for new/active players)
 */

const K_FACTOR = 32;

/**
 * Calculate expected score for player A against player B
 */
function expectedScore(ratingA: number, ratingB: number): number {
	return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

/**
 * Calculate new ELO ratings after a match
 * @param winnerRating - Current rating of the winner
 * @param loserRating - Current rating of the loser
 * @returns New ratings for winner and loser (immutable)
 */
export function calculateNewRatings(
	winnerRating: number,
	loserRating: number
): { newWinnerRating: number; newLoserRating: number } {
	const expectedWinner = expectedScore(winnerRating, loserRating);
	const expectedLoser = expectedScore(loserRating, winnerRating);

	const newWinnerRating = Math.round(winnerRating + K_FACTOR * (1 - expectedWinner));
	const newLoserRating = Math.round(loserRating + K_FACTOR * (0 - expectedLoser));

	return {
		newWinnerRating,
		newLoserRating
	};
}

/**
 * Check if two songs are within acceptable ELO range for matchmaking
 * @param ratingA - Rating of first song
 * @param ratingB - Rating of second song
 * @param range - Acceptable ELO difference (default: 200)
 */
export function isWithinMatchRange(ratingA: number, ratingB: number, range = 200): boolean {
	return Math.abs(ratingA - ratingB) <= range;
}

/**
 * Default ELO rating for new songs
 */
export const DEFAULT_ELO = 1200;
