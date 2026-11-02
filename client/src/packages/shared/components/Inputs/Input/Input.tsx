import { type FC, memo, type ReactNode, type Ref, useMemo } from 'react';
import {
  TextInput as RNTextInput,
  type StyleProp,
  type TextInput,
  type TextInputProps,
  View,
  type ViewStyle,
} from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { IS_ANDROID } from '@/packages/shared/constants/platform';
import spacing from '@/packages/shared/theme/spacing';

import InputFooter from './InputFooter';

export type InputVariant = 'primary' | 'secondary';

export type InputSize = 'small' | 'medium';

const BORDER_WIDTH = 1;

const styles = StyleSheet.create((theme) => ({
  container: {
    alignItems: 'center',
    borderRadius: theme.radius.full,
    borderWidth: BORDER_WIDTH,
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.xs - BORDER_WIDTH,
    paddingVertical: 0,
    variants: {
      size: {
        medium: {
          height: 56,
        },
        small: {
          height: 48,
        },
      } satisfies Record<InputSize, ViewStyle>,
    },
  },
  input: {
    ...theme.typography.body.m.regular,
    flex: 1,
    height: '100%',
    lineHeight: undefined,
  },
  multiline: {
    flex: 1,
    paddingVertical: spacing.xl - BORDER_WIDTH,
    textAlignVertical: 'top',
    zIndex: 100,
  },
  multilineContainer: {
    alignItems: 'flex-start',
    borderRadius: theme.radius.xl4,
    height: 'auto',
    maxHeight: 160,
    minHeight: 117,
  },
  sideContent: {
    minWidth: 4,
    paddingVertical: spacing.xs,
  },
}));

export interface InputProps extends TextInputProps {
  absoluteError?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  // Wrap the content you want to animate inside <Animated.View layout={LinearTransition.duration(300)}> or pass the prop `absoluteError`
  errorText?: string;
  inputRef?: Ref<TextInput>;
  inputStyle?: StyleProp<ViewStyle>;
  label?: string;
  onPressLeftComponent?: () => void;
  renderInput?: (props: TextInputProps) => ReactNode;
  renderLeftContent?: () => ReactNode;
  renderRightContent?: () => ReactNode;
  size?: InputSize;
  variant?: InputVariant;
}

const Primary: FC<InputProps> = ({
  absoluteError,
  accessibilityHint,
  accessibilityState,
  autoCapitalize,
  containerStyle,
  editable = true,
  errorText,
  inputRef,
  inputStyle,
  multiline,
  renderInput,
  renderLeftContent,
  renderRightContent,
  size = 'medium',
  style,
  value,
  variant = 'primary',
  ...props
}) => {
  styles.useVariants({ size });

  const { theme } = useUnistyles();

  const inputTheme = theme.shared.inputs.input.variants[variant];

  const hasError = !!errorText;

  const state = useMemo(() => {
    if (!editable) {
      return 'disabled';
    }

    if (hasError) {
      return 'error';
    }

    return 'default';
  }, [editable, hasError]);

  const containerAnimatedStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: withTiming(inputTheme.background[state]),
      borderColor: withTiming(inputTheme.border[state]),
    };
  }, [inputTheme.background, inputTheme.border, state]);

  const inputProps: TextInputProps = {
    ...props,
    accessibilityHint: errorText || accessibilityHint,
    accessibilityState: {
      ...accessibilityState,
      disabled: accessibilityState?.disabled ?? !editable,
    },
    accessibilityValue: {
      text: value || ' ',
    },
    autoCapitalize: autoCapitalize ?? 'none',
    cursorColor: inputTheme.cursor,
    editable,
    multiline,
    placeholderTextColor: inputTheme.placeholder,
    selectionColor: inputTheme.cursor,
    style: [styles.input, multiline && styles.multiline, inputStyle],
    textAlignVertical: multiline && IS_ANDROID ? 'top' : 'center',
    value,
  };

  const leftContent = useMemo(() => {
    return renderLeftContent?.();
  }, [renderLeftContent]);

  const rightContent = useMemo(() => {
    return renderRightContent?.();
  }, [renderRightContent]);

  return (
    <View style={style}>
      <Animated.View
        style={[
          styles.container,
          multiline && styles.multilineContainer,
          containerAnimatedStyle,
          containerStyle,
        ]}
      >
        <View style={styles.sideContent}>{leftContent}</View>

        {renderInput ? renderInput(inputProps) : <RNTextInput ref={inputRef} {...inputProps} />}

        <View style={styles.sideContent}>{rightContent}</View>
      </Animated.View>

      <InputFooter absoluteError={absoluteError} color={inputTheme.error} errorText={errorText} />
    </View>
  );
};

export default memo(Primary);
