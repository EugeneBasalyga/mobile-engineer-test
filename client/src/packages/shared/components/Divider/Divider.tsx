import { memo } from 'react';
import { type StyleProp, View, type ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

interface DividerProps {
  color?: string;
  style?: StyleProp<ViewStyle>;
}

const styles = StyleSheet.create((theme) => {
  return {
    root: {
      backgroundColor: theme.shared.divider.background,
      borderRadius: theme.radius.full,
      flexShrink: 0,
      height: 1,
      width: '100%',
    },
  };
});

const Divider = memo(({ color, style }: DividerProps) => {
  return <View style={[styles.root, !!color && { backgroundColor: color }, style]} />;
});

Divider.displayName = 'Divider';

export default Divider;
