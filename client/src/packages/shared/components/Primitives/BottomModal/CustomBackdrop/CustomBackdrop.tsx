import { type FC, memo } from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';
import {
  type AnimatedStyle,
  interpolate,
  interpolateColor,
  type SharedValue,
  useAnimatedStyle,
  useDerivedValue,
} from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import {
  AnimatedBlurView,
  AnimatedPressable,
} from '@/packages/shared/components/Primitives/animated';
import { IS_IOS } from '@/packages/shared/constants/platform';
import { getColorAlpha } from '@/packages/shared/utils/colorAlpha';

interface CustomBackdropProps {
  animatedIndex: SharedValue<number>;
  onPress?: () => void;
  style?: StyleProp<AnimatedStyle<ViewStyle>>;
}

const CustomBackdrop: FC<CustomBackdropProps> = ({ animatedIndex, onPress, style }) => {
  const { theme } = useUnistyles();

  const blurAmount = useDerivedValue((): number | undefined => {
    return IS_IOS ? interpolate(animatedIndex.get(), [-1, 0], [0, 55], 'clamp') : 0;
  }, [animatedIndex]);

  const backgroundAnimatedStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(
        animatedIndex.get(),
        [-1, 0],
        [
          getColorAlpha(theme.shared.bottomModal.backdrop, 0),
          getColorAlpha(theme.shared.bottomModal.backdrop, IS_IOS ? 0.6 : 0.8),
        ]
      ),
    };
  }, [animatedIndex, theme.shared.bottomModal.backdrop]);

  return (
    <AnimatedPressable
      style={[StyleSheet.absoluteFill, backgroundAnimatedStyle, style]}
      onPress={onPress}
    >
      {IS_IOS && (
        <AnimatedBlurView
          blurAmount={blurAmount}
          blurType="systemUltraThinMaterialLight"
          style={StyleSheet.absoluteFill}
        />
      )}
    </AnimatedPressable>
  );
};

export default memo(CustomBackdrop);
