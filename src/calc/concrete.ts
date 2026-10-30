import { MATERIALS, type MaterialSettings } from '@/config/materials';

import { fmt, type Step } from './format';

export type ConcreteMix = keyof MaterialSettings['concrete']['mixes'];

export interface ConcreteInput {
  lengthM: number;
  widthM: number;
  thicknessCm: number;
  mix: ConcreteMix;
  wastePercent: number;
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

/** Returns null when any dimension is missing, zero or negative. */
export function calcConcrete(
  input: ConcreteInput,
  settings: MaterialSettings = MATERIALS,
): ConcreteResult | null {
  const { lengthM, widthM, thicknessCm, mix, wastePercent } = input;
  if (!(lengthM > 0 && widthM > 0 && thicknessCm > 0)) return null;
  if (!(wastePercent >= 0 && wastePercent < 100)) return null;

  const m = settings.concrete.mixes[mix];
  const bagKg = settings.cementBagKg;
  const thicknessM = thicknessCm / 100;
  const wasteFactor = 1 + wastePercent / 100;

  const volumeM3 = lengthM * widthM * thicknessM;
  const orderVolumeM3 = volumeM3 * wasteFactor;
  const cementKg = orderVolumeM3 * m.cementKgPerM3;
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
      expr: `C = V' × ${m.cementKgPerM3} kg/m³ = ${fmt(cementKg, 1)} kg`,
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
