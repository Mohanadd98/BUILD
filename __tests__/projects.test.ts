import {
  addCalc,
  lineParts,
  parseProjects,
  lineText,
  removeCalc,
  removeProject,
  shareText,
  type Project,
  type SavedCalc,
} from '@/storage/projects';

jest.mock('@react-native-async-storage/async-storage', () => ({ getItem: jest.fn(), setItem: jest.fn() }));

const dict: Record<string, string> = {
  'concrete.title': 'Concrete',
  'concrete.mix': 'Concrete type',
  'concrete.mix.reinforced': 'Reinforced',
  'concrete.length': 'Length',
  'concrete.cement': 'Cement',
  'concrete.bags': 'bags',
  'concrete.step.volume': 'Net volume',
  'common.result': 'Result',
  'common.formula': 'How this was calculated',
};
const t = (k: string) => dict[k] ?? k;

const calc = (id: string): SavedCalc => ({
  id,
  tool: 'concrete',
  createdAt: 0,
  inputs: [
    { labelKey: 'concrete.mix', valueKey: 'concrete.mix.reinforced' },
    { labelKey: 'concrete.length', value: '5', unit: 'm' },
  ],
  results: [{ labelKey: 'concrete.cement', value: '23', unitKey: 'concrete.bags' }],
  steps: [{ labelKey: 'concrete.step.volume', expr: 'V = 5 × 4 × 0.15 = 3 m³' }],
});

describe('project storage', () => {
  it('creates a new project with the first calculation', () => {
    const list = addCalc([], { newName: '  Villa Maadi ' }, calc('a'), 1000);
    expect(list).toHaveLength(1);
    expect(list[0].name).toBe('Villa Maadi');
    expect(list[0].createdAt).toBe(1000);
    expect(list[0].calcs.map((c) => c.id)).toEqual(['a']);
  });

  it('ignores an empty project name', () => {
    expect(addCalc([], { newName: '   ' }, calc('a'))).toEqual([]);
  });

  it('adds to an existing project, newest first, without changing the original list', () => {
    const before: Project[] = [{ id: 'p1', name: 'Villa', createdAt: 0, calcs: [calc('a')] }];
    const after = addCalc(before, { projectId: 'p1' }, calc('b'));
    expect(after[0].calcs.map((c) => c.id)).toEqual(['b', 'a']);
    expect(before[0].calcs.map((c) => c.id)).toEqual(['a']);
  });

  it('removes one calculation or a whole project', () => {
    const list: Project[] = [
      { id: 'p1', name: 'A', createdAt: 0, calcs: [calc('a'), calc('b')] },
      { id: 'p2', name: 'B', createdAt: 0, calcs: [] },
    ];
    expect(removeCalc(list, 'p1', 'a')[0].calcs.map((c) => c.id)).toEqual(['b']);
    expect(removeProject(list, 'p1').map((p) => p.id)).toEqual(['p2']);
  });

  it('writes lines with translated words and units', () => {
    expect(lineText({ labelKey: 'concrete.mix', valueKey: 'concrete.mix.reinforced' }, t)).toBe('Concrete type: Reinforced');
    expect(lineText({ labelKey: 'concrete.cement', value: '23', unitKey: 'concrete.bags' }, t)).toBe('Cement: 23 bags');
    expect(lineText({ labelKey: 'concrete.length', value: '5', unit: 'm' }, t)).toBe('Length: 5 m');
  });

  it('splits a line into label and value with unit', () => {
    expect(lineParts({ labelKey: 'concrete.cement', value: '23', unitKey: 'concrete.bags' }, t)).toEqual({
      label: 'Cement',
      value: '23 bags',
    });
  });

  it('builds share text that includes the formulas', () => {
    expect(shareText('Villa Maadi', calc('a'), t, '30/10/2026')).toBe(
      [
        'BUILD · Villa Maadi',
        'Concrete · 30/10/2026',
        '',
        'Concrete type: Reinforced',
        'Length: 5 m',
        '',
        'Result:',
        'Cement: 23 bags',
        '',
        'How this was calculated:',
        'Net volume: V = 5 × 4 × 0.15 = 3 m³',
      ].join('\n'),
    );
  });
});

describe('reading stored projects', () => {
  const good = {
    id: 'p1',
    name: 'Villa',
    createdAt: 1,
    calcs: [{ ...calc('a') }],
  };

  it('reads well-formed data', () => {
    expect(parseProjects(JSON.stringify([good]))).toEqual([good]);
    expect(parseProjects(null)).toEqual([]);
  });

  it('drops malformed projects and calculations instead of crashing', () => {
    const bad = [good, { id: 5 }, null, { ...good, id: 'p2', calcs: [{ id: 'x', tool: 'rocket' }, calc('b')] }];
    const out = parseProjects(JSON.stringify(bad));
    expect(out.map((p) => p.id)).toEqual(['p1', 'p2']);
    expect(out[1].calcs.map((c) => c.id)).toEqual(['b']);
  });

  it('refuses unreadable data so the caller does not overwrite it', () => {
    expect(() => parseProjects('{not json')).toThrow();
    expect(() => parseProjects('{"a":1}')).toThrow();
  });
});

describe('reading saved phases and materials', () => {
  it('keeps valid phases and materials and drops invalid ones', () => {
    const stored = [
      {
        id: 'p1',
        name: 'Villa',
        createdAt: 1,
        calcs: [
          {
            ...calc('a'),
            phase: 'foundations',
            materials: [{ item: 'cement', qty: 23 }, { item: 'gold', qty: 1 }, { item: 'sand', qty: -2 }, null],
          },
          { ...calc('b'), phase: 'roof-garden' },
        ],
      },
    ];
    const [p] = parseProjects(JSON.stringify(stored));
    expect(p.calcs[0].phase).toBe('foundations');
    expect(p.calcs[0].materials).toEqual([{ item: 'cement', qty: 23 }]);
    expect(p.calcs[1].phase).toBeUndefined();
    expect(p.calcs[1].materials).toBeUndefined();
  });
});
