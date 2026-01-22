<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let searchQuery = $state(data.query || '');
	let isSearching = $state(false);
	let isAdding = $state(false);

	let canSearch = $derived(searchQuery.length >= 2 && !isSearching);

	function handleSearch() {
		if (!canSearch) return;

		isSearching = true;
		goto(`/add?q=${encodeURIComponent(searchQuery)}`).finally(() => {
			isSearching = false;
		});
	}
</script>

<main class="min-h-screen bg-gray-900 text-white">
	<header class="flex items-center justify-between p-4 border-b border-gray-800">
		<a href="/" class="text-green-400 hover:text-green-300 flex items-center gap-2">
			<span>←</span> Back to Voting
		</a>
		<h1 class="text-2xl font-bold">Add Song</h1>
		<div class="w-24"></div>
	</header>

	<section class="p-4 md:p-8 max-w-2xl mx-auto">
		<!-- Search Form -->
		<form action="/add" method="GET" class="mb-8">
			<div class="flex gap-2">
				<input
					type="text"
					name="q"
					value={data.query || ''}
					placeholder="Search for a song..."
					class="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-green-500 transition-colors"
					minlength="2"
					required
				/>
				<button
					type="submit"
					class="px-6 py-3 bg-green-600 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
				>
					Search
				</button>
			</div>
		</form>

		{#if form?.error}
			<div class="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-lg text-red-200">
				{form.error}
			</div>
		{/if}

		{#if data.error}
			<div class="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-lg text-red-200">
				{data.error}
			</div>
		{/if}

		<!-- Search Results -->
		{#if data.searchResults.length > 0}
			<h2 class="text-lg font-semibold mb-4 text-gray-300">Search Results</h2>
			<div class="space-y-3">
				{#each data.searchResults as track}
					<div
						class="flex items-center gap-4 p-4 bg-gray-800 rounded-lg {track.alreadyExists ? 'opacity-50' : ''}"
					>
						{#if track.coverUrl}
							<img
								src={track.coverUrl}
								alt="{track.title} cover"
								class="w-16 h-16 rounded object-cover"
							/>
						{:else}
							<div class="w-16 h-16 bg-gray-700 rounded flex items-center justify-center">
								<span class="text-2xl">🎵</span>
							</div>
						{/if}

						<div class="flex-1 min-w-0">
							<p class="font-semibold truncate">{track.title}</p>
							<p class="text-sm text-gray-400 truncate">{track.artist}</p>
							{#if !track.isrc}
								<p class="text-xs text-yellow-500">No ISRC available</p>
							{/if}
						</div>

						{#if track.alreadyExists}
							<span class="px-3 py-1 bg-gray-700 rounded text-sm text-gray-400">
								Already added
							</span>
						{:else if track.isrc}
							<form
								method="POST"
								action="?/add"
								use:enhance={() => {
									isAdding = true;
									return async ({ update }) => {
										await update();
										isAdding = false;
									};
								}}
							>
								<input type="hidden" name="isrc" value={track.isrc} />
								<input type="hidden" name="title" value={track.title} />
								<input type="hidden" name="artist" value={track.artist} />
								<input type="hidden" name="cover_url" value={track.coverUrl ?? ''} />
								<button
									type="submit"
									disabled={isAdding}
									class="px-4 py-2 bg-green-600 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors"
								>
									{isAdding ? 'Adding...' : 'Add'}
								</button>
							</form>
						{:else}
							<span class="px-3 py-1 bg-gray-700 rounded text-sm text-gray-400">
								Unavailable
							</span>
						{/if}
					</div>
				{/each}
			</div>
		{:else if data.query}
			<div class="text-center py-8 text-gray-500">
				<p>No results found for "{data.query}"</p>
				<p class="text-sm mt-2">Try a different search term</p>
			</div>
		{:else}
			<div class="text-center py-8 text-gray-500">
				<div class="text-6xl mb-4">🔍</div>
				<p>Search for songs on Spotify to add them to GSOAT</p>
			</div>
		{/if}
	</section>
</main>
