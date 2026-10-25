import { describe, expect, it } from 'vitest';
import { baseNetwork, baseOrder } from '../data/scenarios';
import { analyze } from '../engine/engine';
import { runConfirmation } from './confirm';

const network = baseNetwork();
const plan = analyze(baseOrder(), network).options[0].plan; // A45 + C55

describe('confirmation workflow', () => {
  it('confirms when every step succeeds', () => {
    const r = runConfirmation(plan, network, 'none', 'T1');
    expect(r.outcome).toBe('confirmed');
    expect(r.events.at(-1)?.kind).toBe('confirmed');
  });

  it('releases earlier holds when stock changes and re-plans with the new stock', () => {
    const r = runConfirmation(plan, network, 'stockChanged', 'T2');
    expect(r.outcome).toBe('compensated');
    expect(r.events.filter((e) => e.kind === 'releaseHold').map((e) => e.sourceId)).toEqual(['A']);
    expect(r.events.some((e) => e.kind === 'confirmed')).toBe(false);
    const replanned = analyze(baseOrder(), r.networkAfter).options[0].plan;
    expect(replanned.cost).not.toBe(480);
  });

  it('cancels bookings and releases holds when transport is unavailable', () => {
    const r = runConfirmation(plan, network, 'transportUnavailable', 'T3');
    expect(r.outcome).toBe('compensated');
    expect(r.events.filter((e) => e.tone === 'undo').length).toBe(2); // two holds released, no booking yet
  });

  it('queries status instead of re-sending after an unknown result', () => {
    const r = runConfirmation(plan, network, 'unknownResult', 'T4');
    expect(r.outcome).toBe('confirmed');
    const kinds = r.events.map((e) => e.kind);
    expect(kinds).toContain('statusQuery');
    expect(kinds.filter((k) => k === 'bookOk').length).toBe(1);
  });
});
