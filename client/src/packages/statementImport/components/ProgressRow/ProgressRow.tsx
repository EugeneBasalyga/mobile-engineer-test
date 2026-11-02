import { memo } from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Loader, Text } from '@/packages/shared/components';

interface ProgressRowProps {
  label: string;
}

const styles = StyleSheet.create((theme) => {
  return {
    label: {
      flex: 1,
    },
    root: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: theme.spacing.lg,
    },
  };
});

const ProgressRow = memo(({ label }: ProgressRowProps) => {
  return (
    <View style={styles.root}>
      <Loader />

      <Text style={styles.label}>{label}</Text>
    </View>
  );
});

ProgressRow.displayName = 'ProgressRow';

export default ProgressRow;
