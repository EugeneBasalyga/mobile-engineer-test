import { memo, type ReactNode, useMemo } from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';
import { type AnimatedStyle, type SharedValue, useDerivedValue } from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

import {
  type ButtonTheme,
  type ButtonThemeState,
} from '@/packages/shared/components/Buttons/types';
import { AnimatedPressable } from '@/packages/shared/components/Primitives';
import { usePressableHandler } from '@/packages/shared/hooks/pressableHandler';

import ButtonGradientBackground from './ButtonGradientBackground';

export interface ButtonContainerExternalProps {
  disabled?: boolean;
  loading?: boolean;
  onPress?: () => void;
  style?: StyleProp<AnimatedStyle<ViewStyle>>;
}

export interface ButtonContainerProps extends ButtonContainerExternalProps {
  buttonTheme: ButtonTheme;
  renderContent?: (pressed: SharedValue<boolean>) => ReactNode;
  renderUnderBackground?: (pressed: SharedValue<boolean>) => ReactNode;
}

const styles = StyleSheet.create(() => {
  return {
    root: {
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
  };
});

const ButtonContainer = memo(
  ({
    buttonTheme,
    disabled = false,
    loading = false,
    onPress,
    renderContent,
    renderUnderBackground,
    style,
  }: ButtonContainerProps) => {
    const { handlePress, handlePressIn, handlePressOut, pressed } = usePressableHandler({
      onPress,
    });

    const state = useDerivedValue((): ButtonThemeState => {
      if (disabled) {
        return 'disabled';
      }

      if (loading) {
        return 'loading';
      }

      if (pressed.get()) {
        return 'pressed';
      }

      return 'default';
    }, [disabled, loading, pressed]);

    const backgroundColor = useDerivedValue((): readonly [string, string] => {
      const color = buttonTheme.background[state.value];

      return typeof color === 'string' ? [color, color] : color;
    }, [buttonTheme.background, state]);

    const content = useMemo(() => {
      return renderContent ? renderContent(pressed) : null;
    }, [pressed, renderContent]);

    const underBackground = useMemo(() => {
      return renderUnderBackground ? renderUnderBackground(pressed) : null;
    }, [pressed, renderUnderBackground]);

    return (
      <AnimatedPressable
        disabled={loading || disabled}
        style={[styles.root, style]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        {underBackground}

        <ButtonGradientBackground colors={backgroundColor} />

        {content}
      </AnimatedPressable>
    );
  }
);

ButtonContainer.displayName = 'ButtonContainer';

export default ButtonContainer;
