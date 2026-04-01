<script lang="ts">
  import { onMount } from 'svelte';
  import { getMissionState, mergeCompleted, LAUNCH_EVENTS, type LaunchEventDef } from '../lib/mission-clock';

  interface Props {
    launchDate: string;
    configCompletedEvents?: string[];
  }

  let { launchDate, configCompletedEvents = [] }: Props = $props();

  let completedEvents = $state<string[]>([]);
  let mounted = $state(false);

  function update() {
    const state = getMissionState(launchDate);
    completedEvents = mergeCompleted(state.completedLaunchEvents, configCompletedEvents);
  }

  onMount(() => {
    mounted = true;
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  });
</script>

<div class="space-y-3">
  {#each LAUNCH_EVENTS as event, i}
    {@const isCompleted = completedEvents.includes(event.id)}
    {@const isLiftoff = event.id === 'liftoff'}
    {@const isTLI = event.id === 'tli'}
    <div class="glass-panel-sm p-4 transition-all duration-300 {isCompleted ? 'border-status-go/20' : 'opacity-50'} {isLiftoff ? 'border-nasa-orange/20' : ''} {isTLI ? 'border-mission-cyan/20' : ''}">
      <div class="flex items-start gap-3">
        <!-- Sequence number / status -->
        <div class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-display font-bold {isCompleted ? 'bg-status-go/20 text-status-go border border-status-go/30' : 'bg-white/5 text-white/20 border border-white/10'}">
          {#if isCompleted}
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          {:else}
            <span>{i + 1}</span>
          {/if}
        </div>

        <div class="flex-1 min-w-0">
          <div class="flex flex-wrap items-center gap-2 mb-1">
            <span class="font-display text-xs font-bold tracking-wider {isCompleted ? 'text-status-go' : 'text-white/30'} {isLiftoff && !isCompleted ? 'text-nasa-orange/50' : ''}">{event.time}</span>
            <span class="text-sm font-semibold {isCompleted ? 'text-white' : 'text-white/50'} {isLiftoff ? 'font-display tracking-wider text-base' : ''}">{event.title}</span>
          </div>
          <p class="text-xs text-white/30 leading-relaxed">{event.description}</p>

          <!-- Altitude / Speed indicators -->
          {#if event.altitude || event.speed}
            <div class="flex gap-4 mt-2">
              {#if event.altitude}
                <div class="text-[10px] font-mono text-white/15">
                  ALT: {event.altitude}
                </div>
              {/if}
              {#if event.speed}
                <div class="text-[10px] font-mono text-white/15">
                  VEL: {event.speed}
                </div>
              {/if}
            </div>
          {/if}
        </div>
      </div>
    </div>
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
