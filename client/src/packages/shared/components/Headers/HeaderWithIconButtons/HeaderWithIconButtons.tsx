import { memo, useCallback, type FC } from 'react';
import { type SvgProps } from 'react-native-svg';

import HeaderContainer, {
  type HeaderContainerProps,
} from '@/packages/shared/components/Headers/HeaderContainer';
import HeaderIconButton from '@/packages/shared/components/Headers/HeaderIconButton';
import { HEADER_BASE_HEIGHT } from '@/packages/shared/components/Headers/HeaderWrapper';

export interface HeaderWithIconButtonsProps extends Pick<
  HeaderContainerProps,
  'centerContentStyle' | 'renderCenterContent' | 'style' | 'absolute'
> {
  LeftIcon?: FC<SvgProps>;
  RightIcon?: FC<SvgProps>;
  onLeftIconPress?: () => void;
  onRightIconPress?: () => void;
}

const HeaderWithIconButtons: FC<HeaderWithIconButtonsProps> = ({
  LeftIcon,
  RightIcon,
  absolute = false,
  centerContentStyle,
  onLeftIconPress,
  onRightIconPress,
  renderCenterContent,
  style,
}) => {
  const renderLeftContent = useCallback(() => {
    if (!LeftIcon) {
      return null;
    }

    return <HeaderIconButton Icon={LeftIcon} onPress={onLeftIconPress} />;
  }, [LeftIcon, onLeftIconPress]);

  const renderRightContent = useCallback(() => {
    if (!RightIcon) {
      return null;
    }

    return <HeaderIconButton Icon={RightIcon} onPress={onRightIconPress} />;
  }, [RightIcon, onRightIconPress]);

  return (
    <HeaderContainer
      absolute={absolute}
      centerContentStyle={centerContentStyle}
      renderCenterContent={renderCenterContent}
      renderLeftContent={renderLeftContent}
      renderRightContent={renderRightContent}
      sideContentSize={HEADER_BASE_HEIGHT}
      style={style}
    />
  );
};

export default memo(HeaderWithIconButtons);
