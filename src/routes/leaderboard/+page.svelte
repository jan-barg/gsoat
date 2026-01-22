<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	function getSortUrl(column: string): string {
		const newOrder = data.sortBy === column && data.order === 'desc' ? 'asc' : 'desc';
		return `?sort=${column}&order=${newOrder}`;
	}

	function getSortIndicator(column: string): string {
		if (data.sortBy !== column) return '';
		return data.order === 'desc' ? ' ↓' : ' ↑';
	}
</script>

<main class="min-h-screen bg-gray-900 text-white">
	<header class="flex items-center justify-between p-4 border-b border-gray-800">
		<a href="/" class="text-green-400 hover:text-green-300 flex items-center gap-2">
			<span>←</span> Back to Voting
		</a>
		<h1 class="text-2xl font-bold">Leaderboard</h1>
		<a
			href="/add"
			class="rounded-lg bg-green-600 px-4 py-2 font-semibold hover:bg-green-700 transition-colors"
		>
			Add Song
		</a>
	</header>

	<section class="p-4 md:p-8 max-w-6xl mx-auto">
		{#if data.tracks.length === 0}
			<div class="text-center py-16">
				<div class="text-6xl mb-4">🎵</div>
				<p class="text-xl text-gray-300 mb-2">No songs yet</p>
				<p class="text-gray-500 mb-6">Add some songs to start ranking!</p>
				<a
					href="/add"
					class="inline-block rounded-lg bg-green-600 px-6 py-3 font-semibold hover:bg-green-700 transition-colors"
				>
					Add First Song
				</a>
			</div>
		{:else}
			<div class="overflow-x-auto">
				<table class="w-full">
					<thead>
						<tr class="border-b border-gray-700 text-left">
							<th class="py-3 px-4 font-semibold text-gray-400">#</th>
							<th class="py-3 px-4 font-semibold text-gray-400">Song</th>
							<th class="py-3 px-4 font-semibold text-gray-400">
								<a
									href={getSortUrl('elo_rating')}
									class="hover:text-white transition-colors"
								>
									ELO Rating{getSortIndicator('elo_rating')}
								</a>
							</th>
							<th class="py-3 px-4 font-semibold text-gray-400">
								<a
									href={getSortUrl('matchups_won')}
									class="hover:text-white transition-colors"
								>
									Wins{getSortIndicator('matchups_won')}
								</a>
							</th>
						</tr>
					</thead>
					<tbody>
						{#each data.tracks as track, index}
							<tr class="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
								<td class="py-4 px-4 text-gray-500 font-mono">
									{index + 1}
								</td>
								<td class="py-4 px-4">
									<div class="flex items-center gap-4">
										{#if track.cover_image_url}
											<img
												src={track.cover_image_url}
												alt="{track.title} cover"
												class="w-12 h-12 rounded object-cover"
											/>
										{:else}
											<div class="w-12 h-12 bg-gray-700 rounded flex items-center justify-center">
												<span class="text-xl">🎵</span>
											</div>
										{/if}
										<div>
											<p class="font-semibold">{track.title}</p>
											<p class="text-sm text-gray-400">{track.artist}</p>
										</div>
									</div>
								</td>
								<td class="py-4 px-4">
									<span class="font-mono text-lg {track.elo_rating >= 1200 ? 'text-green-400' : 'text-red-400'}">
										{track.elo_rating}
									</span>
								</td>
								<td class="py-4 px-4 font-mono">
									{track.matchups_won}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>

			<p class="text-center text-gray-500 text-sm mt-6">
				{data.tracks.length} song{data.tracks.length === 1 ? '' : 's'} ranked
			</p>
		{/if}
	</section>
</main>
