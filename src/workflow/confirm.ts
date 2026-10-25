import { allocatableOf } from '../engine/engine';
import type { Network, Plan } from '../engine/types';

export type Failure = 'none' | 'stockChanged' | 'transportUnavailable' | 'unknownResult';

export type Stage = 'revalidate' | 'hold' | 'book' | 'release';

export type EventKind =
  | 'revalidateOk'
  | 'holdOk'
  | 'holdFail'
  | 'bookOk'
  | 'bookFail'
  | 'bookTimeout'
  | 'statusQuery'
  | 'releaseHold'
  | 'cancelBooking'
  | 'escalate'
  | 'releaseTask'
  | 'confirmed';

export interface WorkflowEvent {
  stage: Stage;
  kind: EventKind;
  tone: 'ok' | 'fail' | 'warn' | 'undo';
  sourceId?: string;
  units?: number;
  service?: string;
  key?: string; // idempotency key
}

export interface WorkflowResult {
  orderId: string;
  events: WorkflowEvent[];
  outcome: 'confirmed' | 'compensated';
  /** The network as the system sees it after a failure, used to re-plan. */
  networkAfter: Network;
}

/**
 * Simulated confirmation saga: revalidate → hold stock → book transport → release tasks.
 * When a step fails, every successful earlier step is compensated before anything is promised.
 */
export function runConfirmation(plan: Plan, network: Network, failure: Failure, orderId: string): WorkflowResult {
  const events: WorkflowEvent[] = [];
  const next: Network = structuredClone(network);
  const holds: string[] = [];
  const bookings: { sourceId: string; service: string }[] = [];

  const compensate = () => {
    for (const b of [...bookings].reverse()) events.push({ stage: 'book', kind: 'cancelBooking', tone: 'undo', ...b });
    for (const id of [...holds].reverse()) events.push({ stage: 'hold', kind: 'releaseHold', tone: 'undo', sourceId: id });
    events.push({ stage: 'release', kind: 'escalate', tone: 'warn' });
    return { orderId, events, outcome: 'compensated' as const, networkAfter: next };
  };

  for (const s of plan.shipments) {
    events.push({ stage: 'revalidate', kind: 'revalidateOk', tone: 'ok', sourceId: s.sourceId, units: s.totalUnits });
  }

  for (const [i, s] of plan.shipments.entries()) {
    const key = `HOLD-${orderId}-${s.sourceId}`;
    if (failure === 'stockChanged' && i === plan.shipments.length - 1) {
      // Another sale took 10 units between revalidation and hold.
      const src = next.sources.find((x) => x.id === s.sourceId)!;
      for (const sku of Object.keys(s.units)) {
        const rec = src.stock[sku];
        rec.reserved += Math.min(10, allocatableOf(rec));
      }
      events.push({ stage: 'hold', kind: 'holdFail', tone: 'fail', sourceId: s.sourceId, units: s.totalUnits, key });
      return compensate();
    }
    holds.push(s.sourceId);
    events.push({ stage: 'hold', kind: 'holdOk', tone: 'ok', sourceId: s.sourceId, units: s.totalUnits, key });
  }

  const failIndex = Math.max(0, plan.shipments.findIndex((s) => s.service === 'express'));
  for (const [i, s] of plan.shipments.entries()) {
    const key = `BOOK-${orderId}-${s.sourceId}-${s.service}`;
    if (failure === 'transportUnavailable' && i === failIndex) {
      const svc = next.sources.find((x) => x.id === s.sourceId)!.services.find((v) => v.id === s.service)!;
      svc.available = false;
      events.push({ stage: 'book', kind: 'bookFail', tone: 'fail', sourceId: s.sourceId, service: s.service, key });
      return compensate();
    }
    if (failure === 'unknownResult' && i === 0) {
      events.push({ stage: 'book', kind: 'bookTimeout', tone: 'warn', sourceId: s.sourceId, service: s.service, key });
      events.push({ stage: 'book', kind: 'statusQuery', tone: 'ok', sourceId: s.sourceId, service: s.service, key });
    } else {
      events.push({ stage: 'book', kind: 'bookOk', tone: 'ok', sourceId: s.sourceId, service: s.service, key });
    }
    bookings.push({ sourceId: s.sourceId, service: s.service });
  }

  for (const s of plan.shipments) {
    events.push({ stage: 'release', kind: 'releaseTask', tone: 'ok', sourceId: s.sourceId, units: s.totalUnits });
  }
  events.push({ stage: 'release', kind: 'confirmed', tone: 'ok' });
  return { orderId, events, outcome: 'confirmed', networkAfter: next };
}
