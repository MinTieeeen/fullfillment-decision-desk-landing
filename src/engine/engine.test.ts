import { describe, expect, it } from 'vitest';
import { baseNetwork, baseOrder, scenario } from '../data/scenarios';
import { runChecks } from './checks';
import { allocationLabel, analyze } from './engine';

describe('deck scenario (100 units, 48h)', () => {
  const a = analyze(baseOrder(), baseNetwork());
  const byKind = Object.fromEntries(a.options.map((o) => [o.kind, o.plan]));

  it('computes allocatable stock 45 / 35 / 60', () => {
    expect(a.normalized.map((n) => n.allocatable['P-100'])).toEqual([45, 35, 60]);
    expect(a.singleSourceCovers).toEqual([]);
  });

  it('nearest-first baseline costs 600 SEK with 3 deliveries', () => {
    expect(a.baseline && allocationLabel(a.baseline)).toBe('A45 + B35 + C20');
    expect(a.baseline?.cost).toBe(600);
    expect(a.baseline?.deliveries).toBe(3);
  });

  it('offers 480 / 720 / 930 SEK options', () => {
    expect(allocationLabel(byKind.cheapest)).toBe('A45 + C55');
    expect([byKind.cheapest.cost, byKind.cheapest.hours, byKind.cheapest.deliveries]).toEqual([480, 48, 2]);
    expect([byKind.balanced.cost, byKind.balanced.hours]).toEqual([720, 24]);
    expect([byKind.fastest.cost, byKind.fastest.hours]).toEqual([930, 12]);
    expect(a.options).toHaveLength(3);
  });

  it('charges customer fees from the assumed policy', () => {
    expect([byKind.cheapest.customerFee, byKind.balanced.customerFee, byKind.fastest.customerFee]).toEqual([398, 747, 1047]);
  });
});

describe('scenarios', () => {
  it('shortage reports missing units and a partial alternative', () => {
    const { order, network } = scenario('shortage');
    const a = analyze(order, network);
    expect(a.blocker).toBe('stock');
    expect(a.shortage['P-100']).toBe(10);
    expect(a.alternatives?.partial?.units).toBe(140);
  });

  it('stale Store B leaves only the 48h option', () => {
    const { order, network } = scenario('stale');
    const a = analyze(order, network);
    expect(a.options.map((o) => o.plan.cost)).toEqual([480]);
  });
});

describe('seven synthetic checks', () => {
  for (const r of runChecks()) {
    it(r.id, () => expect(r.passed, `${r.expected} | got ${r.actual}`).toBe(true));
  }
});
