# GSOAT

A music voting app to find the Greatest Song of All Time. Songs go head-to-head, you pick the winner, ELO ratings update.

## Stack

- SvelteKit 2 + Svelte 5
- Tailwind CSS v4
- Supabase (Postgres)
- Upstash Redis (rate limiting)
- Spotify API (search + embeds)

## How it works

1. Two songs appear side by side with Spotify preview players
2. Pick the better one
3. ELO ratings adjust (K-factor 32)
4. Repeat until you've voted on everything or get bored

The matchmaking tries to pair songs with similar ratings so matchups stay competitive.

You can add songs by searching for any track available through Spotify.

Leaderboard allows you to sort the songs by ELO score (asc & desc) and matchups (asc & desc).

## Link

https://gsoat.vercel.app

## Routes

- `/` - voting arena
- `/leaderboard` - rankings sorted by ELO
- `/add` - search Spotify and add new songs

## Notes

- Votes are tied to browser session (cookie-based, no auth)
- Rate limited to 15 votes/minute per IP
- Each song pair can only be voted on once per session
- Matchup tokens expire after 10 minutes to prevent replay attacks

Hope you have fun <33