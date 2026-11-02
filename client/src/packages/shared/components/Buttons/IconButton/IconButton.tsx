import { type FC, memo, useCallback } from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';
import { type AnimatedStyle, type SharedValue } from 'react-native-reanimated';
import { type SvgProps } from 'react-native-svg';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import ButtonContainer, {
  type ButtonContainerExternalProps,
} from '@/packages/shared/components/Buttons/ButtonContainer';
import ButtonContent, {
  type ButtonContentExternalProps,
} from '@/packages/shared/components/Buttons/ButtonContent';
import { BUTTON_SIZE } from '@/packages/shared/components/Buttons/constants';
import { type ButtonSize } from '@/packages/shared/components/Buttons/types';

export type IconButtonVariant = 'primary' | 'secondary';

interface IconButtonProps
  extends
    ButtonContainerExternalProps,
    Omit<ButtonContentExternalProps, 'title' | 'IconLeft' | 'IconRight'> {
  Icon: FC<SvgProps>;
  contentStyle?: StyleProp<AnimatedStyle<ViewStyle>>;
  size?: ButtonSize;
  variant?: IconButtonVariant;
}

const styles = StyleSheet.create((theme) => {
  return {
    root: {
      variants: {
        size: {
          extraSmall: {
            height: BUTTON_SIZE.extraSmall,
            width: BUTTON_SIZE.extraSmall,
          },
          large: {
            height: BUTTON_SIZE.large,
            width: BUTTON_SIZE.large,
          },
          medium: {
            height: BUTTON_SIZE.medium,
            width: BUTTON_SIZE.medium,
          },
          small: {
            height: BUTTON_SIZE.small,
            width: BUTTON_SIZE.small,
          },
        } satisfies Record<ButtonSize, ViewStyle>,
        variant: {
          primary: {
            borderRadius: theme.radius.md,
          },
          secondary: {
            borderRadius: theme.radius.full,
          },
        } satisfies Record<IconButtonVariant, ViewStyle>,
      },
    },
  };
});

const IconButton = memo(
  ({
    Icon,
    contentStyle,
    disabled = false,
    loading = false,
    onPress,
    size = 'medium',
    style,
    variant = 'primary',
    withHapticFeedback = true,
  }: IconButtonProps) => {
    styles.useVariants({
      size,
      variant,
    });

    const { theme } = useUnistyles();

    const buttonTheme = theme.shared.button.iconVariant[variant];

    const renderContent = useCallback(
      (pressed: SharedValue<boolean>) => {
        return (
          <ButtonContent
            IconLeft={Icon}
            buttonTheme={buttonTheme}
            disabled={disabled}
            loading={loading}
            pressed={pressed}
            size={size}
            style={contentStyle}
          />
        );
      },
      [Icon, buttonTheme, contentStyle, disabled, loading, size]
    );

    return (
      <ButtonContainer
        buttonTheme={buttonTheme}
        disabled={disabled}
        loading={loading}
        renderContent={renderContent}
        style={[styles.root, style]}
        withHapticFeedback={withHapticFeedback}
        onPress={onPress}
      />
    );
  }
);

IconButton.displayName = 'IconButton';

export default IconButton;
