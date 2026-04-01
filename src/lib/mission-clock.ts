/**
 * Mission clock utility — auto-derives mission state from current time vs launch time.
 *
 * All milestones, launch events, mission phase, and mission day are calculated
 * client-side from MET (Mission Elapsed Time = now - launchDate). Config.json
 * manual overrides are merged as a union (fallback for edge cases).
 */

// --- Launch events (ascent sequence) ---

export interface LaunchEventDef {
  id: string;
  offsetSeconds: number;
  time: string;
  title: string;
  description: string;
  altitude?: string;
  speed?: string;
}

export const LAUNCH_EVENTS: LaunchEventDef[] = [
  { id: 'liftoff', offsetSeconds: 0, time: 'T+0s', title: 'LIFTOFF', description: 'SLS clears the tower at Launch Pad 39B. 8.8 million pounds of thrust.', altitude: '0 km', speed: '0 km/s' },
  { id: 'srb-sep', offsetSeconds: 2 * 60, time: 'T+2m', title: 'SRB Separation', description: 'Twin solid rocket boosters jettisoned after burning 1.6 million kg of propellant each.', altitude: '~48 km', speed: '~1.5 km/s' },
  { id: 'fairing', offsetSeconds: 3 * 60, time: 'T+3m', title: 'Fairing Panels Jettison', description: 'Launch Abort System and protective panels jettisoned. Orion spacecraft exposed.', altitude: '~67 km', speed: '~1.8 km/s' },
  { id: 'meco', offsetSeconds: 8 * 60, time: 'T+8m', title: 'Core Stage MECO', description: 'Main Engine Cutoff — four RS-25 engines shut down after consuming 2.7 million liters of propellant.', altitude: '~160 km', speed: '~7.8 km/s' },
  { id: 'core-sep', offsetSeconds: 8 * 60 + 10, time: 'T+8m10s', title: 'Core Stage Separation', description: 'SLS core stage separates. Now relying on the Interim Cryogenic Propulsion Stage (ICPS).', altitude: '~161 km', speed: '~7.8 km/s' },
  { id: 'icps-ign', offsetSeconds: 8 * 60 + 20, time: 'T+8m20s', title: 'ICPS Ignition', description: 'Single RL-10B-2 engine of the ICPS fires for orbital insertion burn.', altitude: '~162 km', speed: '~7.8 km/s' },
  { id: 'icps-cut', offsetSeconds: 18 * 60, time: 'T+18m', title: 'ICPS Cutoff — Orbit Achieved', description: 'Parking orbit achieved at ~185 km x 1,800 km. Systems checkout begins.', altitude: '~185 km', speed: '~7.9 km/s' },
  { id: 'tli', offsetSeconds: 1 * 3600 + 50 * 60, time: 'T+1h50m', title: 'TLI Burn — Heading to the Moon', description: 'Translunar Injection burn. ICPS fires again to accelerate Orion to Earth escape velocity.', altitude: '~1,800 km', speed: '~10.9 km/s' },
  { id: 'deploy', offsetSeconds: 2 * 3600 + 10 * 60, time: 'T+2h10m', title: 'Orion Separation & Solar Deploy', description: 'Orion separates from spent ICPS. Solar arrays unfurl. Crew begins 10-day journey.', altitude: '~3,000 km', speed: '~10.8 km/s' },
];

// --- Mission milestones (full mission) ---

export interface MilestoneDef {
  id: string;
  offsetSeconds: number;
  title: string;
  distance?: string;
  isRecord?: boolean;
}

export const MILESTONES: MilestoneDef[] = [
  { id: 'liftoff', offsetSeconds: 0, title: 'Liftoff' },
  { id: 'srb-separation', offsetSeconds: 2 * 60, title: 'SRB separation' },
  { id: 'earth-orbit', offsetSeconds: 18 * 60, title: 'Earth orbit achieved' },
  { id: 'tli', offsetSeconds: 2 * 3600, title: 'TLI burn complete — heading to the Moon' },
  { id: 'iss-altitude', offsetSeconds: 2 * 3600 + 30 * 60, title: 'Passed ISS altitude', distance: '408 km' },
  { id: 'gps-altitude', offsetSeconds: 3 * 3600, title: 'Passed GPS satellite altitude', distance: '20,200 km' },
  { id: 'geo-orbit', offsetSeconds: 4 * 3600, title: 'Passed geostationary orbit', distance: '35,786 km' },
  { id: 'halfway', offsetSeconds: 36 * 3600, title: 'Halfway to the Moon', distance: '192,200 km' },
  { id: 'lunar-soi', offsetSeconds: 4 * 86400, title: 'Entered lunar sphere of influence' },
  { id: 'lunar-flyby', offsetSeconds: 5 * 86400, title: 'Lunar flyby — closest approach' },
  { id: 'apollo-record', offsetSeconds: 5 * 86400 + 6 * 3600, title: 'Passed Apollo 13 record — NEW RECORD', distance: '400,171 km', isRecord: true },
  { id: 'farthest', offsetSeconds: 5 * 86400 + 12 * 3600, title: 'Farthest point reached', distance: '~392,000 km from Earth', isRecord: true },
  { id: 'return-trajectory', offsetSeconds: 6 * 86400, title: 'Return trajectory established' },
  { id: 'halfway-home', offsetSeconds: 7 * 86400 + 12 * 3600, title: 'Halfway home' },
  { id: 'reentry', offsetSeconds: 9 * 86400 + 20 * 3600, title: 'Re-entry interface', distance: '120 km altitude' },
  { id: 'parachutes', offsetSeconds: 9 * 86400 + 20 * 3600 + 10 * 60, title: 'Parachute deployment' },
  { id: 'splashdown', offsetSeconds: 9 * 86400 + 20 * 3600 + 15 * 60, title: 'Splashdown' },
  { id: 'recovery', offsetSeconds: 9 * 86400 + 21 * 3600, title: 'Crew recovery' },
];

// --- Mission phase boundaries ---

export type MissionPhase = 'prelaunch' | 'launch' | 'transit' | 'lunar' | 'return' | 'complete';

interface PhaseBoundary {
  phase: MissionPhase;
  startSeconds: number;
}

const PHASE_BOUNDARIES: PhaseBoundary[] = [
  { phase: 'launch', startSeconds: 0 },
  { phase: 'transit', startSeconds: 2 * 3600 + 30 * 60 },       // T+2h30m
  { phase: 'lunar', startSeconds: 4 * 86400 + 12 * 3600 },       // T+4d12h
  { phase: 'return', startSeconds: 6 * 86400 },                    // T+6d
  { phase: 'complete', startSeconds: 9 * 86400 + 20 * 3600 },     // T+9d20h
];

// --- Main calculation ---

export interface MissionState {
  /** Milliseconds since launch (negative = before launch) */
  metMs: number;
  /** Mission Elapsed Time in seconds (negative = before launch) */
  metSeconds: number;
  /** Auto-derived mission phase */
  missionPhase: MissionPhase;
  /** Mission day (0-10, capped) */
  missionDay: number;
  /** Fractional mission day for smooth interpolation */
  missionDayFractional: number;
  /** IDs of auto-completed milestones */
  completedMilestones: string[];
  /** IDs of auto-completed launch events */
  completedLaunchEvents: string[];
  /** Whether we are past launch time */
  isPostLaunch: boolean;
}

/**
 * Calculate the full mission state from the current time and launch date.
 */
export function getMissionState(launchDateStr: string, now?: Date): MissionState {
  const launchTime = new Date(launchDateStr).getTime();
  const currentTime = (now ?? new Date()).getTime();
  const metMs = currentTime - launchTime;
  const metSeconds = metMs / 1000;
  const isPostLaunch = metMs >= 0;

  // Phase
  let missionPhase: MissionPhase = 'prelaunch';
  if (isPostLaunch) {
    for (const boundary of PHASE_BOUNDARIES) {
      if (metSeconds >= boundary.startSeconds) {
        missionPhase = boundary.phase;
      }
    }
  }

  // Mission day
  const missionDayFractional = isPostLaunch ? Math.min(metMs / (24 * 3600 * 1000), 10) : 0;
  const missionDay = Math.min(Math.floor(missionDayFractional), 10);

  // Auto-completed milestones
  const completedMilestones = isPostLaunch
    ? MILESTONES.filter(m => metSeconds >= m.offsetSeconds).map(m => m.id)
    : [];

  // Auto-completed launch events
  const completedLaunchEvents = isPostLaunch
    ? LAUNCH_EVENTS.filter(e => metSeconds >= e.offsetSeconds).map(e => e.id)
    : [];

  return {
    metMs,
    metSeconds,
    missionPhase,
    missionDay,
    missionDayFractional,
    completedMilestones,
    completedLaunchEvents,
    isPostLaunch,
  };
}

/**
 * Merge auto-derived completed items with manual overrides from config.
 * Returns the union of both arrays (deduped).
 */
export function mergeCompleted(auto: string[], manual: string[]): string[] {
  return [...new Set([...auto, ...manual])];
}
