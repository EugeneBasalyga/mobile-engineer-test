import { type Ref } from 'react';
import { Text as RNText, type TextProps as RNTextProps } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

export interface TextProps extends RNTextProps {
  ref?: Ref<RNText>;
}

const styles = StyleSheet.create((theme) => ({
  root: {
    color: theme.shared.text.primary,
    ...theme.typography.body.m.regular,
  },
}));

const Text = ({ children, ref, style, ...props }: TextProps) => {
  return (
    <RNText maxFontSizeMultiplier={2} {...props} ref={ref} style={[styles.root, style]}>
      {children}
    </RNText>
  );
};

Text.displayName = 'Text';

export default Text;
