import { memo, type PropsWithChildren } from 'react';
import { StyleSheet } from 'react-native-unistyles';

import { Text } from '@/packages/shared/components';

interface BodyTextProps extends PropsWithChildren {
  muted?: boolean;
}

const styles = StyleSheet.create((theme) => {
  return {
    muted: {
      color: theme.shared.text.secondary,
    },
  };
});

const BodyText = memo(({ children, muted = false }: BodyTextProps) => {
  return <Text style={muted && styles.muted}>{children}</Text>;
});

BodyText.displayName = 'BodyText';

export default BodyText;
