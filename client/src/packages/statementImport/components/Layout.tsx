import { type PropsWithChildren } from 'react';
import { ScrollView, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Button, type ButtonVariant, Loader, Text } from '@/packages/shared/components';

const styles = StyleSheet.create((theme, runtime) => ({
  content: {
    flexGrow: 1,
    gap: theme.spacing.lg,
    paddingBottom: runtime.insets.bottom + theme.spacing.xl4,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: runtime.insets.top + theme.spacing.xl,
  },
  muted: {
    color: theme.colors.neutral600,
  },
  notice: {
    backgroundColor: theme.colors.neutral200,
    borderRadius: theme.radius.md,
    padding: theme.spacing.lg,
  },
  progress: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.lg,
  },
  progressLabel: {
    flex: 1,
  },
  root: {
    backgroundColor: theme.app.background.primary,
    flex: 1,
  },
  row: {
    gap: theme.spacing.xxs,
    paddingVertical: theme.spacing.xs,
  },
  title: {
    ...theme.typography.heading.h4.medium,
  },
}));

/** Everything scrolls, so large system text pushes content down without hiding an action. */
export const Screen = ({ children, title }: PropsWithChildren<{ title: string }>) => (
  <ScrollView contentContainerStyle={styles.content} style={styles.root}>
    <Text accessibilityRole="header" style={styles.title}>
      {title}
    </Text>

    {children}
  </ScrollView>
);

export const Body = ({ children, muted }: PropsWithChildren<{ muted?: boolean }>) => (
  <Text style={muted && styles.muted}>{children}</Text>
);

export const Notice = ({ children }: PropsWithChildren) => (
  <View accessibilityRole="alert" style={styles.notice}>
    <Text>{children}</Text>
  </View>
);

export const Progress = ({ label }: { label: string }) => (
  <View style={styles.progress}>
    <Loader />

    <Text style={styles.progressLabel}>{label}</Text>
  </View>
);

export const Row = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.row}>
    <Text style={styles.muted}>{label}</Text>

    <Text>{value}</Text>
  </View>
);

interface ActionProps {
  onPress: () => void;
  title: string;
  disabled?: boolean;
  variant?: ButtonVariant;
}

export const Action = ({ disabled, onPress, title, variant = 'secondary' }: ActionProps) => (
  <Button
    disabled={disabled}
    title={title}
    variant={variant}
    withHapticFeedback={false}
    onPress={onPress}
  />
);
