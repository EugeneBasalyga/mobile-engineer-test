/* eslint-disable react-hooks/static-components */
import { type FC, memo } from 'react';
import { type ColorValue, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import Animated, {
  type AnimatedStyle,
  FadeIn,
  FadeOut,
  type SharedValue,
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from 'react-native-reanimated';
import { type SvgProps } from 'react-native-svg';
import { StyleSheet } from 'react-native-unistyles';

import { BUTTON_ANIMATION_CONFIG } from '@/packages/shared/components/Buttons/constants';
import {
  type ButtonSize,
  type ButtonTheme,
  type ButtonThemeState,
} from '@/packages/shared/components/Buttons/types';
import Loader from '@/packages/shared/components/Loader';
import { AnimatedText } from '@/packages/shared/components/Primitives';
import { getColorAlpha } from '@/packages/shared/utils/colorAlpha';
import { getAnimatedIcon } from '@/packages/shared/utils/getAnimatedIcon.';

export interface ButtonContentExternalProps {
  IconLeft?: FC<SvgProps>;
  IconRight?: FC<SvgProps>;
  disabled?: boolean;
  loading?: boolean;
  title?: string;
}

export interface ButtonContentProps extends ButtonContentExternalProps {
  buttonTheme: ButtonTheme;
  pressed: SharedValue<boolean>;
  size: ButtonSize;
  style?: StyleProp<AnimatedStyle<ViewStyle>>;
}

const styles = StyleSheet.create((theme) => {
  return {
    loader: {
      alignSelf: 'center',
      position: 'absolute',
    },
    root: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      variants: {
        size: {
          extraSmall: {
            gap: theme.spacing.xs,
          },
          large: {
            gap: theme.spacing.md,
          },
          medium: {
            gap: theme.spacing.md,
          },
          small: {
            gap: theme.spacing.md,
          },
        } satisfies Record<ButtonSize, ViewStyle>,
      },
    },
    title: {
      textAlign: 'center',
      variants: {
        size: {
          extraSmall: {
            ...theme.typography.captions.m.medium,
          },
          large: {
            ...theme.typography.body.m.medium,
          },
          medium: {
            ...theme.typography.body.m.medium,
          },
          small: {
            ...theme.typography.body.s.medium,
          },
        } satisfies Record<ButtonSize, TextStyle>,
      },
    },
  };
});

const ButtonContent = memo(
  ({
    IconLeft,
    IconRight,
    buttonTheme,
    disabled = false,
    loading = false,
    pressed,
    size,
    style,
    title,
  }: ButtonContentProps) => {
    styles.useVariants({
      size,
    });

    const AnimatedLeftIcon = IconLeft ? getAnimatedIcon(IconLeft) : null;
    const AnimatedRightIcon = IconRight ? getAnimatedIcon(IconRight) : null;

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

      return withTiming(loading ? getColorAlpha(color, 0) : color, BUTTON_ANIMATION_CONFIG);
    }, [buttonTheme.content, state, loading]);

    const titleAnimatedStyle = useAnimatedStyle(() => {
      return {
        color: animatedColor.get(),
      };
    }, [animatedColor]);

    return (
      <Animated.View style={[styles.root, style]}>
        {!!AnimatedLeftIcon && <AnimatedLeftIcon color={animatedColor} />}

        {!!title && <AnimatedText style={[styles.title, titleAnimatedStyle]}>{title}</AnimatedText>}

        {!!AnimatedRightIcon && <AnimatedRightIcon color={animatedColor} />}

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
            <Loader color={buttonTheme.content.loading} size={size === 'extraSmall' ? 15 : 23} />
          </Animated.View>
        )}
      </Animated.View>
    );
  }
);

ButtonContent.displayName = 'ButtonContent';

export default ButtonContent;
