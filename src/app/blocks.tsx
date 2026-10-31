import { useState } from 'react';

import type { MaterialKey } from '@/calc/boq';
import { calcBlocks, type BlockPreset, type BlockSize, type WallType } from '@/calc/blocks';
import { fmt, ltr, parseNumber } from '@/calc/format';
import { SaveButton } from '@/components/save-button';
import { AppText, BigButton, Card, Choice, FormulaBox, NumberField, ResultRow, Screen } from '@/components/ui';
import { MATERIALS } from '@/config/materials';
import { usePrefs } from '@/state/preferences';

type BlockChoice = BlockPreset | 'custom';

const blockMaterial: Record<BlockChoice, MaterialKey> = {
  redBrick: 'brickRed',
  cementBrick: 'brickCement',
  hollowBlock: 'blockHollow',
  custom: 'blockCustom',
};

const presets = MATERIALS.masonry.blocks;
const initialWaste = String(MATERIALS.masonry.defaultBlockWastePercent);

export default function BlocksScreen() {
  const { t } = usePrefs();
  const [length, setLength] = useState('');
  const [height, setHeight] = useState('');
  const [openings, setOpenings] = useState('');
  const [waste, setWaste] = useState(initialWaste);
  const [choice, setChoice] = useState<BlockChoice>('redBrick');
  const [wallType, setWallType] = useState<WallType>('half');
  const [customL, setCustomL] = useState('');
  const [customW, setCustomW] = useState('');
  const [customH, setCustomH] = useState('');

  const block: BlockSize =
    choice === 'custom'
      ? {
          lengthCm: parseNumber(customL) ?? 0,
          widthCm: parseNumber(customW) ?? 0,
          heightCm: parseNumber(customH) ?? 0,
        }
      : presets[choice];
  const allowsOneBrick = choice === 'custom' || presets[choice].fullBrickWall;
  const effectiveWallType = allowsOneBrick ? wallType : 'half';

  const result = calcBlocks({
    wallLengthM: parseNumber(length) ?? 0,
    wallHeightM: parseNumber(height) ?? 0,
    openingsM2: openings.trim() === '' ? 0 : (parseNumber(openings) ?? -1),
    wastePercent: parseNumber(waste) ?? -1,
    block,
    wallType: effectiveWallType,
  });

  const size = (b: BlockSize) => ltr(`${b.lengthCm}×${b.widthCm}×${b.heightCm}`);

  const clear = () => {
    setLength('');
    setHeight('');
    setOpenings('');
    setWaste(initialWaste);
  };

  return (
    <Screen>
      <Choice<BlockChoice>
        label={t('blocks.type')}
        value={choice}
        onChange={setChoice}
        options={[
          { value: 'redBrick', label: `${t('blocks.redBrick')}\n${size(presets.redBrick)}` },
          { value: 'cementBrick', label: `${t('blocks.cementBrick')}\n${size(presets.cementBrick)}` },
          { value: 'hollowBlock', label: `${t('blocks.hollowBlock')}\n${size(presets.hollowBlock)}` },
          { value: 'custom', label: t('blocks.custom') },
        ]}
      />
      {choice === 'custom' ? (
        <>
          <NumberField label={t('blocks.blockLength')} unit="cm" value={customL} onChangeText={setCustomL} />
          <NumberField label={t('blocks.blockWidth')} unit="cm" value={customW} onChangeText={setCustomW} />
          <NumberField label={t('blocks.blockHeight')} unit="cm" value={customH} onChangeText={setCustomH} />
        </>
      ) : null}
      {allowsOneBrick ? (
        <Choice<WallType>
          label={t('blocks.wallType')}
          value={wallType}
          onChange={setWallType}
          options={[
            { value: 'half', label: t('blocks.wall.half') },
            { value: 'one', label: t('blocks.wall.one') },
          ]}
        />
      ) : null}

      <NumberField label={t('blocks.wallLength')} unit="m" value={length} onChangeText={setLength} />
      <NumberField label={t('blocks.wallHeight')} unit="m" value={height} onChangeText={setHeight} />
      <NumberField label={t('blocks.openings')} unit="m²" value={openings} onChangeText={setOpenings} />
      <NumberField label={t('common.waste')} unit="%" value={waste} onChangeText={setWaste} />

      {result ? (
        <>
          <Card>
            <AppText variant="label" style={{ fontWeight: '700' }}>{t('common.result')}</AppText>
            <ResultRow label={t('blocks.netArea')} value={fmt(result.netAreaM2)} unit="m²" />
            <ResultRow
              label={`${t('blocks.count')} (${ltr(`${fmt(result.blocksPerM2, 1)} /m²`)})`}
              value={String(result.blocks)}
              unit={t('blocks.units')}
            />
            <ResultRow label={t('blocks.thickness')} value={fmt(result.wallThicknessM * 100, 1)} unit="cm" />
            <ResultRow label={t('blocks.mortar')} value={fmt(result.orderMortarM3, 3)} unit="m³" />
            <ResultRow
              label={`${t('concrete.cement')} (${ltr(`${fmt(result.cementKg, 0)} kg`)})`}
              value={String(result.cementBags)}
              unit={t('concrete.bags')}
            />
            <ResultRow label={t('concrete.sand')} value={fmt(result.sandM3, 3)} unit="m³" />
          </Card>
          <SaveButton
            build={() => ({
              tool: 'blocks',
              inputs: [
                choice === 'custom'
                  ? { labelKey: 'blocks.type', value: `${fmt(block.lengthCm)}×${fmt(block.widthCm)}×${fmt(block.heightCm)}`, unit: 'cm' }
                  : { labelKey: 'blocks.type', valueKey: `blocks.${choice}` },
                { labelKey: 'blocks.wallType', valueKey: `blocks.wall.${effectiveWallType}` },
                { labelKey: 'blocks.wallLength', value: length.trim(), unit: 'm' },
                { labelKey: 'blocks.wallHeight', value: height.trim(), unit: 'm' },
                { labelKey: 'blocks.openings', value: openings.trim() || '0', unit: 'm²' },
                { labelKey: 'common.waste', value: waste.trim(), unit: '%' },
              ],
              results: [
                { labelKey: 'blocks.netArea', value: fmt(result.netAreaM2), unit: 'm²' },
                { labelKey: 'blocks.count', value: String(result.blocks), unitKey: 'blocks.units' },
                { labelKey: 'blocks.thickness', value: fmt(result.wallThicknessM * 100, 1), unit: 'cm' },
                { labelKey: 'blocks.mortar', value: fmt(result.orderMortarM3, 3), unit: 'm³' },
                { labelKey: 'concrete.cement', value: String(result.cementBags), unitKey: 'concrete.bags' },
                { labelKey: 'concrete.step.cement', value: fmt(result.cementKg, 0), unit: 'kg' },
                { labelKey: 'concrete.sand', value: fmt(result.sandM3, 3), unit: 'm³' },
              ],
              steps: result.steps,
              materials: [
                { item: blockMaterial[choice], qty: result.blocks },
                { item: 'cement', qty: result.cementBags },
                { item: 'sand', qty: result.sandM3 },
              ],
            })}
          />
          <FormulaBox steps={result.steps} />
          <AppText variant="muted">{t('blocks.legend')}</AppText>
          <AppText variant="muted">{t('common.sourceNote')}</AppText>
        </>
      ) : (
        <AppText variant="muted">{t('common.enterValues')}</AppText>
      )}

      <BigButton label={t('common.reset')} variant="secondary" onPress={clear} />
    </Screen>
  );
}
