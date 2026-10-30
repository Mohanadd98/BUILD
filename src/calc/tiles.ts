import { MATERIALS, type MaterialSettings } from '@/config/materials';

import { fmt, type Step } from './format';

export type TilePreset = keyof MaterialSettings['tiles']['presets'];

export interface TilesInput {
  areaM2: number;
  tileLengthCm: number;
  tileWidthCm: number;
  /** Tile thickness, used as the grout joint depth. */
  tileThicknessMm: number;
  jointMm: number;
  tilesPerBox: number;
  wastePercent: number;
}

export interface TilesResult {
  /** Tiles needed before waste, not rounded. */
  netTiles: number;
  /** Tiles with waste, rounded up. */
  tiles: number;
  boxes: number;
  adhesiveKgPerM2: number;
  adhesiveKg: number;
  adhesiveBags: number;
  groutKgPerM2: number;
  groutKg: number;
  groutBags: number;
  steps: Step[];
}

/** Adhesive rate for the first band whose limit covers the tile's longest side. */
export function adhesiveRate(lengthCm: number, widthCm: number, settings: MaterialSettings = MATERIALS): number {
  const longest = Math.max(lengthCm, widthCm);
  const rates = settings.tiles.adhesive.rates;
  return (rates.find((r) => longest <= r.maxSideCm) ?? rates[rates.length - 1]).kgPerM2;
}

/** Returns null when a value is missing or tiles per box is not a whole number. */
export function calcTiles(input: TilesInput, settings: MaterialSettings = MATERIALS): TilesResult | null {
  const { areaM2, tileLengthCm, tileWidthCm, tileThicknessMm, jointMm, tilesPerBox, wastePercent } = input;
  if (!(areaM2 > 0 && tileLengthCm > 0 && tileWidthCm > 0)) return null;
  if (!(tileThicknessMm > 0 && jointMm >= 0)) return null;
  if (!(Number.isInteger(tilesPerBox) && tilesPerBox >= 1)) return null;
  if (!(wastePercent >= 0 && wastePercent < 100)) return null;

  const s = settings.tiles;
  const l = tileLengthCm / 100;
  const w = tileWidthCm / 100;
  const tileWaste = 1 + wastePercent / 100;
  const matWaste = 1 + s.materialWastePercent / 100;

  const netTiles = areaM2 / (l * w);
  const tiles = Math.ceil(netTiles * tileWaste - 1e-9);
  const boxes = Math.ceil(tiles / tilesPerBox);

  const adhesiveKgPerM2 = adhesiveRate(tileLengthCm, tileWidthCm, settings);
  const adhesiveKg = areaM2 * adhesiveKgPerM2 * matWaste;
  const adhesiveBags = Math.ceil(adhesiveKg / s.adhesive.bagKg - 1e-9);

  const Lmm = tileLengthCm * 10;
  const Wmm = tileWidthCm * 10;
  const rho = s.grout.densityKgPerDm3;
  const groutKgPerM2 = ((Lmm + Wmm) / (Lmm * Wmm)) * jointMm * tileThicknessMm * rho;
  const groutKg = areaM2 * groutKgPerM2 * matWaste;
  const groutBags = Math.ceil(groutKg / s.grout.bagKg - 1e-9);

  const steps: Step[] = [
    {
      labelKey: 'tiles.step.count',
      expr: `N = ⌈A ÷ (l × w) × (1 + ${fmt(wastePercent)}%)⌉ = ⌈${fmt(areaM2, 3)} ÷ (${fmt(l, 3)} × ${fmt(w, 3)}) × ${fmt(tileWaste, 4)}⌉ = ${tiles}`,
    },
    {
      labelKey: 'tiles.step.boxes',
      expr: `B = ⌈N ÷ ${tilesPerBox}⌉ = ⌈${fmt(tiles / tilesPerBox, 2)}⌉ = ${boxes}`,
    },
    {
      labelKey: 'tiles.step.adhesive',
      expr: `Ad = A × ${adhesiveKgPerM2} kg/m² × ${fmt(matWaste, 4)} = ${fmt(adhesiveKg, 1)} kg → ⌈÷ ${s.adhesive.bagKg}⌉ = ${adhesiveBags}`,
    },
    {
      labelKey: 'tiles.step.groutRate',
      expr: `g = (L + W) ÷ (L × W) × J × D × ρ = (${fmt(Lmm)} + ${fmt(Wmm)}) ÷ (${fmt(Lmm)} × ${fmt(Wmm)}) × ${fmt(jointMm)} × ${fmt(tileThicknessMm)} × ${rho} = ${fmt(groutKgPerM2, 3)} kg/m²`,
    },
    {
      labelKey: 'tiles.step.grout',
      expr: `G = A × g × ${fmt(matWaste, 4)} = ${fmt(groutKg, 2)} kg → ⌈÷ ${s.grout.bagKg}⌉ = ${groutBags}`,
    },
  ];

  return {
    netTiles,
    tiles,
    boxes,
    adhesiveKgPerM2,
    adhesiveKg,
    adhesiveBags,
    groutKgPerM2,
    groutKg,
    groutBags,
    steps,
  };
}
