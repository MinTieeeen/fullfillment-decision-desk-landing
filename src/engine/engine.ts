import { productBySku } from '../data/catalog';
import type {
  Alternatives,
  Analysis,
  Blocker,
  ExclusionReason,
  Funnel,
  Network,
  NormalizedSource,
  OptionKind,
  Order,
  Plan,
  RankedOption,
  RejectReason,
  Service,
  Settings,
  Shipment,
  Source,
} from './types';

type Demand = Record<string, number>;

interface Constraints {
  deadlineHours: number;
  maxDeliveries: number;
}

interface Active {
  source: Source;
  service: Service;
  allocatable: Record<string, number>;
}

const weightOf = (sku: string) => productBySku(sku)?.weightKg ?? 1;

export function demandOf(order: Order): Demand {
  const demand: Demand = {};
  for (const line of order.lines) {
    if (line.qty > 0) demand[line.sku] = (demand[line.sku] ?? 0) + line.qty;
  }
  return demand;
}

export const allocatableOf = (rec: { physical: number; reserved: number; protected: number } | undefined) =>
  rec ? Math.max(0, rec.physical - rec.reserved - rec.protected) : 0;

const usableServices = (source: Source) => source.services.filter((s) => s.available && !s.cutoffPassed);

/** Step 1 + 2: compute allocatable stock and decide which sources may be used at all. */
export function normalize(demand: Demand, network: Network): NormalizedSource[] {
  return network.sources.map((source) => {
    const allocatable: Record<string, number> = {};
    for (const sku of Object.keys(demand)) allocatable[sku] = allocatableOf(source.stock[sku]);
    const reasons: ExclusionReason[] = [];
    if (source.dataAgeMin > network.settings.staleThresholdMin) reasons.push('stale');
    if (!source.ready) reasons.push('notReady');
    if (Object.values(allocatable).every((q) => q === 0)) reasons.push('noStock');
    if (usableServices(source).length === 0) reasons.push('noService');
    return { source, allocatable, eligible: reasons.length === 0, reasons };
  });
}

/**
 * Greedy allocation for one source/service assignment: cheapest unit cost first, nearest first on ties.
 * Exact for a single SKU; for several SKUs we try every SKU order (the pilot would use a bounded MIP).
 */
function allocate(active: Active[], demand: Demand): Record<string, number>[] | null {
  const order = [...active.keys()].sort(
    (i, j) =>
      active[i].service.perUnitCost - active[j].service.perUnitCost ||
      active[i].source.distanceKm - active[j].source.distanceKm,
  );
  const skus = Object.keys(demand);
  for (const skuOrder of permutations(skus)) {
    const result = active.map(() => ({}) as Record<string, number>);
    const loadLeft = active.map((a) => a.service.maxLoadKg ?? Infinity);
    let ok = true;
    for (const sku of skuOrder) {
      let remaining = demand[sku];
      const w = weightOf(sku);
      for (const i of order) {
        if (remaining === 0) break;
        const cap = Math.min(active[i].allocatable[sku] ?? 0, Math.floor(loadLeft[i] / w));
        const take = Math.min(cap, remaining);
        if (take > 0) {
          result[i][sku] = take;
          loadLeft[i] -= take * w;
          remaining -= take;
        }
      }
      if (remaining > 0) {
        ok = false;
        break;
      }
    }
    if (ok) return result;
  }
  return null;
}

function permutations<T>(items: T[]): T[][] {
  if (items.length <= 1) return [items];
  return items.flatMap((item, i) =>
    permutations([...items.slice(0, i), ...items.slice(i + 1)]).map((rest) => [item, ...rest]),
  );
}

function buildPlan(active: Active[], units: Record<string, number>[], settings: Settings): Plan {
  const shipments: Shipment[] = active.map((a, i) => {
    const totalUnits = Object.values(units[i]).reduce((s, q) => s + q, 0);
    const weightKg = Object.entries(units[i]).reduce((s, [sku, q]) => s + q * weightOf(sku), 0);
    return {
      sourceId: a.source.id,
      service: a.service.id,
      units: units[i],
      totalUnits,
      weightKg,
      fixedCost: a.service.fixedCost,
      variableCost: totalUnits * a.service.perUnitCost,
      hours: a.service.hours,
    };
  });
  const fixedCost = shipments.reduce((s, x) => s + x.fixedCost, 0);
  const variableCost = shipments.reduce((s, x) => s + x.variableCost, 0);
  return {
    id: shipments.map((s) => `${s.sourceId}:${s.service}:${s.totalUnits}`).join('|'),
    shipments,
    cost: fixedCost + variableCost,
    fixedCost,
    variableCost,
    hours: Math.max(...shipments.map((s) => s.hours)),
    deliveries: shipments.length,
    customerFee: shipments.reduce((s, x) => s + settings.customerFee[x.service], 0),
  };
}

/** Steps 4 + 5: enumerate every source × service assignment and reject the ones that break a constraint. */
function enumeratePlans(
  demand: Demand,
  eligible: NormalizedSource[],
  constraints: Constraints,
  settings: Settings,
): { funnel: Funnel; plans: Plan[] } {
  const rejected: Record<RejectReason, number> = { stock: 0, load: 0, deadline: 0, deliveries: 0, redundant: 0 };
  const plans: Plan[] = [];
  let tried = 0;
  const choices = eligible.map((n) => [null, ...usableServices(n.source)]);

  const walk = (i: number, picked: Active[]) => {
    if (i === eligible.length) {
      if (picked.length === 0) return;
      tried++;
      for (const [sku, qty] of Object.entries(demand)) {
        if (picked.reduce((s, a) => s + (a.allocatable[sku] ?? 0), 0) < qty) return void rejected.stock++;
      }
      const units = allocate(picked, demand);
      if (!units) return void rejected.load++;
      if (Math.max(...picked.map((a) => a.service.hours)) > constraints.deadlineHours) return void rejected.deadline++;
      if (picked.length > constraints.maxDeliveries) return void rejected.deliveries++;
      if (units.some((u) => Object.keys(u).length === 0)) return void rejected.redundant++;
      plans.push(buildPlan(picked, units, settings));
      return;
    }
    for (const service of choices[i]) {
      walk(i + 1, service ? [...picked, { source: eligible[i].source, service, allocatable: eligible[i].allocatable }] : picked);
    }
  };
  walk(0, []);
  plans.sort((a, b) => a.cost - b.cost || a.hours - b.hours || a.deliveries - b.deliveries);
  return { funnel: { tried, rejected, feasible: plans.length }, plans };
}

const dominates = (q: Plan, p: Plan) =>
  q.cost <= p.cost &&
  q.hours <= p.hours &&
  q.deliveries <= p.deliveries &&
  (q.cost < p.cost || q.hours < p.hours || q.deliveries < p.deliveries);

/** Step 6: drop duplicates and dominated plans, then keep a few materially different options. */
export function frontierOf(plans: Plan[]): Plan[] {
  const seen = new Set<string>();
  return plans.filter((p) => {
    const key = `${p.cost}|${p.hours}|${p.deliveries}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return !plans.some((q) => dominates(q, p));
  });
}

export function selectOptions(frontier: Plan[]): RankedOption[] {
  if (frontier.length === 0) return [];
  const byCost = [...frontier].sort((a, b) => a.cost - b.cost || a.deliveries - b.deliveries || a.hours - b.hours);
  const cheapest = byCost[0];
  const fastest = [...frontier].sort((a, b) => a.hours - b.hours || a.cost - b.cost)[0];
  const balanced = byCost.find((p) => p.hours < cheapest.hours && p.hours > fastest.hours);
  const fewest = [...frontier].sort((a, b) => a.deliveries - b.deliveries || a.cost - b.cost)[0];

  const out: RankedOption[] = [];
  const add = (kind: OptionKind, plan: Plan | undefined) => {
    if (plan && !out.some((o) => o.plan.id === plan.id)) out.push({ kind, plan });
  };
  add('cheapest', cheapest);
  add('balanced', balanced);
  add('fastest', fastest);
  if (fewest.deliveries < cheapest.deliveries) add('fewest', fewest);
  return out;
}

/** The current rule we compare against: fill from the nearest source first, standard service where possible. */
export function nearestFirstBaseline(demand: Demand, eligible: NormalizedSource[], settings: Settings): Plan | null {
  const sorted = [...eligible].sort((a, b) => a.source.distanceKm - b.source.distanceKm);
  const remaining = { ...demand };
  const picked: Active[] = [];
  const units: Record<string, number>[] = [];
  for (const n of sorted) {
    if (Object.values(remaining).every((q) => q === 0)) break;
    const services = usableServices(n.source);
    const service = services.find((s) => s.id === 'standard') ?? services[0];
    let loadLeft = service.maxLoadKg ?? Infinity;
    const u: Record<string, number> = {};
    for (const sku of Object.keys(remaining)) {
      const take = Math.min(remaining[sku], n.allocatable[sku] ?? 0, Math.floor(loadLeft / weightOf(sku)));
      if (take > 0) {
        u[sku] = take;
        remaining[sku] -= take;
        loadLeft -= take * weightOf(sku);
      }
    }
    if (Object.keys(u).length > 0) {
      picked.push({ source: n.source, service, allocatable: n.allocatable });
      units.push(u);
    }
  }
  if (Object.values(remaining).some((q) => q > 0) || picked.length === 0) return null;
  return buildPlan(picked, units, settings);
}

export function analyze(order: Order, network: Network): Analysis {
  const demand = demandOf(order);
  const normalized = normalize(demand, network);
  const eligible = normalized.filter((n) => n.eligible);
  const totalAllocatable: Record<string, number> = {};
  const shortage: Record<string, number> = {};
  for (const [sku, qty] of Object.entries(demand)) {
    totalAllocatable[sku] = eligible.reduce((s, n) => s + (n.allocatable[sku] ?? 0), 0);
    if (totalAllocatable[sku] < qty) shortage[sku] = qty - totalAllocatable[sku];
  }
  const singleSourceCovers = eligible
    .filter((n) => Object.entries(demand).every(([sku, qty]) => (n.allocatable[sku] ?? 0) >= qty))
    .map((n) => n.source.id);

  const constraints: Constraints = {
    deadlineHours: order.deadlineHours,
    maxDeliveries: order.allowSplit ? order.maxDeliveries : 1,
  };
  const { funnel, plans } = enumeratePlans(demand, eligible, constraints, network.settings);
  const frontier = frontierOf(plans);
  const options = selectOptions(frontier);
  const baseline = nearestFirstBaseline(demand, eligible, network.settings);

  let blocker: Blocker | null = null;
  let alternatives: Alternatives | null = null;
  if (plans.length === 0) {
    const relaxedDeadline = enumeratePlans(demand, eligible, { ...constraints, deadlineHours: Infinity }, network.settings).plans;
    const relaxedSplit = enumeratePlans(demand, eligible, { ...constraints, maxDeliveries: Infinity }, network.settings).plans;
    if (eligible.length === 0) blocker = 'noEligible';
    else if (Object.keys(shortage).length > 0) blocker = 'stock';
    else if (relaxedDeadline.length > 0) blocker = 'deadline';
    else if (relaxedSplit.length > 0) blocker = 'deliveries';
    else blocker = 'load';

    let partial: Alternatives['partial'] = null;
    if (blocker === 'stock') {
      const available: Demand = {};
      for (const [sku, qty] of Object.entries(demand)) {
        if (Math.min(qty, totalAllocatable[sku]) > 0) available[sku] = Math.min(qty, totalAllocatable[sku]);
      }
      const p = enumeratePlans(available, eligible, { deadlineHours: Infinity, maxDeliveries: Infinity }, network.settings).plans;
      if (p.length > 0) {
        const best = [...p].sort((a, b) => a.hours - b.hours || a.cost - b.cost).find((x) => x.hours <= order.deadlineHours) ?? p[0];
        partial = { units: Object.values(available).reduce((s, q) => s + q, 0), plan: best };
      }
    }
    alternatives = {
      partial,
      laterDeadline: [...relaxedDeadline].sort((a, b) => a.hours - b.hours || a.cost - b.cost)[0] ?? null,
      moreDeliveries: relaxedSplit[0] ?? null,
    };
  }

  const demandUnits = Object.values(demand).reduce((s, q) => s + q, 0);
  const demandWeightKg = Object.entries(demand).reduce((s, [sku, q]) => s + q * weightOf(sku), 0);
  return {
    demand,
    demandUnits,
    demandWeightKg,
    normalized,
    eligibleCount: eligible.length,
    totalAllocatable,
    singleSourceCovers,
    shortage,
    funnel,
    feasiblePlans: plans,
    frontier,
    options,
    baseline,
    blocker,
    alternatives,
  };
}

/** Human-readable allocation, e.g. "A45 + C55". */
export const allocationLabel = (plan: Plan) => plan.shipments.map((s) => `${s.sourceId}${s.totalUnits}`).join(' + ');
