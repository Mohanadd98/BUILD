import { useState } from 'react';

import { fmt, ltr, parseNumber } from '@/calc/format';
import { calcPlaster, type PlasterSide } from '@/calc/plaster';
import { AppText, BigButton, Card, Choice, FormulaBox, NumberField, ResultRow, Screen } from '@/components/ui';
import { MATERIALS } from '@/config/materials';
import { usePrefs } from '@/state/preferences';

const defaults = MATERIALS.plaster;
const initialWaste = String(defaults.defaultWastePercent);

export default function PlasterScreen() {
  const { t } = usePrefs();
  const [side, setSide] = useState<PlasterSide>('internal');
  const [area, setArea] = useState('');
  const [thickness, setThickness] = useState(String(defaults.thicknessCm.internal));
  const [waste, setWaste] = useState(initialWaste);
  const [spatter, setSpatter] = useState<'yes' | 'no'>('yes');

  const changeSide = (s: PlasterSide) => {
    setSide(s);
    setThickness(String(defaults.thicknessCm[s]));
  };

  const result = calcPlaster({
    areaM2: parseNumber(area) ?? 0,
    thicknessCm: parseNumber(thickness) ?? 0,
    wastePercent: parseNumber(waste) ?? -1,
    includeSpatter: spatter === 'yes',
  });

  const clear = () => {
    setArea('');
    setThickness(String(defaults.thicknessCm[side]));
    setWaste(initialWaste);
  };

  return (
    <Screen>
      <Choice<PlasterSide>
        label={t('plaster.side')}
        value={side}
        onChange={changeSide}
        options={[
          { value: 'internal', label: t('plaster.internal') },
          { value: 'external', label: t('plaster.external') },
        ]}
      />
      <Choice<'yes' | 'no'>
        label={`${t('plaster.spatter')} (${ltr(`${fmt(defaults.spatter.thicknessCm * 10)} mm`)})`}
        value={spatter}
        onChange={setSpatter}
        options={[
          { value: 'yes', label: t('common.yes') },
          { value: 'no', label: t('common.no') },
        ]}
      />
      <NumberField label={t('plaster.area')} unit="m²" value={area} onChangeText={setArea} />
      <NumberField label={t('plaster.thickness')} unit="cm" value={thickness} onChangeText={setThickness} />
      <NumberField label={t('common.waste')} unit="%" value={waste} onChangeText={setWaste} />

      {result ? (
        <>
          <Card>
            <AppText variant="label" style={{ fontWeight: '700' }}>{t('common.result')}</AppText>
            <ResultRow label={t('plaster.plasterMortar')} value={fmt(result.plasterM3, 3)} unit="m³" />
            {result.spatterM3 > 0 ? (
              <ResultRow label={t('plaster.spatterMortar')} value={fmt(result.spatterM3, 3)} unit="m³" />
            ) : null}
            <ResultRow
              label={`${t('plaster.totalCement')} (${ltr(`${fmt(result.cementKg, 0)} kg`)})`}
              value={String(result.cementBags)}
              unit={t('concrete.bags')}
            />
            <ResultRow label={t('plaster.totalSand')} value={fmt(result.sandM3, 3)} unit="m³" />
          </Card>
          <FormulaBox steps={result.steps} />
          <AppText variant="muted">{t('plaster.legend')}</AppText>
          <AppText variant="muted">{t('common.sourceNote')}</AppText>
        </>
      ) : (
        <AppText variant="muted">{t('common.enterValues')}</AppText>
      )}

      <BigButton label={t('common.reset')} variant="secondary" onPress={clear} />
    </Screen>
  );
}
