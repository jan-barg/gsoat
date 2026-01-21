<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<title>GSOAT - Greatest Song of All Time</title>
	<meta name="description" content="Vote for the greatest song of all time in 1v1 matchups" />
</svelte:head>

{@render children()}
