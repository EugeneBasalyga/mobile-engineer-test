import { memo } from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Text } from '@/packages/shared/components';

interface InfoRowProps {
  label: string;
  value: string;
}

const styles = StyleSheet.create((theme) => {
  return {
    label: {
      color: theme.shared.text.secondary,
    },
    root: {
      gap: theme.spacing.xxs,
      paddingVertical: theme.spacing.xs,
    },
  };
});

const InfoRow = memo(({ label, value }: InfoRowProps) => {
  return (
    <View style={styles.root}>
      <Text style={styles.label}>{label}</Text>

      <Text>{value}</Text>
    </View>
  );
});

InfoRow.displayName = 'InfoRow';

export default InfoRow;
