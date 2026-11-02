import BlurView from '@sbaiahmed1/react-native-blur';
import { memo, useCallback } from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';
import { type AnimatedStyle, type SharedValue } from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import ButtonContainer, {
  type ButtonContainerExternalProps,
} from '@/packages/shared/components/Buttons/ButtonContainer';
import { BUTTON_SIZE } from '@/packages/shared/components/Buttons/constants';
import { IS_IOS } from '@/packages/shared/constants/platform';

import SocialButtonContent, { type SocialButtonProvider } from './SocialButtonContent';

export type SocialButtonVariant = 'primary' | 'secondary';

interface SocialButtonProps extends ButtonContainerExternalProps {
  provider: SocialButtonProvider;
  contentStyle?: StyleProp<AnimatedStyle<ViewStyle>>;
  variant?: SocialButtonVariant;
}

const styles = StyleSheet.create((theme) => {
  return {
    blur: {
      ...StyleSheet.absoluteFillObject,
      flex: 1,
      height: '100%',
      width: 'auto',
    },
    root: {
      borderRadius: theme.radius.full,
      height: BUTTON_SIZE.medium,
      paddingHorizontal: theme.spacing.lg,
    },
  };
});

const SocialButton = memo(
  ({
    contentStyle,
    disabled = false,
    loading = false,
    onPress,
    provider,
    style,
    variant = 'primary',
    withHapticFeedback = true,
  }: SocialButtonProps) => {
    const { theme } = useUnistyles();

    const buttonTheme = theme.shared.button.socialVariant[variant];

    const renderContent = useCallback(
      (pressed: SharedValue<boolean>) => {
        return (
          <SocialButtonContent
            buttonTheme={buttonTheme}
            disabled={disabled}
            loading={loading}
            pressed={pressed}
            provider={provider}
            style={contentStyle}
          />
        );
      },
      [buttonTheme, contentStyle, disabled, loading, provider]
    );

    const renderUnderBackground = useCallback(() => {
      if (IS_IOS && variant === 'primary') {
        return (
          <BlurView
            ignoreSafeArea
            blurAmount={20}
            blurType="systemUltraThinMaterialLight"
            style={styles.blur}
          />
        );
      }

      return null;
    }, [variant]);

    return (
      <ButtonContainer
        buttonTheme={buttonTheme}
        disabled={disabled}
        loading={loading}
        renderContent={renderContent}
        renderUnderBackground={renderUnderBackground}
        style={[styles.root, style]}
        withHapticFeedback={withHapticFeedback}
        onPress={onPress}
      />
    );
  }
);

SocialButton.displayName = 'SocialButton';

export default SocialButton;
