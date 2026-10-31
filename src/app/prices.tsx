import { useState } from 'react';

import { MATERIALS_LIST, type MaterialKey } from '@/calc/boq';
import { fmt, parseNumber } from '@/calc/format';
import { AppText, NumberField, Screen } from '@/components/ui';
import type { TKey } from '@/i18n/en';
import { usePrefs } from '@/state/preferences';
import { usePrices } from '@/state/prices';

export default function PricesScreen() {
  const { t } = usePrefs();
  const { prices, setPrice } = usePrices();
  // Text as typed, so a half-typed "12." is not reformatted while editing.
  const [text, setText] = useState<Partial<Record<MaterialKey, string>>>(() =>
    Object.fromEntries(Object.entries(prices).map(([k, v]) => [k, fmt(v, 2)])),
  );

  const change = (item: MaterialKey, value: string) => {
    setText((s) => ({ ...s, [item]: value }));
    setPrice(item, value.trim() === '' ? null : parseNumber(value));
  };

  return (
    <Screen>
      <AppText variant="muted">{t('prices.intro')}</AppText>
      {MATERIALS_LIST.map((m) => (
        <NumberField
          key={m.key}
          label={t(`mat.${m.key}` as TKey)}
          unit={`${t('boq.currency')}/${t(`unit.${m.unit}` as TKey)}`}
          value={text[m.key] ?? ''}
          onChangeText={(v) => change(m.key, v)}
        />
      ))}
    </Screen>
  );
}
