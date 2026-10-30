import { MATERIALS, type MaterialSettings } from '@/config/materials';

import { fmt, type Step } from './format';

export type BlockPreset = keyof MaterialSettings['masonry']['blocks'];

/** Half brick = one leaf (wall as thick as the block width). One brick = two leaves. */
export type WallType = 'half' | 'one';

export interface BlockSize {
  lengthCm: number;
  widthCm: number;
  heightCm: number;
}

export interface BlocksInput {
  wallLengthM: number;
  wallHeightM: number;
  /** Doors and windows to subtract, m². */
  openingsM2: number;
  block: BlockSize;
  wallType: WallType;
  wastePercent: number;
}

export interface BlocksResult {
  netAreaM2: number;
  blocksPerM2: number;
  /** Blocks needed before waste, not rounded. */
  netBlocks: number;
  /** Blocks to order, with waste, rounded up. */
  blocks: number;
  wallThicknessM: number;
  mortarM3: number;
  /** Mortar with waste allowance; cement and sand are based on this. */
  orderMortarM3: number;
  cementKg: number;
  cementBags: number;
  sandM3: number;
  steps: Step[];
}

/** Returns null when a dimension is missing or the openings exceed the wall. */
export function calcBlocks(input: BlocksInput, settings: MaterialSettings = MATERIALS): BlocksResult | null {
  const { wallLengthM, wallHeightM, openingsM2, block, wallType, wastePercent } = input;
  if (!(wallLengthM > 0 && wallHeightM > 0)) return null;
  if (!(block.lengthCm > 0 && block.widthCm > 0 && block.heightCm > 0)) return null;
  if (!(openingsM2 >= 0 && wastePercent >= 0 && wastePercent < 100)) return null;

  const s = settings.masonry;
  const j = s.jointCm / 100;
  const l = block.lengthCm / 100;
  const w = block.widthCm / 100;
  const h = block.heightCm / 100;
  const leaves = wallType === 'one' ? 2 : 1;

  const grossAreaM2 = wallLengthM * wallHeightM;
  const netAreaM2 = grossAreaM2 - openingsM2;
  if (!(netAreaM2 > 0)) return null;

  const blocksPerM2 = leaves / ((l + j) * (h + j));
  const netBlocks = netAreaM2 * blocksPerM2;
  const blockWaste = 1 + wastePercent / 100;
  const blocks = Math.ceil(netBlocks * blockWaste - 1e-9);

  const wallThicknessM = leaves * w + (leaves - 1) * j;
  const wallVolumeM3 = netAreaM2 * wallThicknessM;
  const blockVolumeM3 = l * w * h;
  const mortarM3 = wallVolumeM3 - netBlocks * blockVolumeM3;
  const mortarWaste = 1 + s.mortarWastePercent / 100;
  const orderMortarM3 = mortarM3 * mortarWaste;

  const cementKg = orderMortarM3 * s.mortar.cementKgPerM3;
  const cementBags = Math.ceil(cementKg / settings.cementBagKg - 1e-9);
  const sandM3 = orderMortarM3 * s.mortar.sandM3PerM3;

  const steps: Step[] = [
    {
      labelKey: 'blocks.step.area',
      expr: `A = L × H − O = ${fmt(wallLengthM, 3)} × ${fmt(wallHeightM, 3)} − ${fmt(openingsM2, 3)} = ${fmt(netAreaM2, 3)} m²`,
    },
    {
      labelKey: 'blocks.step.perM2',
      expr: `n = k ÷ ((l + j) × (h + j)) = ${leaves} ÷ (${fmt(l + j, 3)} × ${fmt(h + j, 3)}) = ${fmt(blocksPerM2, 2)} /m²`,
    },
    {
      labelKey: 'blocks.step.count',
      expr: `N = ⌈A × n × (1 + ${fmt(wastePercent)}%)⌉ = ⌈${fmt(netAreaM2, 3)} × ${fmt(blocksPerM2, 2)} × ${fmt(blockWaste, 4)}⌉ = ${blocks}`,
    },
    {
      labelKey: 'blocks.step.thickness',
      expr: `t = k × w + (k − 1) × j = ${leaves} × ${fmt(w, 3)} + ${leaves - 1} × ${fmt(j, 3)} = ${fmt(wallThicknessM, 3)} m`,
    },
    {
      labelKey: 'blocks.step.mortar',
      expr: `M = A × t − (A × n) × l × w × h = ${fmt(wallVolumeM3, 4)} − ${fmt(netBlocks, 2)} × ${fmt(blockVolumeM3, 6)} = ${fmt(mortarM3, 4)} m³`,
    },
    {
      labelKey: 'blocks.step.mortarOrder',
      expr: `M' = M × (1 + ${fmt(s.mortarWastePercent)}%) = ${fmt(orderMortarM3, 4)} m³`,
    },
    {
      labelKey: 'blocks.step.cement',
      expr: `C = M' × ${s.mortar.cementKgPerM3} kg/m³ = ${fmt(cementKg, 1)} kg → ⌈C ÷ ${settings.cementBagKg}⌉ = ${cementBags}`,
    },
    {
      labelKey: 'blocks.step.sand',
      expr: `S = M' × ${s.mortar.sandM3PerM3} = ${fmt(sandM3, 3)} m³`,
    },
  ];

  return {
    netAreaM2,
    blocksPerM2,
    netBlocks,
    blocks,
    wallThicknessM,
    mortarM3,
    orderMortarM3,
    cementKg,
    cementBags,
    sandM3,
    steps,
  };
}
