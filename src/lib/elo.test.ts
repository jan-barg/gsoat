import { describe, it, expect } from 'vitest';
import { calculateNewRatings, isWithinMatchRange, DEFAULT_ELO } from './elo';

describe('ELO Rating System', () => {
	describe('calculateNewRatings', () => {
		it('should return new ratings for equal-rated players (K/2 change)', () => {
			const result = calculateNewRatings(1200, 1200);

			// When ratings are equal, expected score is 0.5 for both
			// Winner gains K * (1 - 0.5) = 16, Loser loses K * (0 - 0.5) = -16
			expect(result.newWinnerRating).toBe(1216);
			expect(result.newLoserRating).toBe(1184);
		});

		it('should give smaller gain when higher-rated player wins', () => {
			const result = calculateNewRatings(1400, 1200);

			// Higher-rated winner expected to win, gains less
			expect(result.newWinnerRating).toBeLessThan(1400 + 16);
			expect(result.newWinnerRating).toBeGreaterThan(1400);

			// Lower-rated loser expected to lose, loses less
			expect(result.newLoserRating).toBeGreaterThan(1200 - 16);
			expect(result.newLoserRating).toBeLessThan(1200);
		});

		it('should give larger gain when lower-rated player wins (upset)', () => {
			const result = calculateNewRatings(1200, 1400);

			// Upset: lower-rated winner gains more than K/2
			expect(result.newWinnerRating).toBeGreaterThan(1200 + 16);

			// Higher-rated loser loses more than K/2
			expect(result.newLoserRating).toBeLessThan(1400 - 16);
		});

		it('should round ratings to integers', () => {
			const result = calculateNewRatings(1234, 1267);

			expect(Number.isInteger(result.newWinnerRating)).toBe(true);
			expect(Number.isInteger(result.newLoserRating)).toBe(true);
		});

		it('should maintain rating sum (zero-sum game)', () => {
			const winnerRating = 1300;
			const loserRating = 1250;
			const result = calculateNewRatings(winnerRating, loserRating);

			const originalSum = winnerRating + loserRating;
			const newSum = result.newWinnerRating + result.newLoserRating;

			// May differ by 1 due to rounding, but should be close
			expect(Math.abs(newSum - originalSum)).toBeLessThanOrEqual(1);
		});

		it('should be immutable (not modify inputs)', () => {
			const winnerRating = 1200;
			const loserRating = 1200;

			calculateNewRatings(winnerRating, loserRating);

			// Original values should be unchanged (primitives are immutable by nature,
			// but this test documents the expected behavior)
			expect(winnerRating).toBe(1200);
			expect(loserRating).toBe(1200);
		});
	});

	describe('isWithinMatchRange', () => {
		it('should return true for equal ratings', () => {
			expect(isWithinMatchRange(1200, 1200)).toBe(true);
		});

		it('should return true for ratings exactly at the boundary', () => {
			expect(isWithinMatchRange(1200, 1400)).toBe(true);
			expect(isWithinMatchRange(1400, 1200)).toBe(true);
		});

		it('should return false for ratings just outside the boundary', () => {
			expect(isWithinMatchRange(1200, 1401)).toBe(false);
			expect(isWithinMatchRange(1401, 1200)).toBe(false);
		});

		it('should use custom range when provided', () => {
			expect(isWithinMatchRange(1200, 1350, 150)).toBe(true);
			expect(isWithinMatchRange(1200, 1351, 150)).toBe(false);
		});

		it('should work with ratings below default', () => {
			expect(isWithinMatchRange(900, 1000)).toBe(true);
			expect(isWithinMatchRange(800, 1100)).toBe(false);
		});
	});

	describe('DEFAULT_ELO', () => {
		it('should be 1200', () => {
			expect(DEFAULT_ELO).toBe(1200);
		});
	});
});
