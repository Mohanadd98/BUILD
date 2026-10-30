import { useState } from 'react';

import { calcConcrete, type ConcreteMix } from '@/calc/concrete';
import { fmt, ltr, parseNumber } from '@/calc/format';
import { AppText, BigButton, Card, Choice, FormulaBox, NumberField, ResultRow, Screen } from '@/components/ui';
import { MATERIALS } from '@/config/materials';
import { usePrefs } from '@/state/preferences';

const initialWaste = String(MATERIALS.concrete.defaultWastePercent);

export default function ConcreteScreen() {
  const { t } = usePrefs();
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [thickness, setThickness] = useState('');
  const [waste, setWaste] = useState(initialWaste);
  const [mix, setMix] = useState<ConcreteMix>('reinforced');

  const result = calcConcrete({
    lengthM: parseNumber(length) ?? 0,
    widthM: parseNumber(width) ?? 0,
    thicknessCm: parseNumber(thickness) ?? 0,
    wastePercent: parseNumber(waste) ?? -1,
    mix,
  });

  const clear = () => {
    setLength('');
    setWidth('');
    setThickness('');
    setWaste(initialWaste);
  };

  return (
    <Screen>
      <Choice<ConcreteMix>
        label={t('concrete.mix')}
        value={mix}
        onChange={setMix}
        options={[
          { value: 'plain', label: t('concrete.mix.plain') },
          { value: 'reinforced', label: t('concrete.mix.reinforced') },
        ]}
      />
      <NumberField label={t('concrete.length')} unit="m" value={length} onChangeText={setLength} />
      <NumberField label={t('concrete.width')} unit="m" value={width} onChangeText={setWidth} />
      <NumberField label={t('concrete.thickness')} unit="cm" value={thickness} onChangeText={setThickness} />
      <NumberField label={t('common.waste')} unit="%" value={waste} onChangeText={setWaste} />

      {result ? (
        <>
          <Card>
            <AppText variant="label" style={{ fontWeight: '700' }}>{t('common.result')}</AppText>
            <ResultRow label={t('concrete.volume')} value={fmt(result.volumeM3)} unit="m³" />
            <ResultRow label={t('concrete.orderVolume')} value={fmt(result.orderVolumeM3)} unit="m³" />
            <ResultRow
              label={`${t('concrete.cement')} (${ltr(`${fmt(result.cementKg, 0)} kg`)})`}
              value={String(result.cementBags)}
              unit={t('concrete.bags')}
            />
            <ResultRow label={t('concrete.sand')} value={fmt(result.sandM3)} unit="m³" />
            <ResultRow label={t('concrete.gravel')} value={fmt(result.gravelM3)} unit="m³" />
          </Card>
          <FormulaBox steps={result.steps} />
          <AppText variant="muted">{t('common.sourceNote')}</AppText>
        </>
      ) : (
        <AppText variant="muted">{t('common.enterValues')}</AppText>
      )}

      <BigButton label={t('common.reset')} variant="secondary" onPress={clear} />
    </Screen>
  );
}
