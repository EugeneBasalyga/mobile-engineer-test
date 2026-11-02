import { memo } from 'react';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

const styles = StyleSheet.create((theme) => ({
  dot: {
    borderRadius: theme.radius.full,
  },
}));

interface DotProps {
  count: number;
  index: number;
  progress: SharedValue<number>;
  size: number;
}

const Dot = memo(({ count, index, progress, size }: DotProps) => {
  const { theme } = useUnistyles();

  const animatedProgressStyle = useAnimatedStyle(() => {
    let progressValue = progress.get();

    if (index === 0 && progressValue > count - 1) {
      progressValue = progressValue - count;
    }

    if (index === count - 1 && progressValue < 0) {
      progressValue = progressValue + count;
    }

    return {
      backgroundColor: interpolateColor(
        progressValue,
        [index - 1, index, index + 1],
        [
          theme.shared.pageControl.inactive,
          theme.shared.pageControl.active,
          theme.shared.pageControl.inactive,
        ]
      ),
    };
  }, [count, index, progress, theme.shared.pageControl.active, theme.shared.pageControl.inactive]);

  return (
    <Animated.View
      style={[
        styles.dot,
        {
          height: size,
          width: size,
        },
        animatedProgressStyle,
      ]}
    />
  );
});

Dot.displayName = 'Dot';

export default Dot;
