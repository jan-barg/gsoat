<script lang="ts">
    import { enhance } from '$app/forms';
    import type { PageData, ActionData } from './$types';

    let { data, form }: { data: PageData; form: ActionData } = $props();
    let isAdding = $state(false);
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
            Add <span class="text-brand-green">Song</span>
        </h1>

        <div class="w-24 hidden md:block"></div>
        <a href="/leaderboard" class="md:hidden text-[10px] font-bold uppercase tracking-widest text-gray-500">Ranks</a>
    </header>

    <section class="flex-1 w-full max-w-3xl mx-auto p-4 md:p-8 z-10 pb-20">
        
        <form action="/add" method="GET" class="mb-10 relative group">
            <div class="relative">
                <input
                    type="text"
                    name="q"
                    value={data.query ?? ''}
                    placeholder="Search Spotify..."
                    class="w-full pl-8 pr-32 py-6 bg-black/30 backdrop-blur-xl border border-white/10 rounded-full text-lg md:text-xl font-body font-medium text-white placeholder-white/20 focus:outline-none focus:border-brand-green/50 focus:bg-black/50 transition-all shadow-2xl"
                    minlength="2"
                    required
                    autocomplete="off"
                />
                <div class="absolute right-2 top-2 bottom-2">
                    <button
                        type="submit"
                        class="h-full px-8 rounded-full bg-white/5 hover:bg-white/10 text-xs font-bold uppercase tracking-widest border border-white/5 transition-all text-gray-300 hover:text-white"
                    >
                        Search
                    </button>
                </div>
            </div>
            <div class="absolute -inset-1 bg-gradient-to-r from-brand-green/0 via-brand-green/20 to-brand-green/0 rounded-full blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-700 -z-10"></div>
        </form>

        {#if form?.error}
            <div class="glass-card mb-6 p-4 border-l-4 border-red-500 text-red-200 flex items-center gap-3">
                <span>⚠️</span>
                <span class="text-sm font-bold">{form.error}</span>
            </div>
        {/if}

        {#if data.error}
            <div class="glass-card mb-6 p-4 border-l-4 border-red-500 text-red-200 flex items-center gap-3">
                <span>⚠️</span>
                <span class="text-sm font-bold">{data.error}</span>
            </div>
        {/if}

        {#if data.searchResults.length > 0}
            <div class="flex items-end justify-between mb-6 px-2">
                <h2 class="text-sm font-bold uppercase tracking-widest text-gray-500">Results</h2>
                <span class="text-[10px] font-mono text-gray-600">Select a track to add</span>
            </div>

            <div class="space-y-4">
                {#each data.searchResults as track}
                    <div class="glass-card rounded-2xl p-4 flex items-center gap-5 group hover:border-white/20 transition-all duration-300 {track.alreadyExists ? 'opacity-50 grayscale hover:grayscale-0' : ''}">
                        
                        <div class="relative w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-lg overflow-hidden shadow-lg bg-black">
                            {#if track.coverUrl}
                                <img
                                    src={track.coverUrl}
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

                        <div class="flex-1 min-w-0">
                            <h3 class="font-display font-bold text-lg leading-tight mb-1 truncate text-white">
                                {track.title}
                            </h3>
                            <p class="font-mono text-xs font-bold text-brand-orange uppercase tracking-widest truncate">
                                {track.artist}
                            </p>
                            {#if !track.isrc}
                                <p class="text-[10px] text-red-400 mt-1 uppercase tracking-wider">No ISRC</p>
                            {/if}
                        </div>

                        <div class="shrink-0">
                            {#if track.alreadyExists}
                                <span class="px-4 py-2 border border-white/5 bg-white/5 rounded-lg text-[10px] font-bold uppercase tracking-widest text-gray-500 cursor-not-allowed">
                                    Added
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
                                    <input type="hidden" name="spotify_id" value={track.spotifyId ?? ''} />
                                    <button
                                        type="submit"
                                        disabled={isAdding}
                                        class="px-6 py-3 bg-brand-green text-black rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-[#00ffbb] hover:shadow-[0_0_15px_rgba(0,255,140,0.4)] disabled:opacity-50 disabled:cursor-wait transition-all"
                                    >
                                        {isAdding ? '...' : 'Add'}
                                    </button>
                                </form>
                            {:else}
                                <span class="px-4 py-2 border border-white/5 bg-white/5 rounded-lg text-[10px] font-bold uppercase tracking-widest text-gray-600 cursor-not-allowed">
                                    N/A
                                </span>
                            {/if}
                        </div>
                    </div>
                {/each}
            </div>
            
        {:else if data.query}
            <div class="glass-card p-12 text-center rounded-[2rem] border border-white/10 mt-8">
                <div class="text-5xl mb-4 grayscale opacity-40">🤔</div>
                <h3 class="text-2xl font-display font-bold mb-2">No tracks found</h3>
                <p class="text-gray-400 text-sm">We couldn't find "{data.query}" on Spotify.</p>
            </div>
        {:else}
            <div class="mt-20 text-center opacity-40">
                <div class="text-6xl mb-6 grayscale">🎹</div>
                <h3 class="text-xl font-display font-bold mb-2 uppercase tracking-widest">Build the Archive</h3>
                <p class="text-sm font-mono text-gray-400">Search for a track to nominate it for GSOAT.</p>
            </div>
        {/if}
    </section>
</main>