import { router } from 'expo-router';
import { Alert, Platform, View } from 'react-native';

import { boqCsv, boqHtml, buildBoq, type BoqLabels, type MaterialKey, type MaterialUnit, type Phase } from '@/calc/boq';
import { fmt, withUnit } from '@/calc/format';
import type { TKey } from '@/i18n/en';
import { usePrefs } from '@/state/preferences';
import { usePrices } from '@/state/prices';
import { fileSafe, shareCsv, sharePdf } from '@/storage/export';
import type { Project } from '@/storage/projects';
import { sizes } from '@/theme/colors';

import { AppText, BigButton, Card } from './ui';

function money(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** The project's bill of quantities with PDF, CSV and quote-request exports. */
export function BoqCard({ project }: { project: Project }) {
  const { t, lang, isRTL, colors } = usePrefs();
  const { prices } = usePrices();
  const boq = buildBoq(project.calcs, prices);
  const date = new Date().toLocaleDateString(lang === 'ar' ? 'ar-EG-u-nu-latn' : 'en-GB');
  const cur = t('boq.currency');

  const labels = (quote: boolean): BoqLabels => ({
    appName: t('app.name'),
    title: t(quote ? 'boq.quoteTitle' : 'boq.title'),
    project: t('boq.project'),
    date: t('boq.date'),
    phase: t('boq.phase'),
    item: t('boq.item'),
    qty: t('boq.qty'),
    unit: t('boq.unit'),
    unitPrice: t('boq.unitPrice'),
    amount: t('boq.amount'),
    subtotal: t('boq.subtotal'),
    total: t('boq.total'),
    currency: cur,
    note: t(quote ? 'boq.quoteNote' : 'boq.note'),
    phaseName: (p: Phase) => t(`phase.${p}`),
    itemName: (m: MaterialKey) => t(`mat.${m}` as TKey),
    unitName: (u: MaterialUnit) => t(`unit.${u}` as TKey),
  });

  const run = async (job: () => Promise<void>) => {
    try {
      await job();
    } catch {
      if (Platform.OS !== 'web') Alert.alert(t('boq.exportError'));
    }
  };
  const base = fileSafe(project.name);
  const exportPdf = () =>
    run(() => sharePdf(boqHtml(boq, project.name, date, labels(false), { mode: 'boq', rtl: isRTL }), `${base}-BOQ`));
  const exportCsv = () => run(() => shareCsv(boqCsv(boq, project.name, date, labels(false)), `${base}-BOQ`));
  const requestQuote = () =>
    run(() => sharePdf(boqHtml(boq, project.name, date, labels(true), { mode: 'quote', rtl: isRTL }), `${base}-RFQ`));

  if (boq.phases.length === 0) {
    return (
      <Card>
        <AppText variant="label" style={{ fontWeight: '700' }}>{t('boq.title')}</AppText>
        <AppText variant="muted">{t('boq.empty')}</AppText>
      </Card>
    );
  }

  const unpriced = boq.phases.flatMap((p) => p.rows.filter((r) => r.unitPrice === null).map((r) => t(`mat.${r.item}` as TKey)));

  return (
    <View style={{ gap: sizes.gap }}>
      <Card>
        <AppText variant="title" style={{ fontSize: 22 }}>{t('boq.title')}</AppText>
        {boq.phases.map((p) => (
          <View key={p.phase} style={{ gap: 4, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: colors.border }}>
            <AppText variant="label" style={{ fontWeight: '700', color: colors.accent }}>{t(`phase.${p.phase}`)}</AppText>
            {p.rows.map((r) => (
              <AppText key={r.item}>
                {`${t(`mat.${r.item}` as TKey)}: ${withUnit(fmt(r.qty, 2), t(`unit.${r.unit}` as TKey))}` +
                  (r.amount === null ? '' : `  ·  ${withUnit(money(r.amount), cur)}`)}
              </AppText>
            ))}
            {p.subtotal > 0 ? (
              <AppText variant="muted">{`${t('boq.subtotal')}: ${withUnit(money(p.subtotal), cur)}`}</AppText>
            ) : null}
          </View>
        ))}
        <AppText variant="title" style={{ fontSize: 22 }}>{`${t('boq.total')}: ${withUnit(money(boq.total), cur)}`}</AppText>
        {unpriced.length > 0 ? (
          <AppText variant="muted">{`${t('boq.unpriced')} ${[...new Set(unpriced)].join('، ')}`}</AppText>
        ) : null}
      </Card>
      <BigButton label={t('boq.exportPdf')} onPress={exportPdf} />
      <BigButton label={t('boq.exportCsv')} variant="secondary" onPress={exportCsv} />
      <BigButton label={t('boq.requestQuote')} variant="secondary" onPress={requestQuote} />
      <BigButton label={t('boq.setPrices')} variant="secondary" onPress={() => router.push('/prices')} />
    </View>
  );
}
