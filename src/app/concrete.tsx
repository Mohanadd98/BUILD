import { useState } from 'react';

import { calcConcrete, codeRequirement, zoneOf, type ConcreteMix, type ConcreteZone } from '@/calc/concrete';
import { fmt, ltr, parseNumber } from '@/calc/format';
import { SaveButton } from '@/components/save-button';
import { AppText, BigButton, Card, Choice, FormulaBox, NumberField, ResultRow, Screen } from '@/components/ui';
import { MATERIALS } from '@/config/materials';
import { usePrefs } from '@/state/preferences';

const initialWaste = String(MATERIALS.concrete.defaultWastePercent);
const mixes = MATERIALS.concrete.mixes;
const zones = MATERIALS.concrete.zones;
const zoneOrder: ConcreteZone[] = ['normal', 'chloride', 'seawater', 'plain'];

export default function ConcreteScreen() {
  const { t } = usePrefs();
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [thickness, setThickness] = useState('');
  const [waste, setWaste] = useState(initialWaste);
  const [mix, setMix] = useState<ConcreteMix>('normal');
  const zone = zoneOf(mix);
  const zoneMixes = zones[zone] as readonly ConcreteMix[];

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
      <Choice<ConcreteZone>
        label={t('concrete.zone')}
        value={zone}
        onChange={(z) => setMix(zones[z][0])}
        options={zoneOrder.map((z) => ({ value: z, label: t(`concrete.zone.${z}`) }))}
      />
      {zoneMixes.length > 1 ? (
        <Choice<ConcreteMix>
          label={t('concrete.mix')}
          value={mix}
          onChange={setMix}
          stacked
          options={zoneMixes.map((m) => ({
            value: m,
            label: `${t(`concrete.mix.${m}`)}\n${ltr(`${mixes[m].cementKgPerM3} kg/m³`)}`,
          }))}
        />
      ) : null}
      {zone === 'chloride' || zone === 'seawater' ? (
        <AppText variant="muted">{t(`concrete.zoneNote.${zone}`)}</AppText>
      ) : null}
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
            <AppText variant="muted">{t('concrete.codeReq')}</AppText>
            <AppText ltr variant="label">{codeRequirement(mix)}</AppText>
          </Card>
          <AppText variant="muted">{t('concrete.estimateNote')}</AppText>
          <SaveButton
            build={() => ({
              tool: 'concrete',
              inputs: [
                { labelKey: 'concrete.zone', valueKey: `concrete.zone.${zone}` },
                { labelKey: 'concrete.mix', valueKey: `concrete.mix.${mix}` },
                { labelKey: 'concrete.length', value: length.trim(), unit: 'm' },
                { labelKey: 'concrete.width', value: width.trim(), unit: 'm' },
                { labelKey: 'concrete.thickness', value: thickness.trim(), unit: 'cm' },
                { labelKey: 'common.waste', value: waste.trim(), unit: '%' },
              ],
              results: [
                { labelKey: 'concrete.volume', value: fmt(result.volumeM3), unit: 'm³' },
                { labelKey: 'concrete.orderVolume', value: fmt(result.orderVolumeM3), unit: 'm³' },
                { labelKey: 'concrete.cement', value: String(result.cementBags), unitKey: 'concrete.bags' },
                { labelKey: 'concrete.step.cement', value: fmt(result.cementKg, 0), unit: 'kg' },
                { labelKey: 'concrete.sand', value: fmt(result.sandM3), unit: 'm³' },
                { labelKey: 'concrete.gravel', value: fmt(result.gravelM3), unit: 'm³' },
                { labelKey: 'concrete.codeReq', value: codeRequirement(mix) },
              ],
              steps: result.steps,
            })}
          />
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
