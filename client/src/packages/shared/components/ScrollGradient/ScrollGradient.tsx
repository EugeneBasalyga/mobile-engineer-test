import MaskedView from '@react-native-masked-view/masked-view';
import BlurView from '@sbaiahmed1/react-native-blur';
import { clamp } from 'lodash';
import { type FC, type PropsWithChildren } from 'react';
import { type StyleProp, View, type ViewStyle } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { getHeaderHeight } from '@/packages/shared/components/Headers';
import { getNavigationBarHeight } from '@/packages/shared/components/NavigationBar';
import { LinearGradient } from '@/packages/shared/components/Primitives';
import { IS_ANDROID } from '@/packages/shared/constants/platform';

const MASK_COLOR = '#ffffffff';
const TRANSPARENT_COLOR = '#ffffff00';

const TOP_COLORS = [TRANSPARENT_COLOR, MASK_COLOR];
const BOTTOM_COLORS = [MASK_COLOR, TRANSPARENT_COLOR];

const TOP_BLUR_COLORS = [MASK_COLOR, MASK_COLOR, TRANSPARENT_COLOR];
const BOTTOM_BLUR_COLORS = [TRANSPARENT_COLOR, MASK_COLOR, MASK_COLOR];

export interface ScrollGradientOptions {
  additionalBottomSize?: number;
  additionalTopSize?: number;
  bottomBlurAmount?: number;
  bottomOpacityOffset?: number;
  bottomSize?: number;
  topBlurAmount?: number;
  topOpacityOffset?: number;
  topSize?: number;
  withoutBlur?: boolean;
}

interface ScrollGradientProps
  extends PropsWithChildren, ScrollGradientOptions, Pick<ViewStyle, 'pointerEvents'> {
  style?: StyleProp<ViewStyle>;
}

const styles = StyleSheet.create(() => {
  return {
    blurContainer: {
      bottom: 0,
      left: 0,
      position: 'absolute',
      right: 0,
      top: 0,
      zIndex: 1,
    },
    bottomBlur: {
      bottom: 0,
      left: 0,
      position: 'absolute',
      right: 0,
      width: '100%',
    },
    container: {
      flex: 1,
      justifyContent: 'space-between',
      width: '100%',
    },
    gradient: {
      flexShrink: 0,
      width: '100%',
    },
    topBlur: {
      flexShrink: 0,
      width: '100%',
    },
    visibleView: {
      backgroundColor: '#ffffff',
      flex: 1,
      width: '100%',
    },
  };
});

const ScrollGradient: FC<ScrollGradientProps> = ({
  additionalBottomSize = 8,
  additionalTopSize = 8,
  bottomBlurAmount = 20,
  bottomOpacityOffset: bottomOpacityOffsetProp,
  bottomSize: bottomSizeProp,
  children,
  pointerEvents,
  style,
  topBlurAmount = 20,
  topOpacityOffset: topOpacityOffsetProp,
  topSize: topSizeProp,
  withoutBlur = false,
}) => {
  const {
    rt: { insets },
  } = useUnistyles();

  const topSize = topSizeProp ?? getHeaderHeight(insets.top) + additionalTopSize;

  const topOpacityOffset = clamp(topOpacityOffsetProp ?? 0, 0, topSize);

  const topHeight = topSize - topOpacityOffset;
  const topMargin = topOpacityOffset;

  const bottomSize = bottomSizeProp ?? getNavigationBarHeight(insets.bottom) + additionalBottomSize;

  const bottomOpacityOffset = clamp(bottomOpacityOffsetProp ?? 0, 0, bottomSize);

  const bottomHeight = bottomSize - bottomOpacityOffset;
  const bottomMargin = bottomOpacityOffset;

  const showBlurs = !IS_ANDROID && !withoutBlur && (topSize > 0 || bottomSize > 0);

  return (
    <MaskedView
      pointerEvents={pointerEvents ?? 'box-none'}
      style={[styles.container, style]}
      maskElement={
        <View style={styles.container}>
          {topSize > 0 && (
            <LinearGradient
              colors={TOP_COLORS}
              style={[
                styles.gradient,
                {
                  height: topHeight,
                  marginTop: topMargin,
                },
              ]}
            />
          )}

          <View style={styles.visibleView} />

          {bottomSize > 0 && (
            <LinearGradient
              colors={BOTTOM_COLORS}
              style={[styles.gradient, { height: bottomHeight, marginBottom: bottomMargin }]}
            />
          )}
        </View>
      }
    >
      {showBlurs && (
        <MaskedView
          pointerEvents="none"
          style={styles.blurContainer}
          maskElement={
            <View style={styles.container}>
              <LinearGradient
                colors={TOP_BLUR_COLORS}
                style={[
                  styles.gradient,
                  {
                    height: topHeight,
                    marginTop: topMargin,
                  },
                ]}
              />

              <LinearGradient
                colors={BOTTOM_BLUR_COLORS}
                style={[styles.gradient, { height: bottomHeight, marginBottom: bottomMargin }]}
              />
            </View>
          }
        >
          {topSize > 0 && (
            <BlurView
              ignoreSafeArea
              blurAmount={topBlurAmount}
              blurType="systemUltraThinMaterialLight"
              style={[
                styles.topBlur,
                {
                  height: topHeight,
                  marginTop: topMargin,
                },
              ]}
            />
          )}

          {bottomSize > 0 && (
            <BlurView
              ignoreSafeArea
              blurAmount={bottomBlurAmount}
              blurType="systemUltraThinMaterialLight"
              style={[styles.bottomBlur, { height: bottomHeight, marginBottom: bottomMargin }]}
            />
          )}
        </MaskedView>
      )}

      {children}
    </MaskedView>
  );
};

ScrollGradient.displayName = 'ScrollGradient';

export default ScrollGradient;
