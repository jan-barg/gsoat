<script lang="ts">
	// Voting Arena - Root page
	// TODO: Implement matchup voting UI
</script>

<main class="min-h-screen bg-gray-900 text-white">
	<header class="flex items-center justify-between p-4">
		<div class="text-sm">
			<p>Total Songs: <span class="font-bold">0</span></p>
			<p>Total Votes: <span class="font-bold">0</span></p>
		</div>
		<a
			href="/add"
			class="rounded-lg bg-green-600 px-4 py-2 font-semibold hover:bg-green-700"
		>
			Add Song
		</a>
	</header>

	<section class="flex flex-col items-center justify-center p-8">
		<h1 class="mb-8 text-4xl font-bold">GSOAT</h1>
		<p class="text-gray-400">Vote for the Greatest Song of All Time</p>

		<!-- TODO: Matchup cards will go here -->
		<div class="mt-8 text-center text-gray-500">
			<p>No matchups available yet. Add some songs to get started!</p>
		</div>
	</section>
</main>
