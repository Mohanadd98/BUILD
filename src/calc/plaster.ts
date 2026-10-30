import { MATERIALS, type MaterialSettings } from '@/config/materials';

import { fmt, type Step } from './format';

export type PlasterSide = keyof MaterialSettings['plaster']['thicknessCm'];

export interface PlasterInput {
  areaM2: number;
  thicknessCm: number;
  wastePercent: number;
  /** Add the spatter coat (طرطشة) before the plaster. */
  includeSpatter: boolean;
}

export interface PlasterResult {
  /** Plaster coat mortar with waste allowance. */
  plasterM3: number;
  /** Spatter coat mortar with waste allowance; 0 when not included. */
  spatterM3: number;
  /** Total cement for both coats. */
  cementKg: number;
  cementBags: number;
  /** Total sand for both coats. */
  sandM3: number;
  steps: Step[];
}

/** Returns null when the area or thickness is missing, zero or negative. */
export function calcPlaster(input: PlasterInput, settings: MaterialSettings = MATERIALS): PlasterResult | null {
  const { areaM2, thicknessCm, wastePercent, includeSpatter } = input;
  if (!(areaM2 > 0 && thicknessCm > 0)) return null;
  if (!(wastePercent >= 0 && wastePercent < 100)) return null;

  const m = settings.plaster.mortar;
  const sp = settings.plaster.spatter;
  const bagKg = settings.cementBagKg;
  const thicknessM = thicknessCm / 100;
  const spatterThicknessM = sp.thicknessCm / 100;
  const wasteFactor = 1 + wastePercent / 100;

  const plasterM3 = areaM2 * thicknessM * wasteFactor;
  const plasterCementKg = plasterM3 * m.cementKgPerM3;
  const plasterSandM3 = plasterM3 * m.sandM3PerM3;

  const spatterM3 = includeSpatter ? areaM2 * spatterThicknessM * wasteFactor : 0;
  const spatterCementKg = spatterM3 * sp.cementKgPerM3;
  const spatterSandM3 = spatterM3 * sp.sandM3PerM3;

  const cementKg = plasterCementKg + spatterCementKg;
  const cementBags = Math.ceil(cementKg / bagKg - 1e-9);
  const sandM3 = plasterSandM3 + spatterSandM3;

  const steps: Step[] = [
    {
      labelKey: 'plaster.step.plaster',
      expr: `P = A × t × (1 + ${fmt(wastePercent)}%) = ${fmt(areaM2, 3)} × ${fmt(thicknessM, 3)} × ${fmt(wasteFactor, 4)} = ${fmt(plasterM3, 4)} m³`,
    },
    {
      labelKey: 'plaster.step.plasterMaterials',
      expr: `Cp = P × ${m.cementKgPerM3} = ${fmt(plasterCementKg, 1)} kg,  Sp = P × ${m.sandM3PerM3} = ${fmt(plasterSandM3, 3)} m³`,
    },
  ];
  if (includeSpatter) {
    steps.push(
      {
        labelKey: 'plaster.step.spatter',
        expr: `T = A × ${fmt(spatterThicknessM, 3)} × ${fmt(wasteFactor, 4)} = ${fmt(spatterM3, 4)} m³`,
      },
      {
        labelKey: 'plaster.step.spatterMaterials',
        expr: `Ct = T × ${sp.cementKgPerM3} = ${fmt(spatterCementKg, 1)} kg,  St = T × ${sp.sandM3PerM3} = ${fmt(spatterSandM3, 3)} m³`,
      },
    );
  }
  steps.push(
    {
      labelKey: 'plaster.step.cement',
      expr: includeSpatter
        ? `C = Cp + Ct = ${fmt(plasterCementKg, 1)} + ${fmt(spatterCementKg, 1)} = ${fmt(cementKg, 1)} kg → ⌈C ÷ ${bagKg}⌉ = ${cementBags}`
        : `C = Cp = ${fmt(cementKg, 1)} kg → ⌈C ÷ ${bagKg}⌉ = ${cementBags}`,
    },
    {
      labelKey: 'plaster.step.sand',
      expr: includeSpatter
        ? `S = Sp + St = ${fmt(plasterSandM3, 3)} + ${fmt(spatterSandM3, 3)} = ${fmt(sandM3, 3)} m³`
        : `S = Sp = ${fmt(sandM3, 3)} m³`,
    },
  );

  return { plasterM3, spatterM3, cementKg, cementBags, sandM3, steps };
}
