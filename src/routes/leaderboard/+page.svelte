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

    // Helper for top 3 styling
    function getRankStyle(index: number) {
        if (index === 0) return 'text-yellow-400 text-6xl shadow-gold';
        if (index === 1) return 'text-gray-300 text-5xl';
        if (index === 2) return 'text-amber-700 text-5xl';
        return 'text-white/20 text-4xl';
    }
</script>

<div class="plasma-container">
    <div class="blob blob-1"></div>
    <div class="blob blob-2"></div>
    <div class="blob blob-3"></div>
    <div class="plasma-overlay"></div>
</div>

<main class="min-h-screen text-white selection:bg-brand-orange/30 flex flex-col">
    <header class="flex items-center justify-between px-6 py-6 w-full max-w-7xl mx-auto z-20">
        <a href="/" class="group flex items-center gap-3 px-5 py-2 rounded-full glass-card hover:bg-white/10 transition-all">
            <span class="text-xs font-bold uppercase tracking-widest text-gray-400 group-hover:text-white transition-colors">← Vote</span>
        </a>

        <h1 class="text-3xl md:text-4xl font-display font-black italic uppercase tracking-tighter">
            Leader<span class="text-brand-green">board</span>
        </h1>

        <a href="/add" class="bg-brand-orange text-black px-6 py-2 rounded-full text-xs font-bold hover:bg-[#ff6a00] hover:scale-105 transition-all uppercase tracking-widest shadow-[0_0_20px_rgba(255,72,0,0.3)]">
            Add Song
        </a>
    </header>

    <section class="flex-1 w-full max-w-5xl mx-auto p-4 md:p-8 z-10 pb-20">
        {#if data.tracks.length === 0}
            <div class="glass-card p-16 text-center rounded-[2rem] max-w-2xl mx-auto border border-white/10 mt-10">
                <div class="text-6xl mb-6 grayscale opacity-50">💿</div>
                <h2 class="text-4xl font-display font-extrabold mb-4">Silence...</h2>
                <p class="text-gray-400 text-lg mb-8 font-body">No songs have been ranked yet.</p>
                <a
                    href="/add"
                    class="inline-block bg-brand-green text-black px-8 py-4 rounded-xl font-extrabold font-display uppercase tracking-widest hover:scale-105 transition-transform"
                >
                    Add First Song
                </a>
            </div>
        {:else}
            <div class="glass-card rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl">
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="border-b border-white/10 bg-black/20">
                                <th class="py-6 px-6 md:px-8 font-mono text-[10px] uppercase tracking-[0.2em] text-gray-500 w-24">Rank</th>
                                <th class="py-6 px-4 font-mono text-[10px] uppercase tracking-[0.2em] text-gray-500">Track</th>
                                <th class="py-6 px-4 font-mono text-[10px] uppercase tracking-[0.2em] text-gray-500 text-right">
                                    <a href={getSortUrl('elo_rating')} class="hover:text-white transition-colors flex items-center justify-end gap-1">
                                        Rating{getSortIndicator('elo_rating')}
                                    </a>
                                </th>
                                <th class="py-6 px-6 md:px-8 font-mono text-[10px] uppercase tracking-[0.2em] text-gray-500 text-right hidden md:table-cell">
                                    <a href={getSortUrl('matchups_won')} class="hover:text-white transition-colors flex items-center justify-end gap-1">
                                        Wins{getSortIndicator('matchups_won')}
                                    </a>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {#each data.tracks as track, index}
                                <tr class="group border-b border-white/5 hover:bg-white/[0.03] transition-colors">
                                    
                                    <td class="py-4 px-6 md:px-8 align-middle">
                                        <span class="font-display font-black italic leading-none {getRankStyle(index)}">
                                            {index + 1}
                                        </span>
                                    </td>

                                    <td class="py-4 px-4 align-middle">
                                        <div class="flex items-center gap-4 md:gap-6">
                                            <div class="relative w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-lg overflow-hidden shadow-lg bg-black">
                                                {#if track.cover_image_url}
                                                    <img
                                                        src={track.cover_image_url}
                                                        alt="{track.title} cover"
                                                        class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                    />
                                                {:else}
                                                    <div class="w-full h-full flex items-center justify-center bg-gray-800">
                                                        <span class="text-xl">🎵</span>
                                                    </div>
                                                {/if}
                                                <div class="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-lg"></div>
                                            </div>
                                            
                                            <div>
                                                <p class="font-display font-bold text-lg md:text-xl uppercase leading-tight text-white group-hover:text-brand-orange transition-colors line-clamp-1">
                                                    {track.title}
                                                </p>
                                                <p class="font-body text-xs font-bold text-gray-500 tracking-widest uppercase mt-1">
                                                    {track.artist}
                                                </p>
                                            </div>
                                        </div>
                                    </td>

                                    <td class="py-4 px-4 text-right align-middle">
                                        <div class="inline-flex flex-col items-end">
                                            <span class="font-display font-black text-2xl md:text-3xl {track.elo_rating >= 1200 ? 'text-brand-green' : 'text-white'}">
                                                {track.elo_rating}
                                            </span>
                                            <span class="text-[9px] font-mono text-gray-600 uppercase tracking-widest">ELO</span>
                                        </div>
                                    </td>

                                    <td class="py-4 px-6 md:px-8 text-right align-middle hidden md:table-cell">
                                        <span class="font-display font-bold text-xl text-gray-400 group-hover:text-white transition-colors">
                                            {track.matchups_won}
                                        </span>
                                    </td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
            </div>

            <p class="text-center font-mono text-[10px] uppercase tracking-[0.3em] text-gray-500 mt-8 opacity-60">
                Tracking {data.tracks.length} Songs in the Archive
            </p>
        {/if}
    </section>
</main>