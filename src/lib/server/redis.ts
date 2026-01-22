import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';
import { UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN } from '$env/static/private';

export const redis = new Redis({
	url: UPSTASH_REDIS_REST_URL,
	token: UPSTASH_REDIS_REST_TOKEN
});

// Rate limiter: 15 votes per minute per IP
export const voteRateLimiter = new Ratelimit({
	redis,
	limiter: Ratelimit.slidingWindow(15, '1 m'),
	analytics: true,
	prefix: 'gsoat:vote'
});

// Rate limiter: 5 song additions per minute per IP
export const addSongRateLimiter = new Ratelimit({
	redis,
	limiter: Ratelimit.slidingWindow(5, '1 m'),
	analytics: true,
	prefix: 'gsoat:add'
});
