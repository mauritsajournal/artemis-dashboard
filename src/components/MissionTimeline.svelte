<script lang="ts">
  import { onMount } from 'svelte';
  import { getMissionState, type MissionPhase } from '../lib/mission-clock';

  interface TimelineDay {
    day: number;
    title: string;
    description: string;
    events: string[];
  }

  interface Props {
    launchDate: string;
    timeline: TimelineDay[];
  }

  let { launchDate, timeline }: Props = $props();

  let missionDay = $state(0);
  let missionPhase = $state<MissionPhase>('prelaunch');
  let mounted = $state(false);

  function update() {
    const state = getMissionState(launchDate);
    missionDay = state.missionDay;
    missionPhase = state.missionPhase;
  }

  onMount(() => {
    mounted = true;
    update();
    const interval = setInterval(update, 10000);
    return () => clearInterval(interval);
  });

  const isActive = $derived(missionPhase !== 'prelaunch' && missionPhase !== 'launch');
</script>

<!-- Header -->
<div class="flex items-center justify-between mb-4">
  <div>
    <h3 class="font-display text-sm sm:text-base font-bold tracking-wider text-white/80">Day-by-Day Timeline</h3>
    <p class="text-xs text-white/30 font-display tracking-wider mt-0.5">10-day lunar flyby mission</p>
  </div>
</div>

<!-- Progress indicator -->
{#if isActive}
  <div class="mb-6">
    <div class="flex justify-between text-[10px] text-white/20 font-display tracking-wider mb-1">
      <span>LAUNCH</span>
      <span>DAY {missionDay}/10</span>
      <span>SPLASHDOWN</span>
    </div>
    <div class="h-1.5 bg-white/5 rounded-full overflow-hidden">
      <div class="h-full bg-gradient-to-r from-nasa-orange to-mission-cyan rounded-full transition-all duration-1000"
           style="width: {(missionDay / 10) * 100}%"></div>
    </div>
  </div>
{/if}

<div class="space-y-2">
  {#each timeline as day}
    {@const isPast = isActive && day.day < missionDay}
    {@const isCurrent = isActive && day.day === missionDay}
    {@const isFuture = !isActive || day.day > missionDay}
    <details class="glass-panel-sm overflow-hidden group {isCurrent ? 'border-nasa-orange/30' : ''} {isPast ? 'border-status-go/10' : ''}" open={isCurrent}>
      <summary class="flex items-center gap-3 p-3 sm:p-4 cursor-pointer select-none hover:bg-white/2 transition-colors {isFuture && !isCurrent ? 'opacity-40' : ''}">
        <!-- Day number -->
        <div class="w-10 h-10 rounded-lg flex items-center justify-center font-display text-sm font-bold shrink-0 {isPast ? 'bg-status-go/10 text-status-go border border-status-go/20' : ''} {isCurrent ? 'bg-nasa-orange/15 text-nasa-orange border border-nasa-orange/30 animate-pulse' : ''} {isFuture && !isCurrent ? 'bg-white/3 text-white/25 border border-white/5' : ''}">
          D{day.day}
        </div>

        <div class="flex-1 min-w-0">
          <div class="text-sm sm:text-base font-semibold {isPast ? 'text-white/60' : isCurrent ? 'text-white' : 'text-white/40'}">
            {day.title}
          </div>
          <div class="text-xs text-white/20 truncate">{day.description.slice(0, 80)}...</div>
        </div>

        {#if isPast}
          <svg class="w-5 h-5 text-status-go shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
        {/if}

        <svg class="w-4 h-4 text-white/15 shrink-0 transition-transform group-open:rotate-90" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
        </svg>
      </summary>

      <div class="px-4 pb-4 pt-1 border-t border-white/3">
        <p class="text-xs text-white/35 leading-relaxed mb-3">{day.description}</p>
        <div class="space-y-1.5">
          {#each day.events as event}
            <div class="flex items-start gap-2">
              <div class="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 {isPast ? 'bg-status-go/50' : isCurrent ? 'bg-nasa-orange/50' : 'bg-white/10'}"></div>
              <span class="text-xs text-white/40">{event}</span>
            </div>
          {/each}
        </div>
      </div>
    </details>
  {/each}
</div>

<style>
  .glass-panel-sm {
    background: rgba(255, 255, 255, 0.02);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 0.75rem;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  }
</style>
