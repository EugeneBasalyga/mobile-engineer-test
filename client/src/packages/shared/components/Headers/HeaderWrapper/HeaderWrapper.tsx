import { memo, type PropsWithChildren } from 'react';
import { type StyleProp, View, type ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { getHeaderHeight, getHeaderTopOffset } from './utils';

export interface HeaderWrapperProps extends PropsWithChildren {
  absolute?: boolean;
  style?: StyleProp<ViewStyle>;
}

const styles = StyleSheet.create((theme, rt) => {
  return {
    root: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      minHeight: getHeaderHeight(rt.insets.top),
      paddingHorizontal: 20,
      paddingTop: getHeaderTopOffset(rt.insets.top),
      zIndex: theme.zIndex.static,
    },
    rootAbsolute: {
      left: 0,
      position: 'absolute',
      right: 0,
      top: 0,
    },
  };
});

const HeaderWrapper = memo(({ absolute = false, children, style }: HeaderWrapperProps) => {
  return <View style={[styles.root, absolute && styles.rootAbsolute, style]}>{children}</View>;
});

HeaderWrapper.displayName = 'HeaderWrapper';

export default HeaderWrapper;
