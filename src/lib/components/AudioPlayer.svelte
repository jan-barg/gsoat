<script lang="ts">
	type Props = {
		spotifyId: string | null | undefined;
	};

	let { spotifyId }: Props = $props();
</script>

{#if spotifyId}
	<div class="mt-3">
		<iframe
			src="https://open.spotify.com/embed/track/{spotifyId}?utm_source=generator&theme=0"
			width="100%"
			height="80"
			frameborder="0"
			allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
			loading="lazy"
			title="Spotify Player"
			class="rounded-lg"
		></iframe>
	</div>
{:else}
	<div class="flex items-center gap-2 mt-3 text-gray-500 text-sm">
		<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636a9 9 0 11-12.728 12.728 9 9 0 0112.728-12.728z"/>
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 9l-6 6M9 9l6 6"/>
		</svg>
		<span>No preview available</span>
	</div>
{/if}
