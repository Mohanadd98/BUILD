import {
  boqCsv,
  boqHtml,
  buildBoq,
  csvField,
  defaultPhase,
  escapeHtml,
  type BoqLabels,
  type MaterialLine,
} from '@/calc/boq';

const labels: BoqLabels = {
  appName: 'BUILD',
  title: 'Bill of quantities',
  project: 'Project',
  date: 'Date',
  phase: 'Phase',
  item: 'Item',
  qty: 'Quantity',
  unit: 'Unit',
  unitPrice: 'Unit price',
  amount: 'Amount',
  subtotal: 'Subtotal',
  total: 'Total',
  currency: 'EGP',
  note: 'Estimate',
  phaseName: (p) => p,
  itemName: (m) => m,
  unitName: (u) => u,
};

const slab = { tool: 'concrete', materials: [{ item: 'cement', qty: 23 }, { item: 'sand', qty: 1.26 }, { item: 'gravel', qty: 2.52 }] as MaterialLine[] };
const wall = { tool: 'blocks', materials: [{ item: 'brickRed', qty: 1616 }, { item: 'cement', qty: 4 }, { item: 'sand', qty: 0.65 }] as MaterialLine[] };

describe('buildBoq', () => {
  it('groups by phase, sums the same material and keeps phase order', () => {
    const boq = buildBoq([wall, slab, { ...slab, materials: [{ item: 'cement', qty: 7 }] }], {});
    expect(boq.phases.map((p) => p.phase)).toEqual(['structure', 'masonry']);
    expect(boq.phases[0].rows.map((r) => [r.item, r.qty])).toEqual([
      ['cement', 30],
      ['sand', 1.26],
      ['gravel', 2.52],
    ]);
    expect(boq.phases[1].rows.map((r) => r.item)).toEqual(['cement', 'sand', 'brickRed']);
  });

  it('uses the phase chosen by the user over the default', () => {
    const boq = buildBoq([{ ...slab, phase: 'foundations' }], {});
    expect(boq.phases[0].phase).toBe('foundations');
  });

  it('prices rows, totals per phase and counts unpriced rows', () => {
    // cement 23 × 250 = 5750, sand 1.26 × 400 = 504, gravel unpriced
    const boq = buildBoq([slab], { cement: 250, sand: 400, gravel: 0 });
    const rows = boq.phases[0].rows;
    expect(rows[0].amount).toBeCloseTo(5750, 6);
    expect(rows[1].amount).toBeCloseTo(504, 6);
    expect(rows[2].amount).toBeNull();
    expect(boq.phases[0].subtotal).toBeCloseTo(6254, 6);
    expect(boq.total).toBeCloseTo(6254, 6);
    expect(boq.unpricedRows).toBe(1);
  });

  it('prices the rounded quantity so amounts can be checked by hand', () => {
    // 0.64985 m³ is shown as 0.65, and 0.65 × 400 = 260.00 (not 259.94)
    const boq = buildBoq([{ tool: 'plaster', materials: [{ item: 'sand', qty: 0.64985 }] }], { sand: 400 });
    expect(boq.phases[0].rows[0].qty).toBe(0.65);
    expect(boq.phases[0].rows[0].amount).toBeCloseTo(260, 9);
  });

  it('ignores old saved calculations with no materials', () => {
    expect(buildBoq([{ tool: 'paint' }], {}).phases).toEqual([]);
  });

  it('maps each calculator to a sensible default phase', () => {
    expect(['concrete', 'blocks', 'plaster', 'tiles', 'paint', 'x'].map(defaultPhase)).toEqual([
      'structure',
      'masonry',
      'plaster',
      'flooring',
      'painting',
      'other',
    ]);
  });
});

describe('exports', () => {
  it('escapes CSV fields and blocks spreadsheet formulas', () => {
    expect(csvField('a,b')).toBe('"a,b"');
    expect(csvField('say "hi"')).toBe('"say ""hi"""');
    expect(csvField('=HYPERLINK("x")')).toBe(`"'=HYPERLINK(""x"")"`);
    expect(csvField(-5)).toBe('-5');
  });

  it('writes a priced CSV with a BOM, subtotals and total', () => {
    const csv = boqCsv(buildBoq([slab], { cement: 250 }), 'Villa, Maadi', '31/10/2026', labels);
    expect(csv.startsWith('﻿')).toBe(true);
    expect(csv).toContain('Project,"Villa, Maadi"');
    expect(csv).toContain('structure,cement,23,bag,250.00,5750.00');
    expect(csv).toContain('structure,sand,1.26,m3,,');
    expect(csv).toContain('Total,,,,,5750.00');
  });

  it('escapes the project name in the PDF so it cannot inject markup', () => {
    expect(escapeHtml('<img src=x onerror=alert(1)>')).toBe('&lt;img src=x onerror=alert(1)&gt;');
    const html = boqHtml(buildBoq([slab], { cement: 250 }), '<script>x</script>', 'd', labels, { mode: 'boq', rtl: false });
    expect(html).not.toContain('<script>x');
    expect(html).toContain('5,750.00');
  });

  it('leaves prices empty in a quote request', () => {
    const html = boqHtml(buildBoq([slab], { cement: 250 }), 'Villa', 'd', labels, { mode: 'quote', rtl: true });
    expect(html).toContain('dir="rtl"');
    expect(html).not.toContain('5,750.00');
    expect(html).not.toContain('250.00');
    expect(html).toContain('<td class="n">23</td>');
  });
});
