import { baseNetwork, baseOrder } from '../data/scenarios';
import { allocationLabel, analyze } from './engine';
import type { Analysis } from './types';

export type CheckId =
  | 'defaultPlan'
  | 'staleStock'
  | 'oneDelivery'
  | 'earlyDeadline'
  | 'missedCutoff'
  | 'changedStock'
  | 'twoSkuLoad';

export interface CheckResult {
  id: CheckId;
  passed: boolean;
  expected: string;
  actual: string;
}

const cheapest = (a: Analysis) => a.options.find((o) => o.kind === 'cheapest')?.plan;

/** The seven synthetic checks from the presenter notes of slide 9. */
export function runChecks(): CheckResult[] {
  const results: CheckResult[] = [];

  {
    const a = analyze(baseOrder(), baseNetwork());
    const p = cheapest(a);
    results.push({
      id: 'defaultPlan',
      expected: 'A45 + C55 · 480 SEK · 48h · baseline 600 SEK',
      actual: p ? `${allocationLabel(p)} · ${p.cost} SEK · ${p.hours}h · baseline ${a.baseline?.cost} SEK` : 'none',
      passed: !!p && allocationLabel(p) === 'A45 + C55' && p.cost === 480 && p.hours === 48 && a.baseline?.cost === 600,
    });
  }
  {
    const net = baseNetwork();
    net.sources[1].dataAgeMin = 360;
    const a = analyze(baseOrder(), net);
    const usesB = a.feasiblePlans.some((p) => p.shipments.some((s) => s.sourceId === 'B'));
    results.push({
      id: 'staleStock',
      expected: 'Store B excluded; no plan uses B',
      actual: `B eligible: ${a.normalized[1].eligible} · plans using B: ${usesB ? 'yes' : 'no'}`,
      passed: !a.normalized[1].eligible && !usesB,
    });
  }
  {
    const order = baseOrder();
    order.allowSplit = false;
    const a = analyze(order, baseNetwork());
    results.push({
      id: 'oneDelivery',
      expected: 'No feasible plan · blocker = deliveries',
      actual: `${a.feasiblePlans.length} plans · blocker = ${a.blocker}`,
      passed: a.feasiblePlans.length === 0 && a.blocker === 'deliveries',
    });
  }
  {
    const order = baseOrder();
    order.deadlineHours = 12;
    const a = analyze(order, baseNetwork());
    const p = cheapest(a);
    results.push({
      id: 'earlyDeadline',
      expected: 'Only all-express · 930 SEK · 12h',
      actual: p ? `${a.options.length} option(s) · ${p.cost} SEK · ${p.hours}h` : 'none',
      passed: a.options.length === 1 && p?.cost === 930 && p.hours === 12 && p.shipments.every((s) => s.service === 'express'),
    });
  }
  {
    const net = baseNetwork();
    net.sources[2].services[0].cutoffPassed = true;
    const a = analyze(baseOrder(), net);
    const p = cheapest(a);
    const usesCStd = a.feasiblePlans.some((x) => x.shipments.some((s) => s.sourceId === 'C' && s.service === 'standard'));
    results.push({
      id: 'missedCutoff',
      expected: 'C standard unused · cheapest 720 SEK',
      actual: p ? `C standard used: ${usesCStd ? 'yes' : 'no'} · cheapest ${p.cost} SEK` : 'none',
      passed: !usesCStd && p?.cost === 720,
    });
  }
  {
    const net = baseNetwork();
    net.sources[0].stock['P-100'].reserved += 10; // A drops from 45 to 35 allocatable
    const a = analyze(baseOrder(), net);
    const p = cheapest(a);
    results.push({
      id: 'changedStock',
      expected: 'A+C no longer enough · cheapest uses 3 sources · 600 SEK',
      actual: p ? `${allocationLabel(p)} · ${p.cost} SEK` : 'none',
      passed: !!p && p.deliveries === 3 && p.cost === 600,
    });
  }
  {
    const order = baseOrder();
    order.lines = [
      { sku: 'P-100', qty: 60 },
      { sku: 'P-200', qty: 20 },
    ];
    order.deadlineHours = 24;
    const net = baseNetwork();
    const a = analyze(order, net);
    const overload = a.feasiblePlans.some((p) =>
      p.shipments.some((s) => {
        const svc = net.sources.find((x) => x.id === s.sourceId)?.services.find((v) => v.id === s.service);
        return svc?.maxLoadKg != null && s.weightKg > svc.maxLoadKg;
      }),
    );
    results.push({
      id: 'twoSkuLoad',
      expected: 'Every plan respects the 300 kg C express limit',
      actual: `${a.feasiblePlans.length} plans · overloaded: ${overload ? 'yes' : 'no'}`,
      passed: a.feasiblePlans.length > 0 && !overload,
    });
  }
  return results;
}
