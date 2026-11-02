/* eslint-disable react-hooks/static-components */
import { memo, type FC } from 'react';
import { type ColorValue, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  type DerivedValue,
  FadeIn,
  FadeOut,
  useDerivedValue,
  withTiming,
  type AnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';
import { type NumberProp, type SvgProps } from 'react-native-svg';
import { StyleSheet } from 'react-native-unistyles';

import { Apple, Google } from '@/packages/shared/assets/icons';
import { BUTTON_ANIMATION_CONFIG } from '@/packages/shared/components/Buttons/constants';
import {
  type ButtonTheme,
  type ButtonThemeState,
} from '@/packages/shared/components/Buttons/types';
import Loader from '@/packages/shared/components/Loader';
import { getColorAlpha } from '@/packages/shared/utils/colorAlpha';
import { getAnimatedIcon } from '@/packages/shared/utils/getAnimatedIcon.';

export type SocialButtonProvider = 'apple' | 'google';

const ICON_BY_PROVIDER: Record<SocialButtonProvider, FC<SvgProps>> = {
  apple: Apple,
  google: Google,
};

interface SocialButtonContentProps {
  buttonTheme: ButtonTheme;
  disabled: boolean;
  loading: boolean;
  pressed: SharedValue<boolean>;
  provider: SocialButtonProvider;
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
      flex: 1,
      justifyContent: 'center',
    },
  };
});

const SocialButtonContent = memo(
  ({ buttonTheme, disabled, loading, pressed, provider, style }: SocialButtonContentProps) => {
    const Icon = getAnimatedIcon(ICON_BY_PROVIDER[provider]);

    const state = useDerivedValue((): ButtonThemeState => {
      if (disabled) {
        return 'disabled';
      }

      if (pressed.get()) {
        return 'pressed';
      }

      return 'default';
    }, [disabled, pressed]);

    const isApple = provider === 'apple';

    const animation = useDerivedValue((): ColorValue | NumberProp | undefined => {
      if (isApple) {
        const color = buttonTheme.content[state.get()];

        return withTiming(
          loading ? getColorAlpha(buttonTheme.content[state.get()], 0) : color,
          BUTTON_ANIMATION_CONFIG
        );
      } else {
        let opacity = 1;

        if (loading) {
          opacity = 0;
        } else if (state.get() === 'disabled') {
          opacity = 0.45;
        }

        return withTiming(opacity, BUTTON_ANIMATION_CONFIG);
      }
    }, [isApple, buttonTheme.content, state, loading]);

    return (
      <>
        <Animated.View style={[styles.root, style]}>
          <Icon
            color={isApple ? (animation as DerivedValue<ColorValue | undefined>) : undefined}
            opacity={isApple ? undefined : (animation as DerivedValue<NumberProp | undefined>)}
          />

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
      </>
    );
  }
);

SocialButtonContent.displayName = 'SocialButtonContent';

export default SocialButtonContent;
