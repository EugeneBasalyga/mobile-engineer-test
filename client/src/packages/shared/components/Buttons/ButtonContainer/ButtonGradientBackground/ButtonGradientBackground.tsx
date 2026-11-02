import { Canvas, LinearGradient, Rect, type SkPoint } from '@shopify/react-native-skia';
import { memo } from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';
import {
  type DerivedValue,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

import { BUTTON_ANIMATION_CONFIG } from '@/packages/shared/components/Buttons/constants';

interface ButtonGradientBackgroundProps {
  colors: DerivedValue<readonly [string, string]>;
  style?: StyleProp<ViewStyle>;
}

const styles = StyleSheet.create(() => {
  return {
    root: {
      ...StyleSheet.absoluteFillObject,
    },
  };
});

const ButtonGradientBackground = memo(({ colors, style }: ButtonGradientBackgroundProps) => {
  const size = useSharedValue({ height: 0, width: 0 });

  const rect = useDerivedValue(() => {
    const { height, width } = size.get();

    return { height, width, x: 0, y: 0 };
  }, [size]);

  const start = useDerivedValue((): SkPoint => {
    return {
      x: 0,
      y: size.get().height / 2,
    };
  }, [size]);

  const end = useDerivedValue((): SkPoint => {
    const s = size.get();

    return {
      x: s.width,
      y: s.height / 2,
    };
  }, [size]);

  const animatedFirstColor = useDerivedValue(() => {
    return withTiming(colors.get()[0], BUTTON_ANIMATION_CONFIG);
  }, [colors]);

  const animatedSecondColor = useDerivedValue(() => {
    return withTiming(colors.get()[1], BUTTON_ANIMATION_CONFIG);
  }, [colors]);

  const animatedColors = useDerivedValue(() => {
    return [animatedFirstColor.get(), animatedSecondColor.get()];
  }, [animatedFirstColor, animatedSecondColor]);

  return (
    <Canvas style={[styles.root, style]} onSize={size}>
      <Rect rect={rect}>
        <LinearGradient colors={animatedColors} end={end} start={start} />
      </Rect>
    </Canvas>
  );
});

ButtonGradientBackground.displayName = 'ButtonGradientBackground';

export default ButtonGradientBackground;
