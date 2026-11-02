import {
  type FC,
  memo,
  type ReactElement,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import {
  type ColorValue,
  type LayoutChangeEvent,
  type StyleProp,
  View,
  type ViewStyle,
} from 'react-native';
import Animated, {
  cancelAnimation,
  interpolate,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';
import { scheduleOnRN } from 'react-native-worklets';

import { Check } from '@/packages/shared/assets/icons';
import { AnimatedText } from '@/packages/shared/components';
import { getAnimatedIcon } from '@/packages/shared/utils/getAnimatedIcon.';

const styles = StyleSheet.create((theme) => ({
  content: {
    columnGap: theme.spacing.md,
    flexDirection: 'row',
    left: 0,
    paddingTop: theme.spacing.xs,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  errorContainer: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  errorText: {
    ...theme.typography.body.s.regular,
  },
}));

interface InputFooterProps {
  color: string;
  absoluteError?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  errorText?: string;
  style?: StyleProp<ViewStyle>;
}

const AnimatedIcon = getAnimatedIcon(Check);

export const InputFooter: FC<InputFooterProps> = ({
  absoluteError = false,
  color,
  contentStyle,
  errorText,
  style,
}) => {
  const calculatedVisible = !!errorText;

  const [visible, setVisible] = useState(calculatedVisible);
  const heightAnimValue = useSharedValue(0);
  const progress = useSharedValue(visible ? 1 : 0);

  useLayoutEffect(() => {
    progress.set(withTiming(calculatedVisible ? 1 : 0));

    return () => {
      cancelAnimation(progress);
    };
  }, [calculatedVisible, progress]);

  useAnimatedReaction(
    () => !!progress.get(),
    (isVisible, prevIsVisible) => {
      if (isVisible !== prevIsVisible) {
        scheduleOnRN(setVisible, isVisible);
      }
    },
    [progress]
  );

  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const heightValue = heightAnimValue.get();

      if (heightValue === 0 || Math.abs(event.nativeEvent.layout.height - heightValue) > 2) {
        // eslint-disable-next-line react-compiler/react-compiler
        heightAnimValue.set(
          heightValue === 0
            ? event.nativeEvent.layout.height
            : withTiming(event.nativeEvent.layout.height)
        );
      }
    },
    [heightAnimValue]
  );

  const containerAnimStyle = useAnimatedStyle(() => {
    return {
      height: absoluteError ? 0 : interpolate(progress.get(), [0, 1], [0, heightAnimValue.get()]),
      opacity: progress.get(),
    };
  }, [absoluteError, heightAnimValue, progress]);

  const animatedColor = useDerivedValue((): ColorValue | undefined => {
    return withTiming(color);
  }, [color]);

  const errorAnimatedStyle = useAnimatedStyle(() => {
    return {
      color: animatedColor.get(),
    };
  }, [animatedColor]);

  const renderContentRef = useRef<ReactElement>(null);

  // eslint-disable-next-line react-hooks/refs
  renderContentRef.current = !calculatedVisible ? (
    // eslint-disable-next-line react-hooks/refs
    renderContentRef.current
  ) : (
    <View style={styles.errorContainer}>
      <AnimatedIcon color={animatedColor} height={20} width={20} />

      <AnimatedText accessible={false} style={[styles.errorText, errorAnimatedStyle]}>
        {errorText}
      </AnimatedText>
    </View>
  );

  if (!visible) {
    return null;
  }

  return (
    <Animated.View style={[containerAnimStyle, style]}>
      <View collapsable={false} style={[styles.content, contentStyle]} onLayout={handleLayout}>
        {
          // eslint-disable-next-line react-hooks/refs
          renderContentRef.current
        }
      </View>
    </Animated.View>
  );
};

export default memo(InputFooter);
