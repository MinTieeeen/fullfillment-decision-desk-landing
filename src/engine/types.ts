export type ServiceId = 'standard' | 'express';
export type SourceKind = 'current' | 'store' | 'warehouse';

export interface Product {
  sku: string;
  name: { en: string; vi: string };
  unit: { en: string; vi: string };
  weightKg: number;
}

export interface StockRecord {
  physical: number;
  reserved: number; // already held for other orders
  protected: number; // display / safety stock that must not be allocated
}

export interface Service {
  id: ServiceId;
  fixedCost: number; // SEK per delivery (modelled internal cost)
  perUnitCost: number; // SEK per unit
  hours: number; // estimated completion time
  maxLoadKg: number | null; // null = no relevant limit
  cutoffPassed: boolean;
  available: boolean;
}

export interface Source {
  id: string;
  name: string;
  kind: SourceKind;
  distanceKm: number;
  dataAgeMin: number;
  ready: boolean;
  stock: Record<string, StockRecord>;
  services: Service[];
}

export interface OrderLine {
  sku: string;
  qty: number;
}

export interface Order {
  customerName: string;
  customerType: 'b2b' | 'b2c';
  phone: string;
  siteId: string;
  lines: OrderLine[];
  deadlineHours: number;
  allowSplit: boolean;
  maxDeliveries: number;
  preference: 'none' | 'cheap' | 'fast';
}

export interface Settings {
  staleThresholdMin: number;
  customerFee: Record<ServiceId, number>; // SEK per delivery charged to the customer (assumed policy)
}

export interface Network {
  sources: Source[];
  settings: Settings;
}

export interface Shipment {
  sourceId: string;
  service: ServiceId;
  units: Record<string, number>; // sku -> qty
  totalUnits: number;
  weightKg: number;
  fixedCost: number;
  variableCost: number;
  hours: number;
}

export interface Plan {
  id: string;
  shipments: Shipment[];
  cost: number;
  fixedCost: number;
  variableCost: number;
  hours: number;
  deliveries: number;
  customerFee: number;
}

export type ExclusionReason = 'stale' | 'notReady' | 'noStock' | 'noService';

export interface NormalizedSource {
  source: Source;
  allocatable: Record<string, number>;
  eligible: boolean;
  reasons: ExclusionReason[];
}

export type RejectReason = 'stock' | 'load' | 'deadline' | 'deliveries' | 'redundant';

export interface Funnel {
  tried: number;
  rejected: Record<RejectReason, number>;
  feasible: number;
}

export type OptionKind = 'cheapest' | 'balanced' | 'fastest' | 'fewest';

export interface RankedOption {
  kind: OptionKind;
  plan: Plan;
}

export type Blocker = 'stock' | 'load' | 'deadline' | 'deliveries' | 'noEligible';

export interface Analysis {
  demand: Record<string, number>;
  demandUnits: number;
  demandWeightKg: number;
  normalized: NormalizedSource[];
  eligibleCount: number;
  totalAllocatable: Record<string, number>;
  singleSourceCovers: string[]; // ids of sources that alone can cover the order
  shortage: Record<string, number>;
  funnel: Funnel;
  feasiblePlans: Plan[];
  frontier: Plan[]; // non-dominated plans on cost x time x deliveries
  options: RankedOption[];
  baseline: Plan | null;
  blocker: Blocker | null;
  alternatives: Alternatives | null;
}

export interface Alternatives {
  partial: { units: number; plan: Plan } | null; // ship what is available now
  laterDeadline: Plan | null; // fastest plan if deadline is relaxed
  moreDeliveries: Plan | null; // cheapest plan if split limit relaxed
}
