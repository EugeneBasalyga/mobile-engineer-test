import { useCallback, type FC } from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';
import { type AnimatedStyle, type SharedValue } from 'react-native-reanimated';
import { type SvgProps } from 'react-native-svg';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import ButtonContainer from '@/packages/shared/components/Buttons/ButtonContainer';
import { HEADER_BASE_HEIGHT } from '@/packages/shared/components/Headers/HeaderWrapper';

import HeaderButtonContent from './HeaderButtonContent';

const styles = StyleSheet.create(() => ({
  root: {
    borderRadius: HEADER_BASE_HEIGHT / 2,
    flexShrink: 0,
    height: HEADER_BASE_HEIGHT,
    width: HEADER_BASE_HEIGHT,
  },
}));

interface HeaderIconButtonProps {
  Icon: FC<SvgProps>;
  contentStyle?: StyleProp<AnimatedStyle<ViewStyle>>;
  disabled?: boolean;
  loading?: boolean;
  onPress?: () => void;
  style?: StyleProp<AnimatedStyle<ViewStyle>>;
}

const HeaderIconButton: FC<HeaderIconButtonProps> = ({
  Icon,
  contentStyle,
  disabled,
  loading,
  onPress,
  style,
}) => {
  const { theme } = useUnistyles();

  const renderContent = useCallback(
    (pressed: SharedValue<boolean>) => {
      return (
        <HeaderButtonContent
          Icon={Icon}
          buttonTheme={theme.shared.header.button}
          disabled={disabled}
          loading={loading}
          pressed={pressed}
          style={contentStyle}
        />
      );
    },
    [Icon, contentStyle, disabled, loading, theme.shared.header.button]
  );

  return (
    <ButtonContainer
      buttonTheme={theme.shared.header.button}
      disabled={disabled}
      loading={loading}
      renderContent={renderContent}
      style={[styles.root, style]}
      onPress={onPress}
    />
  );
};

export default HeaderIconButton;
