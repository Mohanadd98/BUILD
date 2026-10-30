import { MATERIALS, type MaterialSettings } from '@/config/materials';

import { fmt, type Step } from './format';

export type ConcreteMix = keyof MaterialSettings['concrete']['mixes'];
export type ConcreteZone = keyof MaterialSettings['concrete']['zones'];

/** The zone a concrete type is listed under. */
export function zoneOf(mix: ConcreteMix, settings: MaterialSettings = MATERIALS): ConcreteZone {
  const zones = settings.concrete.zones;
  return (Object.keys(zones) as ConcreteZone[]).find((z) => (zones[z] as readonly string[]).includes(mix)) ?? 'normal';
}

export type CementType = 'cemI' | 'cemIII';

export interface ConcreteInput {
  lengthM: number;
  widthM: number;
  thicknessCm: number;
  mix: ConcreteMix;
  wastePercent: number;
  /** Cement used; CEM III only changes the limits where the code allows it. Default CEM I. */
  cement?: CementType;
}

/** True when the code allows the CEM III reductions for this concrete type. */
export function cemIIIApplies(mix: ConcreteMix, settings: MaterialSettings = MATERIALS): boolean {
  return (settings.concrete.cemIIIReduction.appliesTo as readonly string[]).includes(mix);
}

export interface ConcreteLimits {
  cementKgPerM3: number;
  minFcu: number;
  maxWc: number | null;
  /** True when the CEM III reductions were applied. */
  reduced: boolean;
}

/** Cement content and code limits for a concrete type and cement. */
export function concreteLimits(
  mix: ConcreteMix,
  cement: CementType = 'cemI',
  settings: MaterialSettings = MATERIALS,
): ConcreteLimits {
  const m = settings.concrete.mixes[mix];
  if (cement !== 'cemIII' || !cemIIIApplies(mix, settings)) {
    return { cementKgPerM3: m.cementKgPerM3, minFcu: m.minFcu, maxWc: m.maxWc, reduced: false };
  }
  const r = settings.concrete.cemIIIReduction;
  return {
    cementKgPerM3: m.cementKgPerM3 - r.cementKgPerM3,
    minFcu: m.minFcu - r.minFcu,
    maxWc: m.maxWc === null ? null : Number((m.maxWc + r.maxWc).toFixed(2)),
    reduced: true,
  };
}

export interface ConcreteResult {
  /** Net volume L × W × T. */
  volumeM3: number;
  /** Net volume plus waste allowance; all materials are based on this. */
  orderVolumeM3: number;
  cementKg: number;
  /** Whole bags, rounded up. */
  cementBags: number;
  sandM3: number;
  gravelM3: number;
  steps: Step[];
}

/**
 * The code limits that go with a concrete type, written left to right,
 * e.g. "fcu ≥ 30 N/mm² · w/c ≤ 0.5 (0.55 foundations) · ECP 203-2025 Table 2-21".
 */
export function codeRequirement(
  mix: ConcreteMix,
  cement: CementType = 'cemI',
  settings: MaterialSettings = MATERIALS,
): string {
  const m = settings.concrete.mixes[mix];
  const lim = concreteLimits(mix, cement, settings);
  const parts = [`fcu ≥ ${lim.minFcu} N/mm²`];
  if (lim.maxWc !== null) {
    parts.push(`w/c ≤ ${lim.maxWc}${m.maxWcFoundations !== null ? ` (${m.maxWcFoundations} foundations)` : ''}`);
  }
  parts.push(`ECP 203-2025 ${m.ref}${lim.reduced ? ' note, CEM III' : ''}`);
  return parts.join(' · ');
}

/** Returns null when any dimension is missing, zero or negative. */
export function calcConcrete(
  input: ConcreteInput,
  settings: MaterialSettings = MATERIALS,
): ConcreteResult | null {
  const { lengthM, widthM, thicknessCm, mix, wastePercent, cement = 'cemI' } = input;
  if (!(lengthM > 0 && widthM > 0 && thicknessCm > 0)) return null;
  if (!(wastePercent >= 0 && wastePercent < 100)) return null;

  const m = settings.concrete.mixes[mix];
  const lim = concreteLimits(mix, cement, settings);
  const bagKg = settings.cementBagKg;
  const thicknessM = thicknessCm / 100;
  const wasteFactor = 1 + wastePercent / 100;

  const volumeM3 = lengthM * widthM * thicknessM;
  const orderVolumeM3 = volumeM3 * wasteFactor;
  const cementKg = orderVolumeM3 * lim.cementKgPerM3;
  const cementBags = Math.ceil(cementKg / bagKg - 1e-9);
  const sandM3 = orderVolumeM3 * m.sandM3PerM3;
  const gravelM3 = orderVolumeM3 * m.gravelM3PerM3;

  const steps: Step[] = [
    {
      labelKey: 'concrete.step.volume',
      expr: `V = L × W × T = ${fmt(lengthM, 3)} × ${fmt(widthM, 3)} × ${fmt(thicknessM, 3)} = ${fmt(volumeM3, 3)} m³`,
    },
    {
      labelKey: 'concrete.step.order',
      expr: `V' = V × (1 + ${fmt(wastePercent)}%) = ${fmt(volumeM3, 3)} × ${fmt(wasteFactor, 4)} = ${fmt(orderVolumeM3, 3)} m³`,
    },
    {
      labelKey: 'concrete.step.cement',
      expr: lim.reduced
        ? `C = V' × (${m.cementKgPerM3} − ${settings.concrete.cemIIIReduction.cementKgPerM3}) kg/m³ = ${fmt(cementKg, 1)} kg`
        : `C = V' × ${m.cementKgPerM3} kg/m³ = ${fmt(cementKg, 1)} kg`,
    },
    {
      labelKey: 'concrete.step.bags',
      expr: `N = ⌈C ÷ ${bagKg} kg⌉ = ⌈${fmt(cementKg / bagKg, 2)}⌉ = ${cementBags}`,
    },
    {
      labelKey: 'concrete.step.sand',
      expr: `S = V' × ${m.sandM3PerM3} = ${fmt(sandM3, 3)} m³`,
    },
    {
      labelKey: 'concrete.step.gravel',
      expr: `G = V' × ${m.gravelM3PerM3} = ${fmt(gravelM3, 3)} m³`,
    },
  ];

  return { volumeM3, orderVolumeM3, cementKg, cementBags, sandM3, gravelM3, steps };
}
