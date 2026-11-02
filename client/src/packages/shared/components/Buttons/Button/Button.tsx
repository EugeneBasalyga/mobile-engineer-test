import { memo, useCallback } from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';
import { type AnimatedStyle, type SharedValue } from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import ButtonContainer, {
  type ButtonContainerExternalProps,
} from '@/packages/shared/components/Buttons/ButtonContainer';
import ButtonContent, {
  type ButtonContentExternalProps,
} from '@/packages/shared/components/Buttons/ButtonContent';
import { BUTTON_SIZE } from '@/packages/shared/components/Buttons/constants';
import { type ButtonSize } from '@/packages/shared/components/Buttons/types';

export type ButtonVariant = 'primary' | 'secondary' | 'bare' | 'bareSecondary';

interface ButtonProps extends ButtonContainerExternalProps, ButtonContentExternalProps {
  contentStyle?: StyleProp<AnimatedStyle<ViewStyle>>;
  size?: ButtonSize;
  variant?: ButtonVariant;
}

const styles = StyleSheet.create((theme) => {
  return {
    rootNotBare: {
      borderRadius: theme.radius.full,
      variants: {
        size: {
          extraSmall: {
            minHeight: BUTTON_SIZE.extraSmall,
            paddingHorizontal: theme.spacing.md,
          },
          large: {
            minHeight: BUTTON_SIZE.large,
            paddingHorizontal: theme.spacing.xl,
          },
          medium: {
            minHeight: BUTTON_SIZE.medium,
            paddingHorizontal: theme.spacing.lg,
          },
          small: {
            minHeight: BUTTON_SIZE.small,
            paddingHorizontal: theme.spacing.md,
          },
        } satisfies Record<ButtonSize, ViewStyle>,
      },
    },
  };
});

const Button = memo(
  ({
    IconLeft,
    IconRight,
    contentStyle,
    disabled = false,
    loading = false,
    onPress,
    size = 'medium',
    style,
    title,
    variant = 'primary',
    withHapticFeedback = true,
  }: ButtonProps) => {
    styles.useVariants({
      size,
    });

    const { theme } = useUnistyles();

    const buttonTheme = theme.shared.button.variants[variant];

    const renderContent = useCallback(
      (pressed: SharedValue<boolean>) => {
        return (
          <ButtonContent
            IconLeft={IconLeft}
            IconRight={IconRight}
            buttonTheme={buttonTheme}
            disabled={disabled}
            loading={loading}
            pressed={pressed}
            size={size}
            style={contentStyle}
            title={title}
          />
        );
      },
      [IconLeft, IconRight, buttonTheme, contentStyle, disabled, loading, size, title]
    );

    return (
      <ButtonContainer
        buttonTheme={buttonTheme}
        disabled={disabled}
        loading={loading}
        renderContent={renderContent}
        style={[variant !== 'bare' && variant !== 'bareSecondary' && styles.rootNotBare, style]}
        withHapticFeedback={withHapticFeedback}
        onPress={onPress}
      />
    );
  }
);

Button.displayName = 'Button';

export default Button;
