<script lang="ts">
    import { enhance } from '$app/forms';
    import AudioPlayer from '$lib/components/AudioPlayer.svelte';
    import type { PageData, ActionData } from './$types';

    let { data, form }: { data: PageData; form: ActionData } = $props();
    let isSubmitting = $state(false);
</script>

<div class="plasma-container">
    <div class="blob blob-1"></div>
    <div class="blob blob-2"></div>
    <div class="blob blob-3"></div>
    <div class="plasma-overlay"></div>
</div>

<main class="min-h-screen text-white selection:bg-brand-orange/30 flex flex-col">
    
    <header class="flex items-center justify-between px-6 py-4 w-full max-w-7xl mx-auto z-20">
        <div class="flex gap-6">
            <div class="group cursor-default">
                <p class="text-[9px] font-bold uppercase tracking-widest text-white/40 group-hover:text-brand-orange transition-colors">Songs</p>
                <p class="text-sm font-display font-extrabold">{data.stats.totalSongs}</p>
            </div>
            <div class="group cursor-default">
                <p class="text-[9px] font-bold uppercase tracking-widest text-white/40 group-hover:text-brand-green transition-colors">Votes</p>
                <p class="text-sm font-display font-extrabold">{data.stats.totalVotes}</p>
            </div>
        </div>

        <nav class="flex gap-3">
            <a href="/leaderboard" class="glass-card px-4 py-2 rounded-lg text-[10px] font-bold hover:bg-white/10 transition-all uppercase tracking-widest">Leaderboard</a>
            <a href="/add" class="bg-brand-green text-black px-4 py-2 rounded-lg text-[10px] font-bold hover:bg-[#00ffbb] transition-all uppercase tracking-widest shadow-[0_0_15px_rgba(0,255,140,0.2)]">Add Song</a>
        </nav>
    </header>

    <section class="flex-1 flex flex-col items-center justify-center p-4 w-full max-w-6xl mx-auto z-10">
        
        <div class="text-center mb-6 md:mb-10 relative">
            <h1 class="text-7xl md:text-9xl font-display font-black italic tracking-tighter uppercase leading-[0.8] mb-4 drop-shadow-2xl">
                GS<span class="text-brand-orange">OA</span>T
            </h1>
            
            <div class="flex items-center justify-center gap-4 opacity-60">
                <div class="h-px w-8 bg-gradient-to-r from-transparent to-white/50"></div>
                <p class="text-white font-mono text-[10px] uppercase tracking-[0.3em]">by Jan Barg</p>
                <div class="h-px w-8 bg-gradient-to-l from-transparent to-white/50"></div>
            </div>
        </div>

        {#if data.matchup}
            <div class="w-full max-w-4xl">
                
                <div class="relative grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 items-start">
                    
                    <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 hidden md:flex items-center justify-center w-20 h-20 rounded-full bg-[#0a0a0a] border border-gray-800 shadow-[0_0_40px_rgba(0,0,0,0.8)]">
                        <span class="font-display font-black italic text-2xl text-white">VS</span>
                    </div>

                    {#each [data.matchup.songA, data.matchup.songB] as song, i}
                        {@const isWinnerA = i === 0}
                        
                        <div class="glass-card rounded-[1.5rem] p-5 md:p-6 flex flex-col group transition-all duration-300 hover:border-white/20 relative overflow-hidden">
                            <span class="absolute -right-4 -top-6 text-9xl font-display font-extrabold text-white/5 pointer-events-none select-none italic">
                                {i + 1}
                            </span>
                            
                            <div class="relative w-full aspect-square mb-5 rounded-xl overflow-hidden shadow-2xl bg-black">
                                {#if song.cover_image_url}
                                    <img src={song.cover_image_url} alt={song.title} class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                                {:else}
                                    <div class="w-full h-full flex items-center justify-center bg-gray-900">
                                        <span class="text-4xl">🎵</span>
                                    </div>
                                {/if}
                                <div class="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.3)] pointer-events-none"></div>
                            </div>

                            <div class="mb-4 relative z-10">
                                <h2 class="text-2xl font-display font-extrabold leading-[0.9] uppercase mb-2 line-clamp-2" title={song.title}>
                                    {song.title}
                                </h2>
                                <p class="text-brand-orange font-bold text-xs tracking-widest uppercase opacity-90 truncate">{song.artist}</p>
                            </div>

                            <div class="mb-5 opacity-70 group-hover:opacity-100 transition-opacity">
                                <AudioPlayer spotifyId={song.spotify_id} />
                            </div>

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
                                class="mt-auto"
                            >
                                <input type="hidden" name="matchup_token" value={data.matchup.token} />
                                <input type="hidden" name="winner_id" value={song.id} />
                                <input type="hidden" name="loser_id" value={isWinnerA ? data.matchup.songB.id : data.matchup.songA.id} />
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    class="w-full py-4 rounded-xl font-display font-extrabold uppercase tracking-widest transition-all transform active:scale-[0.98]
                                    {isWinnerA 
                                        ? 'bg-brand-orange text-black hover:bg-[#ff6a00] hover:shadow-[0_0_30px_rgba(255,72,0,0.5)]' 
                                        : 'bg-brand-green text-black hover:bg-[#00ffbb] hover:shadow-[0_0_30px_rgba(0,255,157,0.5)]'}
                                    disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                                >
                                    {isSubmitting ? '...' : 'Vote'}
                                </button>
                            </form>
                        </div>
                    {/each}
                </div>

                <div class="mt-8 flex justify-center pb-8">
                    <form method="POST" action="?/skip" use:enhance class="w-full max-w-xs">
                        <button 
                            type="submit" 
                            class="w-full py-3 rounded-xl bg-white/5 border border-white/5 text-gray-400 font-bold uppercase tracking-[0.15em] text-xs hover:bg-white/10 hover:text-white hover:border-white/20 transition-all flex items-center justify-center gap-2 group backdrop-blur-sm"
                        >
                            <span>Skip Matchup</span>
                            <span class="group-hover:translate-x-1 transition-transform">→</span>
                        </button>
                    </form>
                </div>
            </div>
        {:else}
            <div class="glass-card p-12 text-center rounded-[2rem] max-w-2xl border border-white/10">
                <div class="text-6xl mb-6">🎉</div>
                <h2 class="text-4xl font-display font-extrabold mb-4">Legendary Status.</h2>
                <p class="text-gray-400 text-lg mb-8 max-w-md mx-auto">You have voted on every single matchup in the database.</p>
                <a href="/add" class="inline-block bg-brand-orange text-black px-10 py-4 rounded-full font-extrabold font-display uppercase tracking-widest hover:scale-105 transition-transform shadow-[0_0_30px_rgba(255,72,0,0.4)]">
                    Add New Songs
                </a>
            </div>
        {/if}
    </section>
</main>