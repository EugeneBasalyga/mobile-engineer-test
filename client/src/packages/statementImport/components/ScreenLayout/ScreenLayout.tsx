import { memo, type PropsWithChildren } from 'react';
import { ScrollView } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Text } from '@/packages/shared/components';

interface ScreenLayoutProps extends PropsWithChildren {
  title: string;
}

const styles = StyleSheet.create((theme, runtime) => {
  return {
    content: {
      flexGrow: 1,
      gap: theme.spacing.lg,
      paddingBottom: runtime.insets.bottom + theme.spacing.xl4,
      paddingHorizontal: theme.spacing.xl,
      paddingTop: runtime.insets.top + theme.spacing.xl,
    },
    root: {
      backgroundColor: theme.app.background.primary,
      flex: 1,
    },
    title: {
      ...theme.typography.heading.h4.medium,
    },
  };
});

const ScreenLayout = memo(({ children, title }: ScreenLayoutProps) => {
  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.root}>
      <Text accessibilityRole="header" style={styles.title}>
        {title}
      </Text>

      {children}
    </ScrollView>
  );
});

ScreenLayout.displayName = 'ScreenLayout';

export default ScreenLayout;
