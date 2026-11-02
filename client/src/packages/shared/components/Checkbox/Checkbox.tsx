import { memo, useCallback } from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';
import {
  type AnimatedStyle,
  Easing,
  useAnimatedStyle,
  withSpring,
  withTiming,
  type WithTimingConfig,
} from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { Check } from '@/packages/shared/assets/icons';
import { AnimatedPressable } from '@/packages/shared/components/Primitives';
import { getAnimatedIcon } from '@/packages/shared/utils/getAnimatedIcon.';

export const ANIMATION_CONFIG = {
  duration: 150,
  easing: Easing.inOut(Easing.ease),
} satisfies WithTimingConfig;

interface CheckboxProps {
  checked?: boolean;
  color?: string;
  onPress?: (checked: boolean) => void;
  size?: number;
  style?: StyleProp<AnimatedStyle<ViewStyle>>;
  uncheckedStroke?: number;
}

const styles = StyleSheet.create(() => {
  return {
    root: {
      alignItems: 'center',
      justifyContent: 'center',
    },
  };
});

const AnimatedCheck = getAnimatedIcon(Check);

const Checkbox = memo(
  ({ checked = false, color, onPress, size = 20, style, uncheckedStroke = 2 }: CheckboxProps) => {
    const { theme } = useUnistyles();

    const handlePress = useCallback(() => {
      onPress?.(!checked);
    }, [checked, onPress]);

    const rootAnimatedStyle = useAnimatedStyle(() => {
      const borderColor = checked
        ? (color ?? theme.shared.checkbox.checked)
        : theme.shared.checkbox.default;

      return {
        borderColor: withTiming(borderColor, ANIMATION_CONFIG),
        borderRadius: size / 2,
        borderWidth: withTiming(checked ? size / 2 : uncheckedStroke, ANIMATION_CONFIG),
        height: size,
        width: size,
      };
    }, [
      checked,
      color,
      size,
      theme.shared.checkbox.checked,
      theme.shared.checkbox.default,
      uncheckedStroke,
    ]);

    const checkAnimatedStyle = useAnimatedStyle(() => {
      return {
        transform: [
          {
            scale: withSpring(checked ? 1 : 0, {
              damping: 20,
              mass: 3,
              stiffness: 200,
            }),
          },
        ],
      };
    }, [checked]);

    return (
      <AnimatedPressable style={[styles.root, rootAnimatedStyle, style]} onPress={handlePress}>
        <AnimatedCheck
          color={theme.shared.checkbox.icon}
          height={12}
          style={checkAnimatedStyle}
          width={12}
        />
      </AnimatedPressable>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;
