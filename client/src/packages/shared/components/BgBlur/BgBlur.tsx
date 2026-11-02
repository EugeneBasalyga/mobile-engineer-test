import MaskedView from '@react-native-masked-view/masked-view';
import BlurView from '@sbaiahmed1/react-native-blur';
import { memo } from 'react';
import { type StyleProp, View, type ViewStyle } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { LinearGradient } from '@/packages/shared/components/Primitives';
import { IS_IOS } from '@/packages/shared/constants/platform';
import { type ICoordinates } from '@/packages/shared/models/coordinates';

export type BgBlurSize = 'l' | 'm';

interface BgBlurProps {
  absolute?: boolean;
  size?: BgBlurSize;
  style?: StyleProp<ViewStyle>;
}

const MASK_COLORS = ['#fff0', '#ffff'];

const COLOR_POINTS = {
  l: {
    end: { x: 0.5, y: 0.85 },
    start: { x: 0.5, y: 0 },
  },
  m: {
    end: { x: 0.5, y: 1 },
    start: { x: 0.5, y: 0 },
  },
} satisfies Record<BgBlurSize, { end: ICoordinates; start: ICoordinates }>;

const BLUR_POINTS = {
  l: {
    end: { x: 0.5, y: 0.66 },
    start: { x: 0.5, y: 0 },
  },
  m: {
    end: { x: 0.5, y: 1 },
    start: { x: 0.5, y: 0 },
  },
} satisfies Record<BgBlurSize, { end: ICoordinates; start: ICoordinates }>;

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
            height: rt.insets.bottom + 84,
          },
          m: {
            height: rt.insets.bottom + 48,
          },
        } satisfies Record<BgBlurSize, ViewStyle>,
      },
      width: '100%',
      zIndex: theme.zIndex.underStatic,
    },
    rootAbsolute: {
      bottom: 0,
      left: 0,
      position: 'absolute',
      right: 0,
    },
  };
});

const BgBlur = memo(({ absolute = true, size = 'm', style }: BgBlurProps) => {
  styles.useVariants({ size });

  const { theme } = useUnistyles();

  const colorPoints = COLOR_POINTS[size];
  const blurPoints = BLUR_POINTS[size];

  return (
    <View pointerEvents="none" style={[styles.root, absolute && styles.rootAbsolute, style]}>
      {IS_IOS && (
        <MaskedView
          pointerEvents="none"
          style={styles.blurContainer}
          maskElement={
            <LinearGradient
              colors={MASK_COLORS}
              end={blurPoints.end}
              start={blurPoints.start}
              style={styles.content}
            />
          }
        >
          <BlurView
            ignoreSafeArea
            blurAmount={4}
            blurType="systemUltraThinMaterialLight"
            style={styles.content}
          />
        </MaskedView>
      )}

      <LinearGradient
        colors={theme.shared.bgBlur[size]}
        end={colorPoints.end}
        start={colorPoints.start}
        style={styles.content}
      />
    </View>
  );
});

BgBlur.displayName = 'BgBlur';

export default BgBlur;
