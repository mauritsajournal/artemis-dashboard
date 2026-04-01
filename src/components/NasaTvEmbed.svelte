<script lang="ts">
  interface Props {
    videoId: string;
  }

  let { videoId }: Props = $props();
  let showStream = $state(false);
</script>

<div class="glass-panel-sm overflow-hidden">
  <div class="p-4">
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-2">
        <div class="w-2 h-2 rounded-full bg-red-500" class:animate-pulse={showStream}></div>
        <span class="font-display text-xs tracking-[0.15em] font-semibold text-white/40">NASA TV</span>
      </div>
      <button
        onclick={() => showStream = !showStream}
        class="px-3 py-1 rounded-lg font-display text-[10px] tracking-wider font-semibold transition-all border {showStream ? 'bg-white/10 text-white border-white/20' : 'bg-white/3 text-white/30 border-white/5 hover:bg-white/5 hover:text-white/50'}"
      >
        {showStream ? 'HIDE STREAM' : 'SHOW STREAM'}
      </button>
    </div>

    {#if showStream}
      <div class="aspect-video rounded-lg overflow-hidden bg-black/50">
        {#if videoId}
          <iframe
            src="https://www.youtube.com/embed/{videoId}?autoplay=0&rel=0"
            title="NASA TV Live Stream"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
            class="w-full h-full"
            loading="lazy"
          ></iframe>
        {:else}
          <div class="w-full h-full flex items-center justify-center">
            <div class="text-center">
              <div class="font-display text-sm text-white/20 tracking-widest mb-2">STREAM OFFLINE</div>
              <div class="text-xs text-white/10">No active NASA TV stream configured</div>
            </div>
          </div>
        {/if}
      </div>
    {:else}
      <div class="aspect-video rounded-lg bg-black/20 flex items-center justify-center border border-white/3">
        <div class="text-center">
          <svg class="w-12 h-12 text-white/10 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
          <div class="font-display text-xs text-white/15 tracking-widest">CLICK SHOW TO LOAD STREAM</div>
          <div class="text-[10px] text-white/8 mt-1">Hidden by default to save bandwidth</div>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .glass-panel-sm {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 0.75rem;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
  }
</style>
