import { memo, type PropsWithChildren } from 'react';
import { type StyleProp, View, type ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import BgBlur, { type BgBlurSize } from '@/packages/shared/components/BgBlur';

interface ButtonBgContainerProps extends PropsWithChildren {
  absolute?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  size?: BgBlurSize;
  style?: StyleProp<ViewStyle>;
}

const styles = StyleSheet.create((theme, rt) => {
  return {
    bg: {
      height: '100%',
    },
    content: {
      paddingBottom: rt.insets.bottom + 16,
      paddingHorizontal: 20,
      paddingTop: 16,
      zIndex: theme.zIndex.static,
    },
    root: {
      zIndex: theme.zIndex.static,
    },
    rootAbsolute: {
      bottom: 0,
      left: 0,
      position: 'absolute',
      right: 0,
    },
  };
});

const ButtonBgContainer = memo(
  ({ absolute = true, children, contentStyle, size = 'l', style }: ButtonBgContainerProps) => {
    return (
      <View style={[styles.root, absolute && styles.rootAbsolute, style]}>
        <BgBlur size={size} style={styles.bg} />

        <View style={[styles.content, contentStyle]}>{children}</View>
      </View>
    );
  }
);

ButtonBgContainer.displayName = 'ButtonBgContainer';

export default ButtonBgContainer;
