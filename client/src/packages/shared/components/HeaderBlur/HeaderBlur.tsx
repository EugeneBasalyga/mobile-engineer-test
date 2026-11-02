import MaskedView from '@react-native-masked-view/masked-view';
import BlurView from '@sbaiahmed1/react-native-blur';
import { memo } from 'react';
import { type StyleProp, View, type ViewStyle } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { LinearGradient } from '@/packages/shared/components/Primitives';
import { IS_IOS } from '@/packages/shared/constants/platform';
import { type ICoordinates } from '@/packages/shared/models/coordinates';

export type HeaderBlurSize = 'l' | 'lAlt' | 'm';

interface HeaderBlurProps {
  absolute?: boolean;
  size?: HeaderBlurSize;
  style?: StyleProp<ViewStyle>;
}

const MASK_COLORS = ['#ffff', '#fff0'];

const COLOR_POINTS = {
  l: {
    end: { x: 0.5, y: 0.85 },
    start: { x: 0.5, y: 0 },
  },
  lAlt: {
    end: { x: 0.5, y: 0.85 },
    start: { x: 0.5, y: 0 },
  },
  m: {
    end: { x: 0.5, y: 1 },
    start: { x: 0.5, y: 0 },
  },
} satisfies Record<HeaderBlurSize, { end: ICoordinates; start: ICoordinates }>;

const BLUR_POINTS = {
  end: { x: 0.5, y: 1 },
  start: { x: 0.5, y: 0 },
};

const styles = StyleSheet.create((theme, rt) => {
  return {
    blurContainer: {
      ...StyleSheet.absoluteFillObject,
      height: '100%',
      width: '100%',
    },
    content: {
      height: '100%',
      width: '100%',
      ...StyleSheet.absoluteFillObject,
    },
    root: {
      variants: {
        size: {
          l: {
            height: rt.insets.top + 125,
          },
          lAlt: {
            height: rt.insets.top + 125,
          },
          m: {
            height: rt.insets.top + 87,
          },
        } satisfies Record<HeaderBlurSize, ViewStyle>,
      },
      width: '100%',
      zIndex: theme.zIndex.underStatic,
    },
    rootAbsolute: {
      left: 0,
      position: 'absolute',
      right: 0,
      top: 0,
    },
  };
});

const HeaderBlur = memo(({ absolute = true, size = 'm', style }: HeaderBlurProps) => {
  styles.useVariants({ size });

  const { theme } = useUnistyles();

  const colorPoints = COLOR_POINTS[size];

  return (
    <View pointerEvents="none" style={[styles.root, absolute && styles.rootAbsolute, style]}>
      {IS_IOS && (
        <MaskedView
          pointerEvents="none"
          style={styles.blurContainer}
          maskElement={
            <LinearGradient
              colors={MASK_COLORS}
              end={BLUR_POINTS.end}
              start={BLUR_POINTS.start}
              style={styles.content}
            />
          }
        >
          <BlurView
            ignoreSafeArea
            blurAmount={10}
            blurType="systemUltraThinMaterialLight"
            style={styles.content}
          />
        </MaskedView>
      )}

      <LinearGradient
        colors={theme.shared.headerBlur[size]}
        end={colorPoints.end}
        start={colorPoints.start}
        style={styles.content}
      />
    </View>
  );
});

HeaderBlur.displayName = 'HeaderBlur';

export default HeaderBlur;
