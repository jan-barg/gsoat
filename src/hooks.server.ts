import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);

	// Security headers
	response.headers.set('X-Frame-Options', 'DENY');
	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

	// Content Security Policy
	response.headers.set(
		'Content-Security-Policy',
		[
			"default-src 'self'",
			"script-src 'self'",
			"style-src 'self' 'unsafe-inline'",
			"img-src 'self' https://i.scdn.co data:", // Spotify album art
			"media-src 'self' https://*.mzstatic.com", // iTunes audio previews
			"connect-src 'self' https://*.supabase.co https://*.upstash.io",
			"frame-ancestors 'none'"
		].join('; ')
	);

	return response;
};
