import type { Network, Order, Source } from '../engine/types';

// All numbers are synthetic and mirror the deck (slides 4–5 and presenter notes).
export function baseSources(): Source[] {
  return [
    {
      id: 'A',
      name: 'Store A',
      kind: 'current',
      distanceKm: 5,
      dataAgeMin: 4,
      ready: true,
      stock: {
        'P-100': { physical: 52, reserved: 4, protected: 3 },
        'P-200': { physical: 30, reserved: 5, protected: 5 },
        'P-300': { physical: 40, reserved: 0, protected: 4 },
      },
      services: [
        { id: 'standard', fixedCost: 100, perUnitCost: 2, hours: 24, maxLoadKg: null, cutoffPassed: false, available: true },
        { id: 'express', fixedCost: 160, perUnitCost: 3, hours: 8, maxLoadKg: null, cutoffPassed: false, available: true },
      ],
    },
    {
      id: 'B',
      name: 'Store B',
      kind: 'store',
      distanceKm: 12,
      dataAgeMin: 9,
      ready: true,
      stock: {
        'P-100': { physical: 40, reserved: 3, protected: 2 },
        'P-200': { physical: 18, reserved: 2, protected: 2 },
        'P-300': { physical: 25, reserved: 5, protected: 0 },
      },
      services: [
        { id: 'standard', fixedCost: 120, perUnitCost: 2, hours: 24, maxLoadKg: null, cutoffPassed: false, available: true },
        { id: 'express', fixedCost: 190, perUnitCost: 3, hours: 10, maxLoadKg: null, cutoffPassed: false, available: true },
      ],
    },
    {
      id: 'C',
      name: 'Warehouse C',
      kind: 'warehouse',
      distanceKm: 25,
      dataAgeMin: 2,
      ready: true,
      stock: {
        'P-100': { physical: 75, reserved: 15, protected: 0 },
        'P-200': { physical: 120, reserved: 20, protected: 0 },
        'P-300': { physical: 90, reserved: 10, protected: 0 },
      },
      services: [
        { id: 'standard', fixedCost: 180, perUnitCost: 2, hours: 48, maxLoadKg: null, cutoffPassed: false, available: true },
        { id: 'express', fixedCost: 280, perUnitCost: 3, hours: 12, maxLoadKg: 300, cutoffPassed: false, available: true },
      ],
    },
  ];
}

export function baseNetwork(): Network {
  return {
    sources: baseSources(),
    settings: { staleThresholdMin: 60, customerFee: { standard: 199, express: 349 } },
  };
}

export function baseOrder(): Order {
  return {
    customerName: 'Nordbygg Entreprenad AB',
    customerType: 'b2b',
    phone: '+46 70 123 45 67',
    siteId: 'site-1',
    lines: [{ sku: 'P-100', qty: 100 }],
    deadlineHours: 48,
    allowSplit: true,
    maxDeliveries: 3,
    preference: 'none',
  };
}

export function emptyOrder(): Order {
  return {
    customerName: '',
    customerType: 'b2b',
    phone: '',
    siteId: 'site-1',
    lines: [{ sku: 'P-100', qty: 0 }],
    deadlineHours: 48,
    allowSplit: true,
    maxDeliveries: 3,
    preference: 'none',
  };
}

export type ScenarioId = 'base' | 'urgent' | 'shortage' | 'stale' | 'twoSku';

export const scenarioIds: ScenarioId[] = ['base', 'urgent', 'shortage', 'stale', 'twoSku'];

export function scenario(id: ScenarioId): { order: Order; network: Network } {
  const order = baseOrder();
  const network = baseNetwork();
  switch (id) {
    case 'urgent':
      order.deadlineHours = 12;
      break;
    case 'shortage':
      order.lines = [{ sku: 'P-100', qty: 150 }];
      break;
    case 'stale':
      network.sources[1].dataAgeMin = 360;
      break;
    case 'twoSku':
      order.lines = [
        { sku: 'P-100', qty: 100 },
        { sku: 'P-200', qty: 30 },
      ];
      order.deadlineHours = 24;
      break;
  }
  return { order, network };
}
