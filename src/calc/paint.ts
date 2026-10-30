import { MATERIALS, type MaterialSettings } from '@/config/materials';

import { fmt, type Step } from './format';

export interface PaintInput {
  areaM2: number;
  coats: number;
  coverageM2PerL: number;
  /** Can size in liters; null to skip the can count. */
  canLitres: number | null;
  wastePercent: number;
  /** Add sealer and putty before the paint. */
  includePrep: boolean;
}

export interface PaintResult {
  paintL: number;
  /** Cans of paint, rounded up; null when no can size was given. */
  cans: number | null;
  /** 0 when preparation is not included. */
  sealerL: number;
  /** 0 when preparation is not included. */
  puttyKg: number;
  steps: Step[];
}

/** Returns null when the area, coats or coverage is missing or not usable. */
export function calcPaint(input: PaintInput, settings: MaterialSettings = MATERIALS): PaintResult | null {
  const { areaM2, coats, coverageM2PerL, canLitres, wastePercent, includePrep } = input;
  if (!(areaM2 > 0 && coverageM2PerL > 0)) return null;
  if (!(Number.isInteger(coats) && coats >= 1)) return null;
  if (canLitres !== null && !(canLitres > 0)) return null;
  if (!(wastePercent >= 0 && wastePercent < 100)) return null;

  const { sealer, putty } = settings.paint;
  const waste = 1 + wastePercent / 100;

  const paintL = ((areaM2 * coats) / coverageM2PerL) * waste;
  const cans = canLitres === null ? null : Math.ceil(paintL / canLitres - 1e-9);
  const sealerL = includePrep ? ((areaM2 * sealer.coats) / sealer.coverageM2PerL) * waste : 0;
  const puttyKg = includePrep ? areaM2 * putty.coats * putty.kgPerM2PerCoat * waste : 0;

  const steps: Step[] = [
    {
      labelKey: 'paint.step.paint',
      expr: `P = A × n ÷ c × (1 + ${fmt(wastePercent)}%) = ${fmt(areaM2, 3)} × ${coats} ÷ ${fmt(coverageM2PerL, 3)} × ${fmt(waste, 4)} = ${fmt(paintL, 2)} L`,
    },
  ];
  if (cans !== null) {
    steps.push({
      labelKey: 'paint.step.cans',
      expr: `K = ⌈P ÷ ${fmt(canLitres!, 3)} L⌉ = ⌈${fmt(paintL / canLitres!, 2)}⌉ = ${cans}`,
    });
  }
  if (includePrep) {
    steps.push(
      {
        labelKey: 'paint.step.sealer',
        expr: `S = A × ${sealer.coats} ÷ ${sealer.coverageM2PerL} × ${fmt(waste, 4)} = ${fmt(sealerL, 2)} L`,
      },
      {
        labelKey: 'paint.step.putty',
        expr: `M = A × ${putty.coats} × ${putty.kgPerM2PerCoat} kg/m² × ${fmt(waste, 4)} = ${fmt(puttyKg, 1)} kg`,
      },
    );
  }

  return { paintL, cans, sealerL, puttyKg, steps };
}
