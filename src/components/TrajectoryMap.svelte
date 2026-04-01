<script lang="ts">
  import { onMount } from 'svelte';

  interface Waypoint {
    day: number;
    distanceFromEarth: number;
    label: string;
    description: string;
  }

  interface Props {
    waypoints: Waypoint[];
    earthMoonDistance: number;
    apolloRecord: number;
    farthestPoint: number;
    missionDay: number;
    missionPhase: string;
  }

  let { waypoints, earthMoonDistance, apolloRecord, farthestPoint, missionDay, missionPhase }: Props = $props();

  let mounted = $state(false);
  let svgWidth = $state(800);
  let svgHeight = $state(400);

  // SVG layout
  const padding = { top: 40, right: 60, bottom: 60, left: 60 };

  // Interpolate current position
  function getCurrentDistance(): number {
    if (missionPhase === 'prelaunch' || missionPhase === 'launch') return 0;
    if (missionPhase === 'complete') return 0;

    const day = missionDay;
    if (day <= 0) return 0;
    if (day >= 10) return 0;

    // Find surrounding waypoints
    const prev = waypoints.filter(w => w.day <= day).pop();
    const next = waypoints.find(w => w.day > day);

    if (!prev || !next) return prev?.distanceFromEarth ?? 0;

    const t = (day - prev.day) / (next.day - prev.day);
    return prev.distanceFromEarth + t * (next.distanceFromEarth - prev.distanceFromEarth);
  }

  // Generate curved path points
  function getPathPoints(): { x: number; y: number }[] {
    const maxDist = farthestPoint * 1.1;
    const plotWidth = svgWidth - padding.left - padding.right;
    const plotHeight = svgHeight - padding.top - padding.bottom;
    const points: { x: number; y: number }[] = [];

    for (const wp of waypoints) {
      const x = padding.left + (wp.day / 10) * plotWidth;
      // Invert Y: higher distance = higher on chart
      const y = padding.top + plotHeight - (wp.distanceFromEarth / maxDist) * plotHeight;
      points.push({ x, y });
    }
    return points;
  }

  function pathToSvg(points: { x: number; y: number }[]): string {
    if (points.length < 2) return '';
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cpx1 = prev.x + (curr.x - prev.x) * 0.5;
      const cpx2 = prev.x + (curr.x - prev.x) * 0.5;
      d += ` C ${cpx1} ${prev.y} ${cpx2} ${curr.y} ${curr.x} ${curr.y}`;
    }
    return d;
  }

  function getCurrentPos(): { x: number; y: number } | null {
    const dist = getCurrentDistance();
    const maxDist = farthestPoint * 1.1;
    const plotWidth = svgWidth - padding.left - padding.right;
    const plotHeight = svgHeight - padding.top - padding.bottom;

    const x = padding.left + (missionDay / 10) * plotWidth;
    const y = padding.top + plotHeight - (dist / maxDist) * plotHeight;
    return { x, y };
  }

  function formatDistance(km: number): string {
    if (km >= 1000) return `${(km / 1000).toFixed(0)}K km`;
    return `${km.toFixed(0)} km`;
  }

  onMount(() => {
    mounted = true;
    const container = document.getElementById('trajectory-container');
    if (container) {
      svgWidth = Math.min(container.clientWidth, 900);
      svgHeight = Math.max(svgWidth * 0.45, 300);
    }
  });

  const pathPoints = $derived(getPathPoints());
  const pathD = $derived(pathToSvg(pathPoints));
  const currentPos = $derived(getCurrentPos());
  const currentDist = $derived(getCurrentDistance());
  const maxDist = $derived(farthestPoint * 1.1);
  const plotHeight = $derived(svgHeight - padding.top - padding.bottom);

  // Reference lines Y positions
  const moonY = $derived(padding.top + plotHeight - (earthMoonDistance / maxDist) * plotHeight);
  const apolloY = $derived(padding.top + plotHeight - (apolloRecord / maxDist) * plotHeight);
  const farthestY = $derived(padding.top + plotHeight - (farthestPoint / maxDist) * plotHeight);
</script>

<div id="trajectory-container" class="w-full">
  {#if mounted}
    <svg viewBox="0 0 {svgWidth} {svgHeight}" class="w-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="pathGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#0B3D91" />
          <stop offset="50%" stop-color="#06B6D4" />
          <stop offset="100%" stop-color="#0B3D91" />
        </linearGradient>
        <radialGradient id="earthGlow">
          <stop offset="0%" stop-color="#3B82F6" stop-opacity="0.3" />
          <stop offset="100%" stop-color="#3B82F6" stop-opacity="0" />
        </radialGradient>
        <radialGradient id="moonGlow">
          <stop offset="0%" stop-color="#9CA3AF" stop-opacity="0.2" />
          <stop offset="100%" stop-color="#9CA3AF" stop-opacity="0" />
        </radialGradient>
        <radialGradient id="orionGlow">
          <stop offset="0%" stop-color="#FC3D21" stop-opacity="0.6" />
          <stop offset="100%" stop-color="#FC3D21" stop-opacity="0" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <!-- Background grid -->
      {#each [0.25, 0.5, 0.75, 1] as frac}
        <line x1={padding.left} y1={padding.top + plotHeight * (1 - frac)}
              x2={svgWidth - padding.right} y2={padding.top + plotHeight * (1 - frac)}
              stroke="rgba(255,255,255,0.03)" stroke-width="1" />
      {/each}

      <!-- Moon distance reference line -->
      <line x1={padding.left} y1={moonY} x2={svgWidth - padding.right} y2={moonY}
            stroke="rgba(156,163,175,0.15)" stroke-width="1" stroke-dasharray="4 4" />
      <text x={svgWidth - padding.right + 5} y={moonY + 4}
            fill="rgba(156,163,175,0.4)" font-size="9" font-family="'Chakra Petch', sans-serif">MOON</text>

      <!-- Apollo 13 record line -->
      <line x1={padding.left} y1={apolloY} x2={svgWidth - padding.right} y2={apolloY}
            stroke="rgba(245,158,11,0.15)" stroke-width="1" stroke-dasharray="2 6" />
      <text x={svgWidth - padding.right + 5} y={apolloY + 4}
            fill="rgba(245,158,11,0.4)" font-size="8" font-family="'Chakra Petch', sans-serif">A-13</text>

      <!-- Trajectory path -->
      <path d={pathD} fill="none" stroke="url(#pathGrad)" stroke-width="2.5" opacity="0.6" />
      <path d={pathD} fill="none" stroke="url(#pathGrad)" stroke-width="1" filter="url(#glow)" />

      <!-- Earth at bottom-left -->
      <circle cx={padding.left} cy={padding.top + plotHeight} r="30" fill="url(#earthGlow)" />
      <circle cx={padding.left} cy={padding.top + plotHeight} r="12" fill="#1E3A5F" stroke="#3B82F6" stroke-width="1.5" />
      <text x={padding.left} y={padding.top + plotHeight + 28}
            text-anchor="middle" fill="rgba(255,255,255,0.3)" font-size="10" font-family="'Chakra Petch', sans-serif">EARTH</text>

      <!-- Waypoint dots -->
      {#each pathPoints as point, i}
        {#if i > 0 && i < pathPoints.length - 1}
          <circle cx={point.x} cy={point.y} r="3" fill="rgba(6,182,212,0.3)" stroke="rgba(6,182,212,0.5)" stroke-width="0.5" />
        {/if}
      {/each}

      <!-- Current position (Orion) -->
      {#if currentPos && missionPhase !== 'prelaunch' && missionPhase !== 'launch'}
        <circle cx={currentPos.x} cy={currentPos.y} r="20" fill="url(#orionGlow)" />
        <circle cx={currentPos.x} cy={currentPos.y} r="5" fill="#FC3D21" stroke="white" stroke-width="1.5" filter="url(#glow)" />
        <text x={currentPos.x} y={currentPos.y - 12}
              text-anchor="middle" fill="#FC3D21" font-size="9" font-family="'Chakra Petch', sans-serif" font-weight="bold">
          ORION
        </text>
      {/if}

      <!-- Day labels on x-axis -->
      {#each [0, 2, 4, 6, 8, 10] as day}
        {@const x = padding.left + (day / 10) * (svgWidth - padding.left - padding.right)}
        <text x={x} y={svgHeight - 10}
              text-anchor="middle" fill="rgba(255,255,255,0.2)" font-size="9" font-family="'Chakra Petch', sans-serif">
          D{day}
        </text>
      {/each}
    </svg>

    <!-- Stats below the chart -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
      <div class="glass-panel-sm p-3 text-center">
        <div class="text-[10px] text-white/40 font-display tracking-wider mb-1">DISTANCE FROM EARTH</div>
        <div class="font-display text-lg font-bold text-mission-cyan">{formatDistance(currentDist)}</div>
      </div>
      <div class="glass-panel-sm p-3 text-center">
        <div class="text-[10px] text-white/40 font-display tracking-wider mb-1">{missionDay <= 6 ? 'REMAINING TO MOON' : 'REMAINING TO EARTH'}</div>
        <div class="font-display text-lg font-bold text-nasa-orange">{missionDay <= 6 ? formatDistance(Math.max(0, earthMoonDistance - currentDist)) : formatDistance(currentDist)}</div>
      </div>
      <div class="glass-panel-sm p-3 text-center">
        <div class="text-[10px] text-white/40 font-display tracking-wider mb-1">MISSION DAY</div>
        <div class="font-display text-lg font-bold text-white">{missionDay} / 10</div>
      </div>
      <div class="glass-panel-sm p-3 text-center">
        <div class="text-[10px] text-white/40 font-display tracking-wider mb-1">DISTANCE TO MOON</div>
        <div class="font-display text-lg font-bold text-white/70">{formatDistance(Math.abs(earthMoonDistance - currentDist))}</div>
      </div>
    </div>
  {:else}
    <div class="h-64 flex items-center justify-center">
      <div class="font-display text-white/20 tracking-widest text-sm">LOADING TRAJECTORY...</div>
    </div>
  {/if}
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
