import type { PageServerLoad } from './$types';
import { supabaseAdmin } from '$lib/server/supabase';

export const load: PageServerLoad = async ({ url }) => {
	const sortBy = url.searchParams.get('sort') || 'elo_rating';
	const order = url.searchParams.get('order') || 'desc';

	// Validate sort column
	const validSortColumns = ['elo_rating', 'matchups_won', 'title', 'artist'];
	const column = validSortColumns.includes(sortBy) ? sortBy : 'elo_rating';

	const { data: tracks, error } = await supabaseAdmin
		.from('tracks')
		.select('id, title, artist, cover_image_url, elo_rating, matchups_won')
		.order(column, { ascending: order === 'asc' });

	if (error) {
		return {
			tracks: [],
			sortBy: column,
			order
		};
	}

	return {
		tracks: tracks ?? [],
		sortBy: column,
		order
	};
};
