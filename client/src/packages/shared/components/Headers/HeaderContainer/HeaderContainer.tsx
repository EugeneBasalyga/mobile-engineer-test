import { memo, type ReactNode, useMemo } from 'react';
import { type StyleProp, View, type ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import HeaderWrapper, {
  type HeaderWrapperProps,
} from '@/packages/shared/components/Headers/HeaderWrapper';

export interface HeaderContainerProps extends Omit<HeaderWrapperProps, 'children'> {
  centerContentStyle?: StyleProp<ViewStyle>;
  leftContentStyle?: StyleProp<ViewStyle>;
  renderCenterContent?: () => ReactNode;
  renderLeftContent?: () => ReactNode;
  renderRightContent?: () => ReactNode;
  rightContentStyle?: StyleProp<ViewStyle>;
  sideContentSize?: number;
}

const styles = StyleSheet.create(() => {
  return {
    centerContent: {
      alignItems: 'center',
      flexGrow: 1,
      flexShrink: 1,
      justifyContent: 'center',
    },
    leftContent: {
      alignItems: 'flex-start',
    },
    rightContent: {
      alignItems: 'flex-end',
    },
    sideContent: (width: number) => {
      return {
        flexGrow: 0,
        flexShrink: 0,
        justifyContent: 'center',
        width,
      };
    },
  };
});

const HeaderContainer = memo(
  ({
    absolute = false,
    centerContentStyle,
    leftContentStyle,
    renderCenterContent,
    renderLeftContent,
    renderRightContent,
    rightContentStyle,
    sideContentSize = 44,
    style,
  }: HeaderContainerProps) => {
    const leftContent = useMemo(() => {
      return renderLeftContent?.();
    }, [renderLeftContent]);

    const rightContent = useMemo(() => {
      return renderRightContent?.();
    }, [renderRightContent]);

    const centerContent = useMemo(() => {
      return renderCenterContent?.();
    }, [renderCenterContent]);

    const hasSideContent = !!leftContent || !!rightContent;

    return (
      <HeaderWrapper absolute={absolute} style={style}>
        {hasSideContent && (
          <View style={[styles.sideContent(sideContentSize), styles.leftContent, leftContentStyle]}>
            {leftContent}
          </View>
        )}

        <View style={[styles.centerContent, centerContentStyle]}>{centerContent}</View>

        {hasSideContent && (
          <View
            style={[styles.sideContent(sideContentSize), styles.rightContent, rightContentStyle]}
          >
            {rightContent}
          </View>
        )}
      </HeaderWrapper>
    );
  }
);

HeaderContainer.displayName = 'HeaderContainer';

export default HeaderContainer;
