import { type Ref } from 'react';
import { type Text as RNText, type TextProps as RNTextProps } from 'react-native';
import Animated, { type AnimatedProps } from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

export interface AnimatedTextProps extends AnimatedProps<RNTextProps> {
  ref?: Ref<RNText>;
}

const styles = StyleSheet.create((theme) => ({
  root: {
    color: theme.shared.text.primary,
    ...theme.typography.body.m.regular,
  },
}));

const AnimatedText = ({ children, ref, style, ...props }: AnimatedTextProps) => {
  return (
    <Animated.Text maxFontSizeMultiplier={2} {...props} ref={ref} style={[styles.root, style]}>
      {children}
    </Animated.Text>
  );
};

AnimatedText.displayName = 'AnimatedText';

export default AnimatedText;
