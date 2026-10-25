import type { Product } from '../engine/types';

// Synthetic catalogue. P-100 is the standardised 10 kg unit used throughout the deck.
export const catalog: Product[] = [
  {
    sku: 'P-100',
    name: { en: 'Standard building block', vi: 'Gạch block tiêu chuẩn' },
    unit: { en: 'unit', vi: 'unit' },
    weightKg: 10,
  },
  {
    sku: 'P-200',
    name: { en: 'Cement bag 25 kg', vi: 'Bao xi măng 25 kg' },
    unit: { en: 'bag', vi: 'bao' },
    weightKg: 25,
  },
  {
    sku: 'P-300',
    name: { en: 'Gypsum board', vi: 'Tấm thạch cao' },
    unit: { en: 'sheet', vi: 'tấm' },
    weightKg: 15,
  },
];

export const productBySku = (sku: string) => catalog.find((p) => p.sku === sku);

export interface Site {
  id: string;
  name: string;
  distances: Record<string, number>; // sourceId -> km
}

// Synthetic delivery sites. Distances are shown for context only; costs and times come from services.
export const sites: Site[] = [
  { id: 'site-1', name: 'Jobsite Hagalund, Solna', distances: { A: 5, B: 12, C: 25 } },
  { id: 'site-2', name: 'Jobsite Kungsholmen, Stockholm', distances: { A: 8, B: 6, C: 31 } },
];
