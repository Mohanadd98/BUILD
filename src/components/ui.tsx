import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextStyle,
} from 'react-native';

import type { Step } from '@/calc/format';
import type { TKey } from '@/i18n/en';
import { usePrefs } from '@/state/preferences';
import { sizes } from '@/theme/colors';

type Variant = 'title' | 'body' | 'label' | 'muted' | 'result';

/** Text that aligns right in Arabic and left in English. */
export function AppText({
  children,
  variant = 'body',
  style,
  ltr = false,
}: {
  children: ReactNode;
  variant?: Variant;
  style?: TextStyle;
  /** Force left-to-right, used for formulas and numbers. */
  ltr?: boolean;
}) {
  const { colors, isRTL } = usePrefs();
  const rtl = isRTL && !ltr;
  return (
    <Text
      style={[
        textStyles[variant],
        { color: variant === 'muted' ? colors.textMuted : colors.text },
        { textAlign: rtl ? 'right' : 'left', writingDirection: rtl ? 'rtl' : 'ltr' },
        style,
      ]}>
      {children}
    </Text>
  );
}

/** Scrollable page that flips its layout for Arabic. */
export function Screen({ children }: { children: ReactNode }) {
  const { colors, isRTL } = usePrefs();
  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={[styles.screen, { direction: isRTL ? 'rtl' : 'ltr' }]}
        keyboardShouldPersistTaps="handled">
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export function BigButton({
  label,
  hint,
  onPress,
  disabled,
  variant = 'primary',
}: {
  label: string;
  hint?: string;
  onPress?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
}) {
  const { colors } = usePrefs();
  const primary = variant === 'primary' && !disabled;
  const fg = primary ? colors.onAccent : disabled ? colors.textMuted : colors.text;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: primary ? colors.accent : colors.surface,
          borderColor: primary ? colors.accent : colors.border,
          opacity: pressed ? 0.75 : 1,
        },
      ]}>
      <AppText variant="label" style={{ color: fg, fontSize: 20, fontWeight: '700' }}>
        {label}
      </AppText>
      {hint ? <AppText variant="label" style={{ color: fg, opacity: 0.85 }}>{hint}</AppText> : null}
    </Pressable>
  );
}

export function NumberField({
  label,
  unit,
  value,
  onChangeText,
}: {
  label: string;
  unit: string;
  value: string;
  onChangeText: (text: string) => void;
}) {
  const { colors } = usePrefs();
  return (
    <View style={styles.field}>
      <AppText variant="label">{label}</AppText>
      <View style={[styles.inputRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <TextInput
          accessibilityLabel={`${label} (${unit})`}
          value={value}
          onChangeText={onChangeText}
          keyboardType="decimal-pad"
          inputMode="decimal"
          placeholder="0"
          placeholderTextColor={colors.textMuted}
          selectTextOnFocus
          style={[styles.input, { color: colors.text }]}
        />
        <AppText variant="label" ltr style={{ color: colors.textMuted, minWidth: 36 }}>
          {unit}
        </AppText>
      </View>
    </View>
  );
}

/** Large toggle buttons; exactly one is selected. More than three wrap into two columns. */
export function Choice<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  const { colors } = usePrefs();
  return (
    <View style={styles.field}>
      <AppText variant="label">{label}</AppText>
      <View style={[styles.choiceRow, options.length > 3 && styles.choiceGrid]}>
        {options.map((o) => {
          const selected = o.value === value;
          return (
            <Pressable
              key={o.value}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              onPress={() => onChange(o.value)}
              style={[
                styles.choice,
                options.length > 3 && styles.choiceGridItem,
                {
                  backgroundColor: selected ? colors.accent : colors.surface,
                  borderColor: selected ? colors.accent : colors.border,
                },
              ]}>
              <Text style={[textStyles.label, { fontWeight: '700', textAlign: 'center', color: selected ? colors.onAccent : colors.text }]}>
                {o.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function Card({ children }: { children: ReactNode }) {
  const { colors } = usePrefs();
  return <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>{children}</View>;
}

/** One result: name above, big number with its unit below. */
export function ResultRow({ label, value, unit }: { label: string; value: string; unit: string }) {
  const { colors } = usePrefs();
  return (
    <View style={[styles.resultRow, { borderBottomColor: colors.border }]}>
      <AppText variant="muted">{label}</AppText>
      <View style={styles.resultValue}>
        <Text style={[textStyles.result, { color: colors.text }]}>{value}</Text>
        <AppText variant="label" style={{ color: colors.textMuted }}>{unit}</AppText>
      </View>
    </View>
  );
}

export function FormulaBox({ steps }: { steps: Step[] }) {
  const { t, colors } = usePrefs();
  return (
    <Card>
      <AppText variant="label" style={{ fontWeight: '700' }}>{t('common.formula')}</AppText>
      {steps.map((s) => (
        <View key={s.labelKey} style={[styles.step, { backgroundColor: colors.surfaceAlt }]}>
          <AppText variant="muted">{t(s.labelKey as TKey)}</AppText>
          <AppText ltr style={{ fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }), fontSize: 16 }}>
            {s.expr}
          </AppText>
        </View>
      ))}
    </Card>
  );
}

const textStyles = StyleSheet.create({
  title: { fontSize: sizes.fontTitle, fontWeight: '800' },
  body: { fontSize: sizes.fontBody },
  label: { fontSize: sizes.fontLabel, fontWeight: '600' },
  muted: { fontSize: sizes.fontLabel },
  result: { fontSize: sizes.fontResult, fontWeight: '800', fontVariant: ['tabular-nums'] },
});

const styles = StyleSheet.create({
  screen: { padding: sizes.gutter, gap: sizes.gap * 1.5, paddingBottom: 48 },
  button: {
    minHeight: sizes.touch + 8,
    borderRadius: sizes.radius,
    borderWidth: 2,
    paddingHorizontal: 20,
    paddingVertical: 14,
    justifyContent: 'center',
    gap: 2,
  },
  field: { gap: 8 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: sizes.touch,
    borderRadius: sizes.radius,
    borderWidth: 2,
    paddingHorizontal: 16,
    gap: 8,
  },
  input: { flex: 1, minWidth: 0, fontSize: 26, fontWeight: '700', paddingVertical: 10, textAlign: 'left', writingDirection: 'ltr' },
  choiceRow: { flexDirection: 'row', gap: sizes.gap },
  choiceGrid: { flexWrap: 'wrap' },
  choiceGridItem: { flexBasis: '45%', flexGrow: 1 },
  choice: {
    flex: 1,
    minHeight: sizes.touch,
    borderRadius: sizes.radius,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  card: { borderRadius: sizes.radius, borderWidth: 1, padding: sizes.gutter, gap: sizes.gap },
  resultRow: { paddingBottom: 10, borderBottomWidth: StyleSheet.hairlineWidth, gap: 2 },
  resultValue: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  step: { borderRadius: 10, padding: 12, gap: 4 },
});
