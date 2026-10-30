import type { TKey } from '@/i18n/en';
import { usePrefs } from '@/state/preferences';
import { ltr } from '@/calc/format';
import { lineParts, type Line } from '@/storage/projects';

import { AppText } from './ui';

/** Shows saved lines in the current language, numbers kept left to right. */
export function SavedLines({ lines, muted = false }: { lines: Line[]; muted?: boolean }) {
  const { t } = usePrefs();
  const tr = (k: string) => t(k as TKey);
  return (
    <>
      {lines.map((l, i) => {
        const { label, value } = lineParts(l, tr);
        return (
          <AppText key={`${l.labelKey}-${i}`} variant={muted ? 'muted' : 'body'}>
            {`${label}: ${l.valueKey || l.unitKey ? value : ltr(value)}`}
          </AppText>
        );
      })}
    </>
  );
}
