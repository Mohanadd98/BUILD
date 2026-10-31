import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { fmt, withUnit } from '@/calc/format';
import { assessHeat, type DayForecast } from '@/calc/heat';
import { usePrefs } from '@/state/preferences';
import { fetchForecast } from '@/storage/weather';
import { sizes } from '@/theme/colors';

import { AppText } from './ui';

/**
 * Hot weather warning for concrete work, from the site city's forecast.
 * Shows nothing when the feature is off, offline, or the service fails.
 */
export function HeatWarning() {
  const { t, colors, weatherCity, lang, loaded } = usePrefs();
  const [days, setDays] = useState<DayForecast[] | null>(null);

  useEffect(() => {
    // Wait for saved settings, so a user who chose Off never sends a request.
    if (!loaded || weatherCity === 'off') return;
    let live = true;
    fetchForecast(weatherCity).then((d) => live && setDays(d));
    return () => {
      live = false;
    };
  }, [weatherCity, loaded]);

  if (!loaded || weatherCity === 'off' || !days) return null;
  const { level, hottest } = assessHeat(days);
  if (!hottest) return null;

  const tone = level === 'warning' ? colors.danger : level === 'caution' ? colors.accent : colors.border;
  const day = new Date(`${hottest.date}T12:00:00`).toLocaleDateString(lang === 'ar' ? 'ar-EG-u-nu-latn' : 'en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  });

  return (
    <View
      accessibilityRole="alert"
      style={{
        borderWidth: 2,
        borderColor: tone,
        borderRadius: sizes.radius,
        padding: sizes.gutter,
        gap: 6,
        backgroundColor: colors.surface,
      }}>
      <AppText variant="label" style={{ fontWeight: '700' }}>{`${t('heat.title')}: ${t(`city.${weatherCity}`)}`}</AppText>
      <AppText variant="muted">{t('heat.forecast')}</AppText>
      <AppText variant="title" style={{ color: level === 'ok' ? colors.text : tone }}>
        {`${withUnit(fmt(hottest.maxC, 1), '°C')} · ${day}`}
      </AppText>
      <AppText>{t(`heat.${level}`)}</AppText>
      {level !== 'ok' ? <AppText variant="muted">{t('heat.airNote')}</AppText> : null}
    </View>
  );
}
