import { calcConcrete, codeRequirement } from '@/calc/concrete';
import { MATERIALS } from '@/config/materials';

describe('calcConcrete', () => {
  // Hand check: 5 × 4 × 0.15 = 3.000 m³, +5% = 3.150 m³
  // reinforced: 3.15 × 350 = 1102.5 kg -> 22.05 bags -> 23 bags
  // sand 3.15 × 0.4 = 1.26 m³, gravel 3.15 × 0.8 = 2.52 m³
  const slab = { lengthM: 5, widthM: 4, thicknessCm: 15, mix: 'normal', wastePercent: 5 } as const;

  it('computes a reinforced slab (normal exposure, 350 kg/m³) by hand-checked numbers', () => {
    const r = calcConcrete(slab)!;
    expect(r.volumeM3).toBeCloseTo(3.0, 6);
    expect(r.orderVolumeM3).toBeCloseTo(3.15, 6);
    expect(r.cementKg).toBeCloseTo(1102.5, 6);
    expect(r.cementBags).toBe(23);
    expect(r.sandM3).toBeCloseTo(1.26, 6);
    expect(r.gravelM3).toBeCloseTo(2.52, 6);
  });

  it('uses the lower cement content for plain concrete', () => {
    const r = calcConcrete({ ...slab, mix: 'plain' })!;
    expect(r.cementKg).toBeCloseTo(3.15 * 250, 6);
    expect(r.cementBags).toBe(16); // 787.5 / 50 = 15.75
  });

  it('uses the ECP 203-2025 Table 2-21 cement content for each exposure', () => {
    // 3.15 m³ × 325 = 1023.75 kg -> 20.475 -> 21 bags
    const dry = calcConcrete({ ...slab, mix: 'dry' })!;
    expect(dry.cementKg).toBeCloseTo(1023.75, 6);
    expect(dry.cementBags).toBe(21);
    // 3.15 m³ × 375 = 1181.25 kg -> 23.625 -> 24 bags
    const wetDry = calcConcrete({ ...slab, mix: 'wetDry' })!;
    expect(wetDry.cementKg).toBeCloseTo(1181.25, 6);
    expect(wetDry.cementBags).toBe(24);
  });

  it('keeps every mix within the 450 kg/m³ upper limit of clause 2-3-4-2-4', () => {
    for (const m of Object.values(MATERIALS.concrete.mixes)) expect(m.cementKgPerM3).toBeLessThanOrEqual(450);
  });

  it('states the code requirement for each concrete type', () => {
    expect(codeRequirement('plain')).toBe('fcu ≥ 15 N/mm² · ECP 203-2025 cl. 2-3-2-1');
    expect(codeRequirement('dry')).toBe('fcu ≥ 25 N/mm² · w/c ≤ 0.6 · ECP 203-2025 Table 2-21');
    expect(codeRequirement('normal')).toBe('fcu ≥ 30 N/mm² · w/c ≤ 0.5 (0.55 foundations) · ECP 203-2025 Table 2-21');
    expect(codeRequirement('wetDry')).toBe('fcu ≥ 35 N/mm² · w/c ≤ 0.45 · ECP 203-2025 Table 2-21');
  });

  it('does not add a bag when the cement is an exact multiple of 50 kg', () => {
    // 2 × 1 × 0.1 = 0.2 m³ × 250 = 50 kg exactly -> 1 bag
    const r = calcConcrete({ lengthM: 2, widthM: 1, thicknessCm: 10, mix: 'plain', wastePercent: 0 })!;
    expect(r.cementKg).toBeCloseTo(50, 9);
    expect(r.cementBags).toBe(1);
  });

  it('reads every ratio from the settings file', () => {
    const custom = {
      ...MATERIALS,
      cementBagKg: 25,
      concrete: {
        ...MATERIALS.concrete,
        mixes: {
          ...MATERIALS.concrete.mixes,
          normal: { ...MATERIALS.concrete.mixes.normal, cementKgPerM3: 400, sandM3PerM3: 0.5, gravelM3PerM3: 0.7 },
        },
      },
    } as unknown as typeof MATERIALS;
    const r = calcConcrete({ ...slab, wastePercent: 0 }, custom)!;
    expect(r.cementKg).toBeCloseTo(1200, 6);
    expect(r.cementBags).toBe(48);
    expect(r.sandM3).toBeCloseTo(1.5, 6);
    expect(r.gravelM3).toBeCloseTo(2.1, 6);
  });

  it('shows the formula with the real numbers', () => {
    const r = calcConcrete(slab)!;
    expect(r.steps.map((s) => s.expr)).toEqual([
      'V = L × W × T = 5 × 4 × 0.15 = 3 m³',
      "V' = V × (1 + 5%) = 3 × 1.05 = 3.15 m³",
      "C = V' × 350 kg/m³ = 1102.5 kg",
      'N = ⌈C ÷ 50 kg⌉ = ⌈22.05⌉ = 23',
      "S = V' × 0.4 = 1.26 m³",
      "G = V' × 0.8 = 2.52 m³",
    ]);
  });

  it.each([
    { lengthM: 0 },
    { widthM: -1 },
    { thicknessCm: Number.NaN },
    { wastePercent: -5 },
    { wastePercent: 100 },
  ])('rejects invalid input %o', (bad) => {
    expect(calcConcrete({ ...slab, ...bad })).toBeNull();
  });
});
