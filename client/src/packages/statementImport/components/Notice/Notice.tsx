import { memo, type PropsWithChildren } from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Text } from '@/packages/shared/components';

const styles = StyleSheet.create((theme) => {
  return {
    root: {
      backgroundColor: theme.shared.notice.background,
      borderRadius: theme.radius.md,
      padding: theme.spacing.lg,
    },
  };
});

const Notice = memo(({ children }: PropsWithChildren) => {
  return (
    <View accessibilityRole="alert" style={styles.root}>
      <Text>{children}</Text>
    </View>
  );
});

Notice.displayName = 'Notice';

export default Notice;
