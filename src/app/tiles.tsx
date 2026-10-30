import { useState } from 'react';

import { fmt, ltr, parseNumber } from '@/calc/format';
import { calcTiles, type TilePreset } from '@/calc/tiles';
import { SaveButton } from '@/components/save-button';
import { AppText, BigButton, Card, Choice, FormulaBox, NumberField, ResultRow, Screen } from '@/components/ui';
import { MATERIALS } from '@/config/materials';
import { usePrefs } from '@/state/preferences';

type TileChoice = TilePreset | 'custom';

const s = MATERIALS.tiles;
const presets = s.presets;
const initialWaste = String(s.defaultWastePercent);
const initialJoint = String(s.defaultJointMm);

export default function TilesScreen() {
  const { t } = usePrefs();
  const [choice, setChoice] = useState<TileChoice>('t60x60');
  const [area, setArea] = useState('');
  const [perBox, setPerBox] = useState('');
  const [waste, setWaste] = useState(initialWaste);
  const [joint, setJoint] = useState(initialJoint);
  const [thickness, setThickness] = useState(String(presets.t60x60.thicknessMm));
  const [customL, setCustomL] = useState('');
  const [customW, setCustomW] = useState('');

  const changeChoice = (c: TileChoice) => {
    setChoice(c);
    if (c !== 'custom') setThickness(String(presets[c].thicknessMm));
  };

  const size =
    choice === 'custom'
      ? { lengthCm: parseNumber(customL) ?? 0, widthCm: parseNumber(customW) ?? 0 }
      : presets[choice];

  const result = calcTiles({
    areaM2: parseNumber(area) ?? 0,
    tileLengthCm: size.lengthCm,
    tileWidthCm: size.widthCm,
    tileThicknessMm: parseNumber(thickness) ?? 0,
    jointMm: parseNumber(joint) ?? -1,
    tilesPerBox: parseNumber(perBox) ?? 0,
    wastePercent: parseNumber(waste) ?? -1,
  });

  const label = (p: TilePreset) => ltr(`${presets[p].lengthCm}×${presets[p].widthCm}`);

  const clear = () => {
    setArea('');
    setPerBox('');
    setWaste(initialWaste);
    setJoint(initialJoint);
  };

  return (
    <Screen>
      <Choice<TileChoice>
        label={t('tiles.size')}
        value={choice}
        onChange={changeChoice}
        options={[
          { value: 't30x30', label: label('t30x30') },
          { value: 't40x40', label: label('t40x40') },
          { value: 't60x60', label: label('t60x60') },
          { value: 't60x120', label: label('t60x120') },
          { value: 'custom', label: t('tiles.custom') },
        ]}
      />
      {choice === 'custom' ? (
        <>
          <NumberField label={t('tiles.tileLength')} unit="cm" value={customL} onChangeText={setCustomL} />
          <NumberField label={t('tiles.tileWidth')} unit="cm" value={customW} onChangeText={setCustomW} />
        </>
      ) : null}
      <NumberField label={t('tiles.area')} unit="m²" value={area} onChangeText={setArea} />
      <NumberField label={t('tiles.perBox')} unit={t('tiles.units')} value={perBox} onChangeText={setPerBox} />
      <NumberField label={t('common.waste')} unit="%" value={waste} onChangeText={setWaste} />
      <NumberField label={t('tiles.joint')} unit="mm" value={joint} onChangeText={setJoint} />
      <NumberField label={t('tiles.thickness')} unit="mm" value={thickness} onChangeText={setThickness} />

      {result ? (
        <>
          <Card>
            <AppText variant="label" style={{ fontWeight: '700' }}>{t('common.result')}</AppText>
            <ResultRow label={t('tiles.count')} value={String(result.tiles)} unit={t('tiles.units')} />
            <ResultRow label={t('tiles.boxes')} value={String(result.boxes)} unit={t('tiles.boxUnit')} />
            <ResultRow
              label={`${t('tiles.adhesive')} (${ltr(`${fmt(result.adhesiveKg, 0)} kg`)})`}
              value={String(result.adhesiveBags)}
              unit={`${t('tiles.bagsOf')} ${ltr(`${s.adhesive.bagKg} kg`)}`}
            />
            <ResultRow
              label={`${t('tiles.grout')} (${ltr(`${fmt(result.groutKg, 1)} kg`)})`}
              value={String(result.groutBags)}
              unit={`${t('tiles.bagsOf')} ${ltr(`${s.grout.bagKg} kg`)}`}
            />
          </Card>
          <SaveButton
            build={() => ({
              tool: 'tiles',
              inputs: [
                { labelKey: 'tiles.size', value: `${fmt(size.lengthCm)}×${fmt(size.widthCm)}`, unit: 'cm' },
                { labelKey: 'tiles.area', value: area.trim(), unit: 'm²' },
                { labelKey: 'tiles.perBox', value: perBox.trim() },
                { labelKey: 'common.waste', value: waste.trim(), unit: '%' },
                { labelKey: 'tiles.joint', value: joint.trim(), unit: 'mm' },
                { labelKey: 'tiles.thickness', value: thickness.trim(), unit: 'mm' },
              ],
              results: [
                { labelKey: 'tiles.count', value: String(result.tiles), unitKey: 'tiles.units' },
                { labelKey: 'tiles.boxes', value: String(result.boxes), unitKey: 'tiles.boxUnit' },
                { labelKey: 'tiles.adhesive', value: fmt(result.adhesiveKg, 0), unit: 'kg' },
                { labelKey: 'tiles.grout', value: fmt(result.groutKg, 1), unit: 'kg' },
              ],
              steps: result.steps,
            })}
          />
          <FormulaBox steps={result.steps} />
          <AppText variant="muted">{t('tiles.legend')}</AppText>
          <AppText variant="muted">{t('tiles.productNote')}</AppText>
        </>
      ) : (
        <AppText variant="muted">{t('tiles.enterValues')}</AppText>
      )}

      <BigButton label={t('common.reset')} variant="secondary" onPress={clear} />
    </Screen>
  );
}
