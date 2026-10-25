import { sites } from '../data/catalog';
import type { Network, Order, Plan, Shipment } from '../engine/types';

/** Distances depend on the delivery site chosen in the order. */
export function withSiteDistances(network: Network, siteId: string): Network {
  const site = sites.find((s) => s.id === siteId);
  if (!site) return network;
  return { ...network, sources: network.sources.map((s) => ({ ...s, distanceKm: site.distances[s.id] ?? s.distanceKm })) };
}

export const sourceName = (network: Network, id: string) => network.sources.find((s) => s.id === id)?.name ?? id;

export const serviceOf = (network: Network, sh: Shipment) =>
  network.sources.find((s) => s.id === sh.sourceId)?.services.find((v) => v.id === sh.service);

export const maxDeliveriesOf = (order: Order) => (order.allowSplit ? order.maxDeliveries : 1);

export const newOrderId = () => `SE-A-${Math.floor(10000 + Math.random() * 90000)}`;

export const samePlan = (a: Plan | null, b: Plan | null) => !!a && !!b && a.id === b.id;
