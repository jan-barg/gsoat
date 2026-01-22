<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let isSubmitting = $state(false);
</script>

<main class="min-h-screen bg-gray-900 text-white">
	<header class="flex items-center justify-between p-4 border-b border-gray-800">
		<div class="text-sm text-gray-400">
			<p>Total Songs: <span class="font-bold text-white">{data.stats.totalSongs}</span></p>
			<p>Total Votes: <span class="font-bold text-white">{data.stats.totalVotes}</span></p>
		</div>
		<nav class="flex gap-4">
			<a
				href="/leaderboard"
				class="rounded-lg bg-gray-700 px-4 py-2 font-semibold hover:bg-gray-600 transition-colors"
			>
				Leaderboard
			</a>
			<a
				href="/add"
				class="rounded-lg bg-green-600 px-4 py-2 font-semibold hover:bg-green-700 transition-colors"
			>
				Add Song
			</a>
		</nav>
	</header>

	<section class="flex flex-col items-center justify-center p-8">
		<h1 class="mb-2 text-4xl font-bold">GSOAT</h1>
		<p class="text-gray-400 mb-8">Vote for the Greatest Song of All Time</p>

		{#if form?.error}
			<div class="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-lg text-red-200">
				{form.error}
			</div>
		{/if}

		{#if data.matchup}
			<div class="w-full max-w-4xl">
				<p class="text-center text-gray-400 mb-6">Which song is better?</p>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
					<!-- Song A -->
					<form
						method="POST"
						action="?/vote"
						use:enhance={() => {
							isSubmitting = true;
							return async ({ update }) => {
								await update();
								isSubmitting = false;
							};
						}}
					>
						<input type="hidden" name="matchup_token" value={data.matchup.token} />
						<input type="hidden" name="winner_id" value={data.matchup.songA.id} />
						<input type="hidden" name="loser_id" value={data.matchup.songB.id} />
						<button
							type="submit"
							disabled={isSubmitting}
							class="group relative bg-gray-800 rounded-xl p-6 hover:bg-gray-700 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed border-2 border-transparent hover:border-green-500 focus:border-green-500 focus:outline-none w-full"
						>
						{#if data.matchup.songA.cover_image_url}
							<img
								src={data.matchup.songA.cover_image_url}
								alt="{data.matchup.songA.title} cover"
								class="w-full aspect-square object-cover rounded-lg mb-4"
							/>
						{:else}
							<div class="w-full aspect-square bg-gray-700 rounded-lg mb-4 flex items-center justify-center">
								<span class="text-6xl">🎵</span>
							</div>
						{/if}
						<h2 class="text-xl font-bold truncate">{data.matchup.songA.title}</h2>
						<p class="text-gray-400 truncate">{data.matchup.songA.artist}</p>
						<div class="absolute inset-0 flex items-center justify-center bg-green-600/90 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
							<span class="text-2xl font-bold">Vote</span>
						</div>
					</button>
					</form>

					<!-- Song B -->
					<form
						method="POST"
						action="?/vote"
						use:enhance={() => {
							isSubmitting = true;
							return async ({ update }) => {
								await update();
								isSubmitting = false;
							};
						}}
					>
						<input type="hidden" name="matchup_token" value={data.matchup.token} />
						<input type="hidden" name="winner_id" value={data.matchup.songB.id} />
						<input type="hidden" name="loser_id" value={data.matchup.songA.id} />
						<button
							type="submit"
							disabled={isSubmitting}
							class="group relative bg-gray-800 rounded-xl p-6 hover:bg-gray-700 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed border-2 border-transparent hover:border-green-500 focus:border-green-500 focus:outline-none w-full"
						>
						{#if data.matchup.songB.cover_image_url}
							<img
								src={data.matchup.songB.cover_image_url}
								alt="{data.matchup.songB.title} cover"
								class="w-full aspect-square object-cover rounded-lg mb-4"
							/>
						{:else}
							<div class="w-full aspect-square bg-gray-700 rounded-lg mb-4 flex items-center justify-center">
								<span class="text-6xl">🎵</span>
							</div>
						{/if}
						<h2 class="text-xl font-bold truncate">{data.matchup.songB.title}</h2>
						<p class="text-gray-400 truncate">{data.matchup.songB.artist}</p>
						<div class="absolute inset-0 flex items-center justify-center bg-green-600/90 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
							<span class="text-2xl font-bold">Vote</span>
						</div>
					</button>
					</form>
				</div>

				<p class="text-center text-gray-500 text-sm mt-6">
					Click on your choice to vote
				</p>
			</div>
		{:else}
			<div class="text-center">
				<div class="text-6xl mb-4">🎉</div>
				<p class="text-xl text-gray-300 mb-2">All pairs voted on!</p>
				<p class="text-gray-500 mb-6">You've voted on all available song matchups.</p>
				<a
					href="/add"
					class="inline-block rounded-lg bg-green-600 px-6 py-3 font-semibold hover:bg-green-700 transition-colors"
				>
					Add New Song
				</a>
			</div>
		{/if}
	</section>
</main>
