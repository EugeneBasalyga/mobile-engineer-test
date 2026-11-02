/* eslint-disable react-hooks/static-components */
import { type FC, memo } from 'react';
import { type ColorValue, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  type AnimatedStyle,
  FadeIn,
  FadeOut,
  type SharedValue,
  useDerivedValue,
  withTiming,
} from 'react-native-reanimated';
import { type SvgProps } from 'react-native-svg';
import { StyleSheet } from 'react-native-unistyles';

import { BUTTON_ANIMATION_CONFIG } from '@/packages/shared/components/Buttons/constants';
import {
  type ButtonTheme,
  type ButtonThemeState,
} from '@/packages/shared/components/Buttons/types';
import Loader from '@/packages/shared/components/Loader';
import { getColorAlpha } from '@/packages/shared/utils/colorAlpha';
import { getAnimatedIcon } from '@/packages/shared/utils/getAnimatedIcon.';

export interface HeaderButtonContentProps {
  buttonTheme: ButtonTheme;
  pressed: SharedValue<boolean>;
  Icon?: FC<SvgProps>;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<AnimatedStyle<ViewStyle>>;
}

const styles = StyleSheet.create(() => {
  return {
    loader: {
      alignSelf: 'center',
      position: 'absolute',
    },
    root: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
    },
  };
});

const HeaderButtonContent = memo(
  ({
    Icon,
    buttonTheme,
    disabled = false,
    loading = false,
    pressed,
    style,
  }: HeaderButtonContentProps) => {
    const AnimatedIcon = Icon ? getAnimatedIcon(Icon) : null;

    const state = useDerivedValue((): ButtonThemeState => {
      if (disabled) {
        return 'disabled';
      }

      if (pressed.get()) {
        return 'pressed';
      }

      return 'default';
    }, [disabled, pressed]);

    const animatedColor = useDerivedValue((): ColorValue | undefined => {
      const color = buttonTheme.content[state.get()];

      return withTiming(
        loading ? getColorAlpha(buttonTheme.content[state.get()], 0) : color,
        BUTTON_ANIMATION_CONFIG
      );
    }, [buttonTheme.content, state, loading]);

    return (
      <Animated.View style={[styles.root, style]}>
        {!!AnimatedIcon && <AnimatedIcon color={animatedColor} />}

        {loading && (
          <Animated.View
            style={styles.loader}
            entering={FadeIn.duration(BUTTON_ANIMATION_CONFIG.duration).easing(
              BUTTON_ANIMATION_CONFIG.easing
            )}
            exiting={FadeOut.duration(BUTTON_ANIMATION_CONFIG.duration).easing(
              BUTTON_ANIMATION_CONFIG.easing
            )}
          >
            <Loader color={buttonTheme.content.loading} size={23} />
          </Animated.View>
        )}
      </Animated.View>
    );
  }
);

HeaderButtonContent.displayName = 'HeaderButtonContent';

export default HeaderButtonContent;
