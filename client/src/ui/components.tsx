import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

/** Text still grows with the system setting, but stops short of breaking words in the middle. */
export const MAX_FONT_SCALE = 2;

export const colors = {
  text: '#14202B',
  muted: '#55626F',
  border: '#D5DBE1',
  primary: '#1B5E9B',
  danger: '#B3261E',
  warningBackground: '#FFF4DC',
  background: '#FFFFFF',
};

/** Everything scrolls, so large system text can push content down without hiding an action. */
export function Screen({ title, children }: { title: string; children: ReactNode }) {
  return (
    <ScrollView contentContainerStyle={styles.screen} keyboardShouldPersistTaps="handled">
      <Text accessibilityRole="header" maxFontSizeMultiplier={MAX_FONT_SCALE} style={styles.title}>
        {title}
      </Text>
      {children}
    </ScrollView>
  );
}

export function Body({ children, muted }: { children: ReactNode; muted?: boolean }) {
  return <Text maxFontSizeMultiplier={MAX_FONT_SCALE} style={[styles.body, muted && styles.muted]}>{children}</Text>;
}

export function Notice({ children }: { children: ReactNode }) {
  return (
    <View style={styles.notice} accessibilityRole="alert">
      <Text maxFontSizeMultiplier={MAX_FONT_SCALE} style={styles.body}>{children}</Text>
    </View>
  );
}

export function Progress({ label }: { label: string }) {
  return (
    <View style={styles.progress}>
      <ActivityIndicator color={colors.primary} />
      <Text maxFontSizeMultiplier={MAX_FONT_SCALE} style={[styles.body, styles.progressLabel]}>{label}</Text>
    </View>
  );
}

type ActionProps = {
  label: string;
  onPress: () => void;
  kind?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
};

export function Action({ label, onPress, kind = 'secondary', disabled }: ActionProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(disabled) }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.action,
        kind === 'primary' && styles.primary,
        kind === 'danger' && styles.danger,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <Text maxFontSizeMultiplier={MAX_FONT_SCALE} style={[styles.actionLabel, kind !== 'secondary' && styles.actionLabelInverse]}>{label}</Text>
    </Pressable>
  );
}

export function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text maxFontSizeMultiplier={MAX_FONT_SCALE} style={[styles.body, styles.muted]}>{label}</Text>
      <Text maxFontSizeMultiplier={MAX_FONT_SCALE} style={styles.body}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { padding: 16, paddingBottom: 32, gap: 12, flexGrow: 1 },
  title: { fontSize: 24, fontWeight: '700', color: colors.text },
  body: { fontSize: 16, lineHeight: 22, color: colors.text, flexShrink: 1 },
  muted: { color: colors.muted },
  notice: { backgroundColor: colors.warningBackground, borderRadius: 8, padding: 12 },
  progress: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  progressLabel: { flex: 1 },
  action: {
    minHeight: 48,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: { backgroundColor: colors.primary, borderColor: colors.primary },
  danger: { backgroundColor: colors.danger, borderColor: colors.danger },
  pressed: { opacity: 0.75 },
  disabled: { opacity: 0.45 },
  actionLabel: { fontSize: 16, fontWeight: '600', color: colors.text, textAlign: 'center' },
  actionLabelInverse: { color: '#FFFFFF' },
  row: { gap: 2, paddingVertical: 4 },
});
