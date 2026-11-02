import { memo, useCallback } from 'react';
import { type StyleProp, type TextStyle } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import HeaderWithIcons, {
  type HeaderWithIconButtonsProps,
} from '@/packages/shared/components/Headers/HeaderWithIconButtons';
import Text from '@/packages/shared/components/Primitives/Text';

export interface HeaderProps extends Omit<
  HeaderWithIconButtonsProps,
  'centerContentStyle' | 'renderCenterContent'
> {
  title?: string;
  titleStyle?: StyleProp<TextStyle>;
}

const styles = StyleSheet.create((theme) => {
  return {
    title: {
      color: theme.colors.neutral950,
      textAlign: 'center',
      ...theme.typography.body.l.medium,
    },
  };
});

const Header = memo(
  ({
    LeftIcon,
    RightIcon,
    absolute = false,
    onLeftIconPress,
    onRightIconPress,
    style,
    title,
    titleStyle,
  }: HeaderProps) => {
    const renderCenterContent = useCallback(() => {
      if (!title) {
        return null;
      }

      return <Text style={[styles.title, titleStyle]}>{title}</Text>;
    }, [title, titleStyle]);

    return (
      <HeaderWithIcons
        LeftIcon={LeftIcon}
        RightIcon={RightIcon}
        absolute={absolute}
        renderCenterContent={renderCenterContent}
        style={style}
        onLeftIconPress={onLeftIconPress}
        onRightIconPress={onRightIconPress}
      />
    );
  }
);

Header.displayName = 'Header';

export default Header;
