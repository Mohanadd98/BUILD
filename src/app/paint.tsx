import { useState } from 'react';

import { fmt, ltr, parseNumber } from '@/calc/format';
import { calcPaint } from '@/calc/paint';
import { SaveButton } from '@/components/save-button';
import { AppText, BigButton, Card, Choice, FormulaBox, NumberField, ResultRow, Screen } from '@/components/ui';
import { MATERIALS } from '@/config/materials';
import { usePrefs } from '@/state/preferences';

const s = MATERIALS.paint;
const initial = {
  coats: String(s.defaultCoats),
  coverage: String(s.coverageM2PerL),
  can: String(s.defaultCanLitres),
  waste: String(s.defaultWastePercent),
};

export default function PaintScreen() {
  const { t } = usePrefs();
  const [area, setArea] = useState('');
  const [coats, setCoats] = useState(initial.coats);
  const [coverage, setCoverage] = useState(initial.coverage);
  const [can, setCan] = useState(initial.can);
  const [waste, setWaste] = useState(initial.waste);
  const [prep, setPrep] = useState<'yes' | 'no'>('yes');

  const result = calcPaint({
    areaM2: parseNumber(area) ?? 0,
    coats: parseNumber(coats) ?? 0,
    coverageM2PerL: parseNumber(coverage) ?? 0,
    canLitres: can.trim() === '' ? null : (parseNumber(can) ?? 0),
    wastePercent: parseNumber(waste) ?? -1,
    includePrep: prep === 'yes',
  });

  const clear = () => {
    setArea('');
    setCoats(initial.coats);
    setCoverage(initial.coverage);
    setCan(initial.can);
    setWaste(initial.waste);
  };

  return (
    <Screen>
      <Choice<'yes' | 'no'>
        label={t('paint.prep')}
        value={prep}
        onChange={setPrep}
        options={[
          { value: 'yes', label: t('common.yes') },
          { value: 'no', label: t('common.no') },
        ]}
      />
      <NumberField label={t('paint.area')} unit="m²" value={area} onChangeText={setArea} />
      <NumberField label={t('paint.coats')} unit="×" value={coats} onChangeText={setCoats} />
      <NumberField label={t('paint.coverage')} unit="m²/L" value={coverage} onChangeText={setCoverage} />
      <NumberField label={t('paint.can')} unit="L" value={can} onChangeText={setCan} />
      <NumberField label={t('common.waste')} unit="%" value={waste} onChangeText={setWaste} />

      {result ? (
        <>
          <Card>
            <AppText variant="label" style={{ fontWeight: '700' }}>{t('common.result')}</AppText>
            <ResultRow label={t('paint.paint')} value={fmt(result.paintL, 1)} unit="L" />
            {result.cans !== null ? (
              <ResultRow
                label={`${t('paint.cans')} (${ltr(`${fmt(parseNumber(can) ?? 0, 2)} L`)})`}
                value={String(result.cans)}
                unit={t('paint.canUnit')}
              />
            ) : null}
            {prep === 'yes' ? (
              <>
                <ResultRow label={t('paint.sealer')} value={fmt(result.sealerL, 1)} unit="L" />
                <ResultRow label={t('paint.putty')} value={fmt(result.puttyKg, 0)} unit="kg" />
              </>
            ) : null}
          </Card>
          <SaveButton
            build={() => ({
              tool: 'paint',
              inputs: [
                { labelKey: 'paint.prep', valueKey: `common.${prep}` },
                { labelKey: 'paint.area', value: area.trim(), unit: 'm²' },
                { labelKey: 'paint.coats', value: coats.trim() },
                { labelKey: 'paint.coverage', value: coverage.trim(), unit: 'm²/L' },
                { labelKey: 'common.waste', value: waste.trim(), unit: '%' },
              ],
              results: [
                { labelKey: 'paint.paint', value: fmt(result.paintL, 1), unit: 'L' },
                ...(result.cans !== null
                  ? [{ labelKey: 'paint.cans', value: String(result.cans), unit: `× ${can.trim()} L` }]
                  : []),
                ...(prep === 'yes'
                  ? [
                      { labelKey: 'paint.sealer', value: fmt(result.sealerL, 1), unit: 'L' },
                      { labelKey: 'paint.putty', value: fmt(result.puttyKg, 0), unit: 'kg' },
                    ]
                  : []),
              ],
              steps: result.steps,
            })}
          />
          <FormulaBox steps={result.steps} />
          <AppText variant="muted">{t('paint.legend')}</AppText>
          <AppText variant="muted">{t('paint.productNote')}</AppText>
        </>
      ) : (
        <AppText variant="muted">{t('paint.enterValues')}</AppText>
      )}

      <BigButton label={t('common.reset')} variant="secondary" onPress={clear} />
    </Screen>
  );
}
