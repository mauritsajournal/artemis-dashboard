import { describe, it, expect } from 'vitest';
import { getMissionState, mergeCompleted, MILESTONES, LAUNCH_EVENTS } from '../src/lib/mission-clock';

const LAUNCH_DATE = '2026-04-01T18:24:00-04:00';

describe('getMissionState', () => {
  it('returns prelaunch phase before launch time', () => {
    const beforeLaunch = new Date('2026-04-01T20:00:00Z'); // 2h24m before launch (22:24 UTC)
    const state = getMissionState(LAUNCH_DATE, beforeLaunch);
    expect(state.missionPhase).toBe('prelaunch');
    expect(state.isPostLaunch).toBe(false);
    expect(state.missionDay).toBe(0);
    expect(state.completedMilestones).toEqual([]);
    expect(state.completedLaunchEvents).toEqual([]);
  });

  it('returns launch phase immediately after liftoff', () => {
    // Launch is at 22:24:00 UTC
    const justAfter = new Date('2026-04-01T22:25:00Z'); // T+60s
    const state = getMissionState(LAUNCH_DATE, justAfter);
    expect(state.missionPhase).toBe('launch');
    expect(state.isPostLaunch).toBe(true);
    expect(state.completedLaunchEvents).toContain('liftoff');
    expect(state.completedMilestones).toContain('liftoff');
  });

  it('completes SRB separation at T+2m', () => {
    const tPlus3m = new Date(new Date(LAUNCH_DATE).getTime() + 3 * 60 * 1000);
    const state = getMissionState(LAUNCH_DATE, tPlus3m);
    expect(state.completedLaunchEvents).toContain('liftoff');
    expect(state.completedLaunchEvents).toContain('srb-sep');
    expect(state.completedLaunchEvents).toContain('fairing');
    expect(state.completedMilestones).toContain('srb-separation');
  });

  it('enters transit phase after T+2h30m', () => {
    const tPlus3h = new Date(new Date(LAUNCH_DATE).getTime() + 3 * 3600 * 1000);
    const state = getMissionState(LAUNCH_DATE, tPlus3h);
    expect(state.missionPhase).toBe('transit');
    expect(state.completedMilestones).toContain('iss-altitude');
    expect(state.completedMilestones).toContain('gps-altitude');
  });

  it('calculates mission day correctly', () => {
    // 36 hours after launch = day 1
    const tPlus36h = new Date(new Date(LAUNCH_DATE).getTime() + 36 * 3600 * 1000);
    const state = getMissionState(LAUNCH_DATE, tPlus36h);
    expect(state.missionDay).toBe(1);
    expect(state.completedMilestones).toContain('halfway');
  });

  it('enters lunar phase at T+4d12h', () => {
    const tPlus5d = new Date(new Date(LAUNCH_DATE).getTime() + 5 * 86400 * 1000);
    const state = getMissionState(LAUNCH_DATE, tPlus5d);
    expect(state.missionPhase).toBe('lunar');
    expect(state.missionDay).toBe(5);
    expect(state.completedMilestones).toContain('lunar-flyby');
  });

  it('enters return phase at T+6d', () => {
    const tPlus7d = new Date(new Date(LAUNCH_DATE).getTime() + 7 * 86400 * 1000);
    const state = getMissionState(LAUNCH_DATE, tPlus7d);
    expect(state.missionPhase).toBe('return');
    expect(state.completedMilestones).toContain('return-trajectory');
  });

  it('enters complete phase at T+9d20h', () => {
    const tPlus10d = new Date(new Date(LAUNCH_DATE).getTime() + 10 * 86400 * 1000);
    const state = getMissionState(LAUNCH_DATE, tPlus10d);
    expect(state.missionPhase).toBe('complete');
    expect(state.missionDay).toBe(10);
    expect(state.completedMilestones).toContain('splashdown');
    expect(state.completedMilestones).toContain('recovery');
  });

  it('caps mission day at 10', () => {
    const tPlus20d = new Date(new Date(LAUNCH_DATE).getTime() + 20 * 86400 * 1000);
    const state = getMissionState(LAUNCH_DATE, tPlus20d);
    expect(state.missionDay).toBe(10);
  });
});

describe('mergeCompleted', () => {
  it('returns union of auto and manual arrays', () => {
    const result = mergeCompleted(['liftoff', 'srb-separation'], ['liftoff', 'custom-event']);
    expect(result).toContain('liftoff');
    expect(result).toContain('srb-separation');
    expect(result).toContain('custom-event');
    expect(result.length).toBe(3);
  });

  it('handles empty arrays', () => {
    expect(mergeCompleted([], [])).toEqual([]);
    expect(mergeCompleted(['a'], [])).toEqual(['a']);
    expect(mergeCompleted([], ['b'])).toEqual(['b']);
  });
});

describe('data integrity', () => {
  it('milestones have unique IDs', () => {
    const ids = MILESTONES.map(m => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('launch events have unique IDs', () => {
    const ids = LAUNCH_EVENTS.map(e => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('milestones are in ascending offset order', () => {
    for (let i = 1; i < MILESTONES.length; i++) {
      expect(MILESTONES[i].offsetSeconds).toBeGreaterThanOrEqual(MILESTONES[i - 1].offsetSeconds);
    }
  });

  it('launch events are in ascending offset order', () => {
    for (let i = 1; i < LAUNCH_EVENTS.length; i++) {
      expect(LAUNCH_EVENTS[i].offsetSeconds).toBeGreaterThanOrEqual(LAUNCH_EVENTS[i - 1].offsetSeconds);
    }
  });
});
