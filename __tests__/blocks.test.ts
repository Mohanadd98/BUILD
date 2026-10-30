import { calcBlocks } from '@/calc/blocks';
import { MATERIALS } from '@/config/materials';

const { redBrick, hollowBlock } = MATERIALS.masonry.blocks;

// Wall 10 m × 3 m with 2 m² of openings -> net area 28 m². Joint 1 cm.
const wall = { wallLengthM: 10, wallHeightM: 3, openingsM2: 2, wastePercent: 5 } as const;

describe('calcBlocks', () => {
  it('half brick wall of red brick 25×12×6, hand checked', () => {
    // n = 1 / (0.26 × 0.07) = 54.945 /m²
    // net = 28 × 54.945 = 1538.46, order = ⌈1538.46 × 1.05⌉ = ⌈1615.38⌉ = 1616
    // t = 0.12 m, wall volume = 3.36 m³, brick volume = 1538.46 × 0.0018 = 2.76923 m³
    // mortar = 0.59077 m³, +10% = 0.64985 m³
    // cement = 0.64985 × 250 = 162.46 kg -> 4 bags, sand = 0.64985 m³
    const r = calcBlocks({ ...wall, block: redBrick, wallType: 'half' })!;
    expect(r.netAreaM2).toBeCloseTo(28, 9);
    expect(r.blocksPerM2).toBeCloseTo(54.945, 3);
    expect(r.blocks).toBe(1616);
    expect(r.wallThicknessM).toBeCloseTo(0.12, 9);
    expect(r.mortarM3).toBeCloseTo(0.59077, 4);
    expect(r.orderMortarM3).toBeCloseTo(0.64985, 4);
    expect(r.cementKg).toBeCloseTo(162.46, 1);
    expect(r.cementBags).toBe(4);
    expect(r.sandM3).toBeCloseTo(0.64985, 4);
  });

  it('one brick wall doubles the bricks and is 25 cm thick', () => {
    // n = 2 / 0.0182 = 109.89, order = ⌈3076.92 × 1.05⌉ = 3231
    // t = 2 × 0.12 + 0.01 = 0.25, mortar = 7.0 − 5.53846 = 1.46154, +10% = 1.60769
    // cement = 401.92 kg -> 9 bags
    const r = calcBlocks({ ...wall, block: redBrick, wallType: 'one' })!;
    expect(r.blocks).toBe(3231);
    expect(r.wallThicknessM).toBeCloseTo(0.25, 9);
    expect(r.mortarM3).toBeCloseTo(1.46154, 4);
    expect(r.cementKg).toBeCloseTo(401.92, 1);
    expect(r.cementBags).toBe(9);
  });

  it('hollow block 40×20×20, hand checked', () => {
    // n = 1 / (0.41 × 0.21) = 11.6144, order = ⌈325.20 × 1.05⌉ = ⌈341.46⌉ = 342
    // t = 0.20, mortar = 5.6 − 325.20 × 0.016 = 0.39675, +10% = 0.43643
    // cement = 109.11 kg -> 3 bags
    const r = calcBlocks({ ...wall, block: hollowBlock, wallType: 'half' })!;
    expect(r.blocksPerM2).toBeCloseTo(11.6144, 3);
    expect(r.blocks).toBe(342);
    expect(r.mortarM3).toBeCloseTo(0.39675, 4);
    expect(r.cementKg).toBeCloseTo(109.11, 1);
    expect(r.cementBags).toBe(3);
  });

  it('reads joint and mortar mix from the settings file', () => {
    const custom = {
      ...MATERIALS,
      masonry: { ...MATERIALS.masonry, jointCm: 0, mortar: { cementKgPerM3: 300, sandM3PerM3: 1 }, mortarWastePercent: 0 },
    } as unknown as typeof MATERIALS;
    // With no joint, 1 m² of 25×6 face needs exactly 1 / 0.015 = 66.67 bricks and no mortar.
    const r = calcBlocks(
      { wallLengthM: 1, wallHeightM: 1, openingsM2: 0, wastePercent: 0, block: redBrick, wallType: 'half' },
      custom,
    )!;
    expect(r.blocksPerM2).toBeCloseTo(66.667, 3);
    expect(r.blocks).toBe(67);
    expect(r.mortarM3).toBeCloseTo(0, 9);
  });

  it('shows the formula with the real numbers', () => {
    const r = calcBlocks({ ...wall, block: redBrick, wallType: 'half' })!;
    expect(r.steps[0].expr).toBe('A = L × H − O = 10 × 3 − 2 = 28 m²');
    expect(r.steps[1].expr).toBe('n = k ÷ ((l + j) × (h + j)) = 1 ÷ (0.26 × 0.07) = 54.95 /m²');
    expect(r.steps[2].expr).toBe('N = ⌈A × n × (1 + 5%)⌉ = ⌈28 × 54.95 × 1.05⌉ = 1616');
    expect(r.steps[3].expr).toBe('t = k × w + (k − 1) × j = 1 × 0.12 + 0 × 0.01 = 0.12 m');
  });

  it.each([
    { wallLengthM: 0 },
    { wallHeightM: -2 },
    { openingsM2: 30 }, // larger than the wall
    { openingsM2: -1 },
    { wastePercent: 100 },
    { block: { lengthCm: 0, widthCm: 12, heightCm: 6 } },
  ])('rejects invalid input %o', (bad) => {
    expect(calcBlocks({ ...wall, block: redBrick, wallType: 'half', ...bad })).toBeNull();
  });
});
