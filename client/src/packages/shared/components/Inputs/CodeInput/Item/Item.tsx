import { type FC, memo } from 'react';
import Animated, {
  Easing,
  useAnimatedStyle,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
  ZoomIn,
  ZoomOut,
} from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { AnimatedText } from '@/packages/shared/components';

const DURATION = 150;
const CURSOR_BLINKING_DURATION = 250;
const EASING = Easing.inOut(Easing.ease);

const styles = StyleSheet.create((theme) => ({
  cursor: {
    alignSelf: 'center',
    backgroundColor: theme.shared.inputs.code.cursor,
    borderRadius: 1,
    height: 30,
    width: 2,
  },
  root: {
    borderRadius: theme.radius.xl4,
    height: 72,
    justifyContent: 'center',
    width: 56,
  },
  text: {
    textAlign: 'center',
    ...theme.typography.heading.h3,
  },
}));

interface ItemProps {
  focused: boolean;
  isLastFilled: boolean;
  value: string;
}

const Item: FC<ItemProps> = ({ focused, isLastFilled, value }) => {
  const { theme } = useUnistyles();

  const { background: backgroundTheme, text: textTheme } = theme.shared.inputs.code;

  const rootAnimatedStyle = useAnimatedStyle(() => {
    let backgroundColor = backgroundTheme.default;

    if (focused) {
      backgroundColor = backgroundTheme.focused;
    } else if (value) {
      backgroundColor = isLastFilled ? backgroundTheme.filledLast : backgroundTheme.filled;
    }

    return {
      backgroundColor: withTiming(backgroundColor, {
        duration: DURATION,
        easing: EASING,
      }),
    };
  }, [
    backgroundTheme.default,
    backgroundTheme.focused,
    backgroundTheme.filledLast,
    backgroundTheme.filled,
    focused,
    value,
    isLastFilled,
  ]);

  const textAnimatedStyle = useAnimatedStyle(() => {
    return {
      color: withTiming(isLastFilled || !value ? textTheme.last : textTheme.default, {
        duration: DURATION / 2,
        easing: EASING,
      }),
    };
  }, [textTheme.default, textTheme.last, isLastFilled, value]);

  const cursorAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity:
        focused && !value
          ? withRepeat(
              withSequence(
                withDelay(
                  100,
                  withTiming(1, {
                    duration: CURSOR_BLINKING_DURATION,
                    easing: EASING,
                  })
                ),
                withDelay(
                  400,
                  withTiming(0, {
                    duration: CURSOR_BLINKING_DURATION,
                    easing: EASING,
                  })
                )
              ),
              -1,
              true
            )
          : withTiming(0, {
              duration: DURATION,
              easing: EASING,
            }),
    };
  }, [focused, value]);

  return (
    <Animated.View style={[styles.root, rootAnimatedStyle]}>
      {!!value && (
        <Animated.Text
          entering={ZoomIn.duration(DURATION).easing(EASING)}
          exiting={ZoomOut.duration(DURATION / 2).easing(EASING)}
        >
          <AnimatedText accessible={false} style={[styles.text, textAnimatedStyle]}>
            {value}
          </AnimatedText>
        </Animated.Text>
      )}

      {focused && !value && <Animated.View style={[styles.cursor, cursorAnimatedStyle]} />}
    </Animated.View>
  );
};

export default memo(Item);
