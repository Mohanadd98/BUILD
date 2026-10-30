import { calcPlaster } from '@/calc/plaster';
import { MATERIALS } from '@/config/materials';

const base = { areaM2: 50, thicknessCm: 2, wastePercent: 10 } as const;

describe('calcPlaster', () => {
  it('internal plaster 2 cm on 50 m² without spatter, hand checked', () => {
    // P = 50 × 0.02 × 1.1 = 1.1 m³, cement = 330 kg -> 6.6 -> 7 bags, sand = 1.1 m³
    const r = calcPlaster({ ...base, includeSpatter: false })!;
    expect(r.plasterM3).toBeCloseTo(1.1, 9);
    expect(r.spatterM3).toBe(0);
    expect(r.cementKg).toBeCloseTo(330, 6);
    expect(r.cementBags).toBe(7);
    expect(r.sandM3).toBeCloseTo(1.1, 9);
  });

  it('adds the spatter coat to cement and sand, hand checked', () => {
    // spatter T = 50 × 0.005 × 1.1 = 0.275 m³ -> cement 0.275 × 450 = 123.75 kg, sand 0.275 m³
    // totals: cement 330 + 123.75 = 453.75 kg -> 9.075 -> 10 bags, sand 1.1 + 0.275 = 1.375 m³
    const r = calcPlaster({ ...base, includeSpatter: true })!;
    expect(r.spatterM3).toBeCloseTo(0.275, 9);
    expect(r.cementKg).toBeCloseTo(453.75, 6);
    expect(r.cementBags).toBe(10);
    expect(r.sandM3).toBeCloseTo(1.375, 9);
  });

  it('external plaster 2.5 cm on 50 m², hand checked', () => {
    // P = 50 × 0.025 × 1.1 = 1.375 m³, cement = 412.5 kg -> 9 bags
    const r = calcPlaster({ ...base, thicknessCm: MATERIALS.plaster.thicknessCm.external, includeSpatter: false })!;
    expect(r.plasterM3).toBeCloseTo(1.375, 9);
    expect(r.cementKg).toBeCloseTo(412.5, 6);
    expect(r.cementBags).toBe(9);
  });

  it('does not add a bag when the cement is an exact multiple of 50 kg', () => {
    // 25 × 0.02 = 0.5 m³, no waste, × 300 = 150 kg -> exactly 3 bags
    const r = calcPlaster({ areaM2: 25, thicknessCm: 2, wastePercent: 0, includeSpatter: false })!;
    expect(r.cementBags).toBe(3);
  });

  it('reads plaster and spatter mixes from the settings file', () => {
    const custom = {
      ...MATERIALS,
      plaster: {
        ...MATERIALS.plaster,
        mortar: { cementKgPerM3: 350, sandM3PerM3: 0.9 },
        spatter: { thicknessCm: 1, cementKgPerM3: 500, sandM3PerM3: 1 },
      },
    } as unknown as typeof MATERIALS;
    // plaster 1.0 m³ -> 350 kg, 0.9 m³; spatter 0.5 m³ -> 250 kg, 0.5 m³
    const r = calcPlaster({ ...base, wastePercent: 0, includeSpatter: true }, custom)!;
    expect(r.cementKg).toBeCloseTo(600, 6);
    expect(r.sandM3).toBeCloseTo(1.4, 9);
  });

  it('shows the formula with the real numbers', () => {
    const r = calcPlaster({ ...base, includeSpatter: true })!;
    expect(r.steps.map((s) => s.expr)).toEqual([
      'P = A × t × (1 + 10%) = 50 × 0.02 × 1.1 = 1.1 m³',
      'Cp = P × 300 = 330 kg,  Sp = P × 1 = 1.1 m³',
      'T = A × 0.005 × 1.1 = 0.275 m³',
      'Ct = T × 450 = 123.8 kg,  St = T × 1 = 0.275 m³',
      'C = Cp + Ct = 330 + 123.8 = 453.8 kg → ⌈C ÷ 50⌉ = 10',
      'S = Sp + St = 1.1 + 0.275 = 1.375 m³',
    ]);
  });

  it.each([{ areaM2: 0 }, { thicknessCm: -1 }, { wastePercent: -1 }, { wastePercent: 100 }])(
    'rejects invalid input %o',
    (bad) => {
      expect(calcPlaster({ ...base, includeSpatter: true, ...bad })).toBeNull();
    },
  );
});
