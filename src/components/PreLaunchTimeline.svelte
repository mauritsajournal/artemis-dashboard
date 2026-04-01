<script lang="ts">
  import { onMount } from 'svelte';

  interface Props {
    launchDate: string;
  }

  let { launchDate }: Props = $props();

  let mounted = $state(false);
  let tick = $state(0);

  interface TimelineEvent {
    offsetHours: number;
    label: string;
    title: string;
    description: string;
  }

  const events: TimelineEvent[] = [
    { offsetHours: -38, label: 'T-38h', title: 'Launch Readiness Review', description: 'Final review of all systems, weather, and range safety. GO/NO-GO decision for propellant loading.' },
    { offsetHours: -11, label: 'T-11h', title: 'Launch Countdown Begins', description: 'Official countdown clock starts. Ground systems power-up sequence initiated.' },
    { offsetHours: -8, label: 'T-8h', title: 'Clear Pad for Tanking', description: 'All non-essential personnel evacuate the pad area. Hazardous operations zone established.' },
    { offsetHours: -6, label: 'T-6h', title: 'Propellant Loading Begins', description: 'Liquid oxygen and liquid hydrogen loading into SLS core stage. Over 2.6 million liters of cryogenic propellant.' },
    { offsetHours: -3.25, label: 'T-3h15m', title: 'Crew Wake-up', description: 'Flight crew awakened at Kennedy Space Center crew quarters. Final medical checks and meal.' },
    { offsetHours: -3, label: 'T-3h', title: 'Crew Suit-up', description: 'Astronauts don Advanced Crew Escape Suits (ACES) — the iconic orange launch-entry suits.' },
    { offsetHours: -2.5, label: 'T-2h30m', title: 'Crew Walkout & Astrovan Ride', description: 'Crew walks out of Neil Armstrong Operations & Checkout Building. Astrovan II drives to Launch Pad 39B.' },
    { offsetHours: -2, label: 'T-2h', title: 'Crew Ingress Orion', description: 'All four astronauts board the Orion spacecraft. Seats configured, comm checks, survival kit verification.' },
    { offsetHours: -1, label: 'T-1h', title: 'Hatch Close & Leak Check', description: 'Orion side hatch closed and sealed. Cabin pressure leak check to verify spacecraft integrity.' },
    { offsetHours: -0.5, label: 'T-30m', title: 'Terminal Countdown', description: 'Terminal countdown sequence begins. Final system checks, range clear for launch.' },
    { offsetHours: -10/60, label: 'T-10m', title: 'Final GO/NO-GO Polls', description: 'Launch director polls all stations for final GO/NO-GO. Artemis Launch Director confirms GO for launch.' },
    { offsetHours: -2/60, label: 'T-2m', title: 'Orion to Internal Power', description: 'Orion spacecraft switches to internal battery power. Ground umbilicals prepared for disconnect.' },
    { offsetHours: -31/3600, label: 'T-31s', title: 'Automated Launch Sequence', description: 'Ground Launch Sequencer takes over. Automated final checks: hydraulics, engine gimbal, flight termination system.' },
    { offsetHours: 0, label: 'T-0', title: 'LIFTOFF', description: 'RS-25 engines at full thrust, SRB ignition, hold-down bolt separation. SLS clears the tower. GO ARTEMIS!' },
  ];

  function getEventTime(offsetHours: number): Date {
    const launch = new Date(launchDate);
    return new Date(launch.getTime() + offsetHours * 3600000);
  }

  function getEventStatus(offsetHours: number): 'completed' | 'active' | 'upcoming' {
    const now = Date.now();
    const eventTime = getEventTime(offsetHours).getTime();
    const idx = events.findIndex(e => e.offsetHours === offsetHours);
    const nextIdx = events.findIndex(e => getEventTime(e.offsetHours).getTime() > now);
    const currentIdx = nextIdx === -1 ? events.length : nextIdx;

    if (now >= eventTime + 300000) return 'completed';
    if (idx === currentIdx - 1 || (now >= eventTime - 300000 && now < eventTime + 300000)) return 'active';
    return now >= eventTime ? 'completed' : 'upcoming';
  }

  function formatTime(date: Date): string {
    const edt = date.toLocaleString('en-US', { timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit', hour12: false });
    const cest = date.toLocaleString('en-US', { timeZone: 'Europe/Amsterdam', hour: '2-digit', minute: '2-digit', hour12: false });
    return `${edt} EDT / ${cest} CEST`;
  }

  onMount(() => {
    mounted = true;
    const interval = setInterval(() => { tick += 1; }, 5000);
    return () => clearInterval(interval);
  });
</script>

<!-- Header -->
<div class="flex items-center justify-between mb-4">
  <div>
    <h3 class="font-display text-sm sm:text-base font-bold tracking-wider text-white/80">Pre-Launch Timeline</h3>
    <p class="text-xs text-white/30 font-display tracking-wider mt-0.5">Countdown milestones to liftoff</p>
  </div>
</div>

<div class="relative">
  <!-- Vertical connector line -->
  <div class="absolute left-4 sm:left-6 top-0 bottom-0 w-px bg-gradient-to-b from-white/10 via-white/5 to-transparent"></div>

  <div class="space-y-1">
    {#each events as event}
      {@const status = mounted ? getEventStatus(event.offsetHours) : 'upcoming'}
      {@const time = getEventTime(event.offsetHours)}
      {@const isLiftoff = event.offsetHours === 0}
      <!-- force re-eval on tick: {tick} -->
      <div class="relative pl-10 sm:pl-14 py-3 transition-all duration-300 {status === 'upcoming' ? 'opacity-40' : ''}">
        <!-- Status dot on timeline -->
        <div class="absolute left-2.5 sm:left-4.5 top-4 w-3 h-3 rounded-full border-2 {status === 'completed' ? 'bg-status-go/30 border-status-go' : ''} {status === 'active' ? 'bg-nasa-orange/30 border-nasa-orange animate-pulse' : ''} {status === 'upcoming' ? 'bg-white/5 border-white/20' : ''}"></div>

        <!-- Event content -->
        <div class="glass-panel-sm p-3 sm:p-4 {status === 'active' ? 'border-nasa-orange/30' : ''} {isLiftoff && status === 'active' ? 'glow-orange' : ''}">
          <div class="flex flex-wrap items-center gap-2 mb-1">
            <span class="font-display text-xs sm:text-sm font-bold tracking-wider {status === 'completed' ? 'text-status-go' : status === 'active' ? 'text-nasa-orange' : 'text-white/40'} {isLiftoff ? 'text-base' : ''}">{event.label}</span>
            <span class="text-sm sm:text-base font-semibold {status === 'active' ? 'text-white' : 'text-white/60'} {isLiftoff ? 'font-display text-lg tracking-wider' : ''}">{event.title}</span>
            {#if status === 'completed'}
              <svg class="w-4 h-4 text-status-go" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
            {/if}
          </div>
          <div class="text-[10px] sm:text-xs text-white/20 font-mono mb-1.5">
            {formatTime(time)}
          </div>
          <p class="text-xs sm:text-sm text-white/35 leading-relaxed">{event.description}</p>
          {#if status === 'active'}
            <div class="h-0.5 bg-gradient-to-r from-nasa-orange/50 to-transparent rounded mt-3 animate-pulse"></div>
          {/if}
        </div>
      </div>
    {/each}
  </div>
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
