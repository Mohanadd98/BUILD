import { calcPaint } from '@/calc/paint';
import { MATERIALS } from '@/config/materials';

const walls = {
  areaM2: 100,
  coats: 2,
  coverageM2PerL: 10,
  canLitres: 4,
  wastePercent: 10,
  includePrep: true,
};

describe('calcPaint', () => {
  it('100 m², 2 coats, with sealer and putty, hand checked', () => {
    // paint = 100 × 2 ÷ 10 × 1.1 = 22 L -> ⌈5.5⌉ = 6 cans of 4 L
    // sealer = 100 × 1 ÷ 10 × 1.1 = 11 L
    // putty = 100 × 2 × 0.6 × 1.1 = 132 kg
    const r = calcPaint(walls)!;
    expect(r.paintL).toBeCloseTo(22, 9);
    expect(r.cans).toBe(6);
    expect(r.sealerL).toBeCloseTo(11, 9);
    expect(r.puttyKg).toBeCloseTo(132, 9);
  });

  it('paint only, without preparation', () => {
    const r = calcPaint({ ...walls, includePrep: false })!;
    expect(r.paintL).toBeCloseTo(22, 9);
    expect(r.sealerL).toBe(0);
    expect(r.puttyKg).toBe(0);
    expect(r.steps).toHaveLength(2);
  });

  it('skips the can count when no can size is given', () => {
    const r = calcPaint({ ...walls, canLitres: null })!;
    expect(r.cans).toBeNull();
    expect(r.steps.map((s) => s.labelKey)).not.toContain('paint.step.cans');
  });

  it('does not add a can when the liters are an exact multiple', () => {
    // 100 × 2 ÷ 10 = 20 L, no waste, 4 L cans -> exactly 5
    const r = calcPaint({ ...walls, wastePercent: 0 })!;
    expect(r.cans).toBe(5);
  });

  it('reads sealer and putty rates from the settings file', () => {
    const custom = {
      ...MATERIALS,
      paint: { ...MATERIALS.paint, sealer: { coverageM2PerL: 8, coats: 1 }, putty: { kgPerM2PerCoat: 1, coats: 1 } },
    } as unknown as typeof MATERIALS;
    const r = calcPaint({ ...walls, wastePercent: 0 }, custom)!;
    expect(r.sealerL).toBeCloseTo(12.5, 9);
    expect(r.puttyKg).toBeCloseTo(100, 9);
  });

  it('shows the formula with the real numbers', () => {
    const r = calcPaint(walls)!;
    expect(r.steps.map((s) => s.expr)).toEqual([
      'P = A × n ÷ c × (1 + 10%) = 100 × 2 ÷ 10 × 1.1 = 22 L',
      'K = ⌈P ÷ 4 L⌉ = ⌈5.5⌉ = 6',
      'S = A × 1 ÷ 10 × 1.1 = 11 L',
      'M = A × 2 × 0.6 kg/m² × 1.1 = 132 kg',
    ]);
  });

  it.each([
    { areaM2: 0 },
    { coats: 0 },
    { coats: 1.5 },
    { coverageM2PerL: 0 },
    { canLitres: 0 },
    { wastePercent: -1 },
  ])('rejects invalid input %o', (bad) => {
    expect(calcPaint({ ...walls, ...bad })).toBeNull();
  });
});
