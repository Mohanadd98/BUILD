/**
 * Bill of quantities (BOQ): adds up the materials of a project's saved
 * calculations by construction phase, prices them, and lays them out as CSV
 * or as HTML for a PDF (a priced BOQ, or a quote request for contractors).
 */
import { fmt } from './format';

export const PHASES = ['foundations', 'structure', 'masonry', 'plaster', 'flooring', 'painting', 'other'] as const;
export type Phase = (typeof PHASES)[number];

/** Every material a calculator can produce, in BOQ order, with its unit. */
export const MATERIALS_LIST = [
  { key: 'cement', unit: 'bag' },
  { key: 'sand', unit: 'm3' },
  { key: 'gravel', unit: 'm3' },
  { key: 'brickRed', unit: 'pcs' },
  { key: 'brickCement', unit: 'pcs' },
  { key: 'blockHollow', unit: 'pcs' },
  { key: 'blockCustom', unit: 'pcs' },
  { key: 'tileBox', unit: 'box' },
  { key: 'tileAdhesive', unit: 'bag' },
  { key: 'grout', unit: 'bag' },
  { key: 'paint', unit: 'L' },
  { key: 'sealer', unit: 'L' },
  { key: 'putty', unit: 'kg' },
] as const;
export type MaterialKey = (typeof MATERIALS_LIST)[number]['key'];
export type MaterialUnit = (typeof MATERIALS_LIST)[number]['unit'];

export interface MaterialLine {
  item: MaterialKey;
  qty: number;
}

/** Unit price per material, in local currency; missing or 0 means not priced. */
export type Prices = Partial<Record<MaterialKey, number>>;

const PHASE_ORDER = new Map<string, number>(PHASES.map((p, i) => [p, i]));
const MATERIAL_ORDER = new Map<string, number>(MATERIALS_LIST.map((m, i) => [m.key, i]));
const UNIT_OF = new Map<string, MaterialUnit>(MATERIALS_LIST.map((m) => [m.key, m.unit]));

export function isPhase(v: unknown): v is Phase {
  return typeof v === 'string' && PHASE_ORDER.has(v);
}

export function isMaterialKey(v: unknown): v is MaterialKey {
  return typeof v === 'string' && MATERIAL_ORDER.has(v);
}

export function unitOf(item: MaterialKey): MaterialUnit {
  return UNIT_OF.get(item)!;
}

/** The phase a calculator's result belongs to unless the user picks another. */
export function defaultPhase(tool: string): Phase {
  switch (tool) {
    case 'concrete':
      return 'structure';
    case 'blocks':
      return 'masonry';
    case 'plaster':
      return 'plaster';
    case 'tiles':
      return 'flooring';
    case 'paint':
      return 'painting';
    default:
      return 'other';
  }
}

export interface BoqRow {
  phase: Phase;
  item: MaterialKey;
  unit: MaterialUnit;
  qty: number;
  /** Null when the material has no price. */
  unitPrice: number | null;
  amount: number | null;
}

export interface BoqPhase {
  phase: Phase;
  rows: BoqRow[];
  /** Sum of the priced rows. */
  subtotal: number;
}

export interface Boq {
  phases: BoqPhase[];
  total: number;
  /** Rows that have no price, so the total is incomplete. */
  unpricedRows: number;
}

/**
 * Adds up materials per phase (same material in the same phase is summed) and
 * prices them. Quantities are rounded to 2 decimals first, so every amount is
 * exactly the shown quantity × unit price and can be checked by hand.
 */
export function buildBoq(calcs: { phase?: Phase; tool: string; materials?: MaterialLine[] }[], prices: Prices): Boq {
  const sums = new Map<string, { phase: Phase; item: MaterialKey; qty: number }>();
  for (const c of calcs) {
    const phase = c.phase ?? defaultPhase(c.tool);
    for (const m of c.materials ?? []) {
      if (!(m.qty > 0)) continue;
      const key = `${phase}|${m.item}`;
      const row = sums.get(key) ?? { phase, item: m.item, qty: 0 };
      row.qty += m.qty;
      sums.set(key, row);
    }
  }
  const rows: BoqRow[] = [...sums.values()]
    .sort((a, b) => PHASE_ORDER.get(a.phase)! - PHASE_ORDER.get(b.phase)! || MATERIAL_ORDER.get(a.item)! - MATERIAL_ORDER.get(b.item)!)
    .map((r) => ({ ...r, qty: Math.round(r.qty * 100) / 100 }))
    .map((r) => {
      const price = prices[r.item];
      const unitPrice = price !== undefined && price > 0 ? price : null;
      return { ...r, unit: unitOf(r.item), unitPrice, amount: unitPrice === null ? null : r.qty * unitPrice };
    });

  const phases: BoqPhase[] = [];
  for (const row of rows) {
    let group = phases[phases.length - 1];
    if (!group || group.phase !== row.phase) {
      group = { phase: row.phase, rows: [], subtotal: 0 };
      phases.push(group);
    }
    group.rows.push(row);
    group.subtotal += row.amount ?? 0;
  }
  return {
    phases,
    total: phases.reduce((s, p) => s + p.subtotal, 0),
    unpricedRows: rows.filter((r) => r.unitPrice === null).length,
  };
}

/** Labels the exports need, in the language of the export. */
export interface BoqLabels {
  appName: string;
  title: string;
  project: string;
  date: string;
  phase: string;
  item: string;
  qty: string;
  unit: string;
  unitPrice: string;
  amount: string;
  subtotal: string;
  total: string;
  currency: string;
  note: string;
  phaseName: (p: Phase) => string;
  itemName: (m: MaterialKey) => string;
  unitName: (u: MaterialUnit) => string;
}

/** Quantities shown with up to 2 decimals; counted items (pcs, bags, boxes) are whole already. */
function qtyText(qty: number): string {
  return fmt(qty, 2);
}

function moneyText(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * One CSV field. Quotes fields with commas, quotes or line breaks, and stops
 * spreadsheet formula injection by prefixing text that starts with = + - @.
 */
export function csvField(value: string | number): string {
  let s = String(value);
  if (typeof value === 'string' && /^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** Priced BOQ as CSV (UTF-8 with BOM so Excel shows Arabic correctly). */
export function boqCsv(boq: Boq, projectName: string, date: string, l: BoqLabels): string {
  const lines: (string | number)[][] = [
    [l.appName, l.title],
    [l.project, projectName],
    [l.date, date],
    [],
    [l.phase, l.item, l.qty, l.unit, `${l.unitPrice} (${l.currency})`, `${l.amount} (${l.currency})`],
  ];
  for (const p of boq.phases) {
    for (const r of p.rows) {
      lines.push([
        l.phaseName(r.phase),
        l.itemName(r.item),
        qtyText(r.qty),
        l.unitName(r.unit),
        r.unitPrice === null ? '' : r.unitPrice.toFixed(2),
        r.amount === null ? '' : r.amount.toFixed(2),
      ]);
    }
    lines.push([l.phaseName(p.phase), l.subtotal, '', '', '', p.subtotal.toFixed(2)]);
  }
  lines.push([], [l.total, '', '', '', '', boq.total.toFixed(2)], [l.note]);
  return '﻿' + lines.map((row) => row.map(csvField).join(',')).join('\r\n');
}

/** Escapes text for HTML so a project name can never inject markup into the PDF. */
export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

/**
 * HTML page for the PDF. `mode: 'boq'` shows prices and totals;
 * `mode: 'quote'` leaves the price columns empty for contractors to fill in.
 */
export function boqHtml(
  boq: Boq,
  projectName: string,
  date: string,
  l: BoqLabels,
  opts: { mode: 'boq' | 'quote'; rtl: boolean },
): string {
  const e = escapeHtml;
  const quote = opts.mode === 'quote';
  const body = boq.phases
    .map((p) => {
      const rows = p.rows
        .map(
          (r) => `<tr><td>${e(l.itemName(r.item))}</td><td class="n">${qtyText(r.qty)}</td><td>${e(l.unitName(r.unit))}</td>` +
            `<td class="n">${quote || r.unitPrice === null ? '' : moneyText(r.unitPrice)}</td>` +
            `<td class="n">${quote || r.amount === null ? '' : moneyText(r.amount)}</td></tr>`,
        )
        .join('');
      const sub = quote ? '' : moneyText(p.subtotal);
      return `<tr class="ph"><td colspan="5">${e(l.phaseName(p.phase))}</td></tr>${rows}` +
        `<tr class="sub"><td colspan="4">${e(l.subtotal)}</td><td class="n">${sub}</td></tr>`;
    })
    .join('');
  const total = quote ? '' : `${moneyText(boq.total)} ${e(l.currency)}`;
  return `<!doctype html><html dir="${opts.rtl ? 'rtl' : 'ltr'}"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
body{font-family:-apple-system,Roboto,"Segoe UI",Tahoma,sans-serif;color:#141414;margin:28px;font-size:12px}
h1{font-size:20px;margin:0}h2{font-size:15px;margin:4px 0 2px;color:#B45309}
.meta{color:#55554F;margin-bottom:14px}table{width:100%;border-collapse:collapse}
th,td{border:1px solid #D2D2CB;padding:6px 8px;text-align:start}th{background:#ECECE7}
td.n{text-align:end;direction:ltr;unicode-bidi:isolate;font-variant-numeric:tabular-nums}
tr.ph td{background:#F5F5F2;font-weight:700}tr.sub td{font-weight:700}
.total{margin-top:12px;font-size:15px;font-weight:800}.note{margin-top:14px;color:#55554F}
</style></head><body>
<h1>${e(l.appName)}</h1><h2>${e(l.title)}</h2>
<div class="meta">${e(l.project)}: ${e(projectName)} · ${e(l.date)}: ${e(date)}</div>
<table><thead><tr><th>${e(l.item)}</th><th>${e(l.qty)}</th><th>${e(l.unit)}</th><th>${e(l.unitPrice)} (${e(l.currency)})</th><th>${e(l.amount)} (${e(l.currency)})</th></tr></thead>
<tbody>${body}</tbody></table>
<div class="total">${e(l.total)}: ${total}</div>
<div class="note">${e(l.note)}</div>
</body></html>`;
}
