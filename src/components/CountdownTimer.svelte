<script lang="ts">
  import { onMount } from 'svelte';

  interface Props {
    launchDate: string;
    missionPhase: string;
    backupWindows?: string[];
  }

  let { launchDate, missionPhase, backupWindows = [] }: Props = $props();

  let days = $state(0);
  let hours = $state(0);
  let minutes = $state(0);
  let seconds = $state(0);
  let isPostLaunch = $state(false);
  let label = $state('T-MINUS');
  let mounted = $state(false);

  const milestones = [
    { offset: -6 * 3600, label: 'T-6h', desc: 'Propellant tanking begins', icon: 'fuel' },
    { offset: -3 * 3600, label: 'T-3h', desc: 'Crew suit-up', icon: 'suit' },
    { offset: -2 * 3600, label: 'T-2h', desc: 'Crew departs for pad', icon: 'van' },
    { offset: -3600, label: 'T-1h', desc: 'Crew ingress Orion', icon: 'capsule' },
    { offset: -1800, label: 'T-30m', desc: 'Terminal countdown', icon: 'countdown' },
    { offset: -600, label: 'T-10m', desc: 'Final GO/NO-GO polls', icon: 'poll' },
    { offset: -31, label: 'T-31s', desc: 'Automated sequence', icon: 'auto' },
    { offset: 0, label: 'T-0', desc: 'LIFTOFF', icon: 'rocket' },
  ];

  function update() {
    const now = Date.now();
    const target = new Date(launchDate).getTime();
    let diff = target - now;

    if (missionPhase !== 'prelaunch' && missionPhase !== 'launch') {
      // MET mode: count up from launch
      diff = now - target;
      isPostLaunch = true;
      label = 'MET';
    } else if (diff <= 0) {
      diff = now - target;
      isPostLaunch = true;
      label = 'MET';
    } else {
      isPostLaunch = false;
      label = 'T-MINUS';
    }

    const absDiff = Math.abs(diff);
    days = Math.floor(absDiff / 86400000);
    hours = Math.floor((absDiff % 86400000) / 3600000);
    minutes = Math.floor((absDiff % 3600000) / 60000);
    seconds = Math.floor((absDiff % 60000) / 1000);
  }

  function getMilestoneStatus(offsetSeconds: number): 'completed' | 'active' | 'upcoming' {
    const now = Date.now();
    const target = new Date(launchDate).getTime();
    const eventTime = target + offsetSeconds * 1000;
    const diff = now - eventTime;
    if (diff > 300000) return 'completed'; // >5 min past
    if (diff > -300000) return 'active'; // within 5 min
    return 'upcoming';
  }

  function pad(n: number): string {
    return n.toString().padStart(2, '0');
  }

  onMount(() => {
    mounted = true;
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  });
</script>

<div class="text-center">
  <!-- Label -->
  <div class="font-display text-sm tracking-[0.3em] text-white/30 mb-4 uppercase">
    {label}
  </div>

  <!-- Main countdown display -->
  {#if mounted}
    <div class="flex items-center justify-center gap-2 sm:gap-4 md:gap-6 mb-8">
      <!-- Days -->
      <div class="flex flex-col items-center">
        <div class="font-display text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tabular-nums countdown-digit"
             class:text-nasa-orange={!isPostLaunch}
             class:text-mission-cyan={isPostLaunch}>
          {days.toString().padStart(days > 99 ? 3 : 2, '0')}
        </div>
        <div class="font-display text-[10px] sm:text-xs tracking-[0.2em] text-white/20 mt-1">DAYS</div>
      </div>

      <div class="font-display text-3xl sm:text-5xl md:text-6xl text-white/10 self-start mt-2 sm:mt-4">:</div>

      <!-- Hours -->
      <div class="flex flex-col items-center">
        <div class="font-display text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tabular-nums countdown-digit"
             class:text-nasa-orange={!isPostLaunch}
             class:text-mission-cyan={isPostLaunch}>
          {pad(hours)}
        </div>
        <div class="font-display text-[10px] sm:text-xs tracking-[0.2em] text-white/20 mt-1">HOURS</div>
      </div>

      <div class="font-display text-3xl sm:text-5xl md:text-6xl text-white/10 self-start mt-2 sm:mt-4">:</div>

      <!-- Minutes -->
      <div class="flex flex-col items-center">
        <div class="font-display text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tabular-nums countdown-digit"
             class:text-nasa-orange={!isPostLaunch}
             class:text-mission-cyan={isPostLaunch}>
          {pad(minutes)}
        </div>
        <div class="font-display text-[10px] sm:text-xs tracking-[0.2em] text-white/20 mt-1">MINS</div>
      </div>

      <div class="font-display text-3xl sm:text-5xl md:text-6xl text-white/10 self-start mt-2 sm:mt-4">:</div>

      <!-- Seconds -->
      <div class="flex flex-col items-center">
        <div class="font-display text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tabular-nums countdown-digit countdown-seconds"
             class:text-nasa-orange={!isPostLaunch}
             class:text-mission-cyan={isPostLaunch}>
          {pad(seconds)}
        </div>
        <div class="font-display text-[10px] sm:text-xs tracking-[0.2em] text-white/20 mt-1">SECS</div>
      </div>
    </div>
  {:else}
    <div class="h-32 flex items-center justify-center">
      <div class="font-display text-white/20 tracking-widest">INITIALIZING...</div>
    </div>
  {/if}

  <!-- Launch info line -->
  <div class="font-display text-xs sm:text-sm tracking-[0.15em] text-white/25 mb-10">
    {#if isPostLaunch}
      MISSION ELAPSED TIME
    {:else}
      TARGET: {new Date(launchDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      <span class="text-white/10 mx-2">|</span>
      NET (No Earlier Than)
    {/if}
  </div>

  <!-- Milestones -->
  <div class="max-w-3xl mx-auto">
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
      {#each milestones as milestone}
        {@const status = getMilestoneStatus(milestone.offset)}
        <div class="glass-panel-sm p-3 text-center transition-all duration-500 {status === 'completed' ? 'milestone-completed' : status === 'active' ? 'milestone-active' : 'milestone-upcoming'}">
          <div class="font-display text-xs sm:text-sm font-bold tracking-wider mb-1 {status === 'completed' ? 'text-emerald-400' : status === 'active' ? 'text-orange-400' : 'text-white/30'}">
            {milestone.label}
          </div>
          <div class="text-[10px] sm:text-xs text-white/30 leading-tight">{milestone.desc}</div>
          {#if status === 'active'}
            <div class="w-full h-0.5 bg-orange-400/50 rounded mt-2 animate-pulse"></div>
          {/if}
        </div>
      {/each}
    </div>
  </div>

  <!-- Backup windows -->
  {#if !isPostLaunch && backupWindows.length > 0}
    <div class="mt-10 pt-6 border-t border-white/5">
      <div class="font-display text-xs tracking-[0.2em] text-white/20 mb-3">BACKUP LAUNCH WINDOWS</div>
      <div class="flex flex-wrap justify-center gap-3">
        {#each backupWindows as window}
          <div class="glass-panel-sm px-4 py-2">
            <span class="font-display text-xs tracking-wider text-white/40">
              {new Date(window).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  .countdown-digit {
    text-shadow: 0 0 40px currentColor, 0 0 80px currentColor;
    transition: color 0.3s ease;
  }

  .countdown-seconds {
    animation: secondTick 1s ease-in-out infinite;
  }

  @keyframes secondTick {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.85; }
  }

  .glass-panel-sm {
    background: rgba(255, 255, 255, 0.02);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 0.75rem;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  }

  .milestone-completed {
    border-color: rgba(16, 185, 129, 0.3);
  }

  .milestone-active {
    border-color: rgba(252, 61, 33, 0.5);
    box-shadow: 0 0 20px rgba(252, 61, 33, 0.1);
  }

  .milestone-upcoming {
    opacity: 0.4;
  }
</style>
