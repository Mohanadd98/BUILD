import { adhesiveRate, calcTiles } from '@/calc/tiles';
import { MATERIALS } from '@/config/materials';

const p60 = MATERIALS.tiles.presets.t60x60;
const room = {
  areaM2: 20,
  tileLengthCm: p60.lengthCm,
  tileWidthCm: p60.widthCm,
  tileThicknessMm: p60.thicknessMm,
  jointMm: 3,
  tilesPerBox: 4,
  wastePercent: 10,
};

describe('calcTiles', () => {
  it('60×60 tiles on 20 m², hand checked', () => {
    // N = ⌈20 ÷ 0.36 × 1.1⌉ = ⌈61.11⌉ = 62, boxes = ⌈62 ÷ 4⌉ = 16
    // adhesive = 20 × 5 × 1.1 = 110 kg -> ⌈5.5⌉ = 6 bags of 20 kg
    // grout rate = 1200 ÷ 360000 × 3 × 9 × 1.6 = 0.144 kg/m²
    // grout = 20 × 0.144 × 1.1 = 3.168 kg -> 1 bag of 5 kg
    const r = calcTiles(room)!;
    expect(r.netTiles).toBeCloseTo(55.556, 3);
    expect(r.tiles).toBe(62);
    expect(r.boxes).toBe(16);
    expect(r.adhesiveKgPerM2).toBe(5);
    expect(r.adhesiveKg).toBeCloseTo(110, 6);
    expect(r.adhesiveBags).toBe(6);
    expect(r.groutKgPerM2).toBeCloseTo(0.144, 9);
    expect(r.groutKg).toBeCloseTo(3.168, 9);
    expect(r.groutBags).toBe(1);
  });

  it('30×30 tiles need more grout per m² than 60×60', () => {
    // grout rate = 600 ÷ 90000 × 3 × 8 × 1.6 = 0.256 kg/m²
    const p = MATERIALS.tiles.presets.t30x30;
    const r = calcTiles({ ...room, tileLengthCm: p.lengthCm, tileWidthCm: p.widthCm, tileThicknessMm: p.thicknessMm, tilesPerBox: 11 })!;
    expect(r.tiles).toBe(245); // ⌈20 ÷ 0.09 × 1.1⌉ = ⌈244.44⌉
    expect(r.boxes).toBe(23); // ⌈245 ÷ 11⌉ = ⌈22.27⌉
    expect(r.adhesiveKgPerM2).toBe(4);
    expect(r.groutKgPerM2).toBeCloseTo(0.256, 9);
  });

  it('does not add a tile or box when the count is exact', () => {
    // 3.6 m² ÷ 0.36 = 10 tiles exactly, 10 per box -> 1 box
    const r = calcTiles({ ...room, areaM2: 3.6, wastePercent: 0, tilesPerBox: 10 })!;
    expect(r.tiles).toBe(10);
    expect(r.boxes).toBe(1);
  });

  it('chooses the adhesive rate by the longest side', () => {
    expect(adhesiveRate(30, 30)).toBe(4);
    expect(adhesiveRate(40, 40)).toBe(4);
    expect(adhesiveRate(45, 45)).toBe(5);
    expect(adhesiveRate(60, 60)).toBe(5);
    expect(adhesiveRate(60, 120)).toBe(6);
  });

  it('reads adhesive and grout values from the settings file', () => {
    const custom = {
      ...MATERIALS,
      tiles: {
        ...MATERIALS.tiles,
        materialWastePercent: 0,
        adhesive: { rates: [{ maxSideCm: 9999, kgPerM2: 3 }], bagKg: 25 },
        grout: { densityKgPerDm3: 2, bagKg: 1 },
      },
    } as unknown as typeof MATERIALS;
    const r = calcTiles(room, custom)!;
    expect(r.adhesiveKg).toBeCloseTo(60, 6);
    expect(r.adhesiveBags).toBe(3);
    expect(r.groutKgPerM2).toBeCloseTo(0.18, 9); // 1200 ÷ 360000 × 3 × 9 × 2
    expect(r.groutBags).toBe(4); // 3.6 kg -> 4 bags of 1 kg
  });

  it('shows the formula with the real numbers', () => {
    const r = calcTiles(room)!;
    expect(r.steps.map((s) => s.expr)).toEqual([
      'N = ⌈A ÷ (l × w) × (1 + 10%)⌉ = ⌈20 ÷ (0.6 × 0.6) × 1.1⌉ = 62',
      'B = ⌈N ÷ 4⌉ = ⌈15.5⌉ = 16',
      'Ad = A × 5 kg/m² × 1.1 = 110 kg → ⌈÷ 20⌉ = 6',
      'g = (L + W) ÷ (L × W) × J × D × ρ = (600 + 600) ÷ (600 × 600) × 3 × 9 × 1.6 = 0.144 kg/m²',
      'G = A × g × 1.1 = 3.17 kg → ⌈÷ 5⌉ = 1',
    ]);
  });

  it.each([
    { areaM2: 0 },
    { tileLengthCm: -30 },
    { tileThicknessMm: 0 },
    { jointMm: -1 },
    { tilesPerBox: 0 },
    { tilesPerBox: 4.5 },
    { wastePercent: 100 },
  ])('rejects invalid input %o', (bad) => {
    expect(calcTiles({ ...room, ...bad })).toBeNull();
  });
});
