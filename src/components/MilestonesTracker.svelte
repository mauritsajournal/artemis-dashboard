<script lang="ts">
  import { onMount } from 'svelte';
  import { getMissionState, mergeCompleted, MILESTONES, type MilestoneDef } from '../lib/mission-clock';

  interface Props {
    launchDate: string;
    configCompletedMilestones?: string[];
  }

  let { launchDate, configCompletedMilestones = [] }: Props = $props();

  let completedMilestones = $state<string[]>([]);
  let mounted = $state(false);

  function update() {
    const state = getMissionState(launchDate);
    completedMilestones = mergeCompleted(state.completedMilestones, configCompletedMilestones);
  }

  onMount(() => {
    mounted = true;
    update();
    const interval = setInterval(update, 10000);
    return () => clearInterval(interval);
  });

  const completedCount = $derived(MILESTONES.filter(m => completedMilestones.includes(m.id)).length);
  const totalCount = MILESTONES.length;
  const progressPercent = $derived(totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0);

  const recordBadges = [
    { trigger: 'apollo-record', icon: 'star', text: 'Victor Glover: First person of color beyond LEO', color: '#FC3D21' },
    { trigger: 'apollo-record', icon: 'star', text: 'Christina Koch: First woman beyond LEO', color: '#E03C31' },
    { trigger: 'apollo-record', icon: 'star', text: 'Jeremy Hansen: First non-American on lunar mission', color: '#F59E0B' },
    { trigger: 'apollo-record', icon: 'star', text: 'Reid Wiseman: Oldest person beyond LEO', color: '#0B3D91' },
    { trigger: 'liftoff', icon: 'rocket', text: 'First humans beyond LEO since Apollo 17 (Dec 1972)', color: '#06B6D4' },
  ];
</script>

<!-- Header -->
<div class="flex items-center justify-between mb-4">
  <div>
    <h3 class="font-display text-sm sm:text-base font-bold tracking-wider text-white/80">Mission Milestones</h3>
    <p class="text-xs text-white/30 font-display tracking-wider mt-0.5">{completedCount} of {totalCount} achieved</p>
  </div>
</div>

<!-- Progress bar -->
<div class="mb-6">
  <div class="h-2 bg-white/5 rounded-full overflow-hidden">
    <div class="h-full bg-gradient-to-r from-status-go to-mission-cyan rounded-full transition-all duration-1000"
         style="width: {progressPercent}%"></div>
  </div>
</div>

<!-- Milestones checklist -->
<div class="space-y-1">
  {#each MILESTONES as milestone}
    {@const isCompleted = completedMilestones.includes(milestone.id)}
    <div class="flex items-start gap-3 py-2 px-3 rounded-lg transition-all {isCompleted ? 'bg-status-go/5' : ''} {milestone.isRecord ? 'border border-dashed border-nasa-orange/20' : ''} {!isCompleted ? 'opacity-40' : ''}">
      <!-- Checkbox -->
      <div class="w-5 h-5 rounded border flex items-center justify-center shrink-0 mt-0.5 {isCompleted ? 'bg-status-go/20 border-status-go/40' : 'bg-white/3 border-white/10'}">
        {#if isCompleted}
          <svg class="w-3 h-3 text-status-go" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
        {/if}
      </div>

      <div class="flex-1">
        <div class="text-sm {isCompleted ? 'text-white/70 line-through decoration-status-go/30' : 'text-white/50'} {milestone.isRecord && !isCompleted ? 'text-nasa-orange/50 font-semibold' : ''} {milestone.isRecord && isCompleted ? 'text-nasa-orange decoration-nasa-orange/30 font-semibold' : ''}">
          {milestone.title}
        </div>
        {#if milestone.distance}
          <div class="text-[10px] text-white/20 font-mono">{milestone.distance}</div>
        {/if}
      </div>

      {#if milestone.isRecord}
        <div class="text-nasa-orange/40">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </div>
      {/if}
    </div>
  {/each}
</div>

<!-- Record badges -->
{#if completedMilestones.length > 0}
  {@const visibleBadges = recordBadges.filter(b => completedMilestones.includes(b.trigger))}
  {#if visibleBadges.length > 0}
    <div class="mt-6 pt-4 border-t border-white/5">
      <div class="text-[10px] font-display tracking-[0.2em] text-white/25 uppercase mb-3">HISTORIC RECORDS SET</div>
      <div class="space-y-2">
        {#each visibleBadges as badge}
          <div class="flex items-center gap-2 p-2 rounded-lg"
               style="background: {badge.color}08; border: 1px solid {badge.color}20">
            <svg class="w-4 h-4 shrink-0" style="color: {badge.color}" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clip-rule="evenodd" />
            </svg>
            <span class="text-xs text-white/50">{badge.text}</span>
          </div>
        {/each}
      </div>
    </div>
  {/if}
{/if}
