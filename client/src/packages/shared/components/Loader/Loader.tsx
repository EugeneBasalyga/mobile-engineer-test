import { Canvas, Circle, fitbox, Group, Path, rect, Skia, vec } from '@shopify/react-native-skia';
import { memo, useEffect, useMemo } from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';
import {
  Easing,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useUnistyles } from 'react-native-unistyles';

const SIZE = 24;
const STROKE_WIDTH = 2;

const EASING = Easing.in(Easing.linear);
const DURATION = 1000;

interface LoaderProps {
  color?: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
  withoutBackground?: boolean;
}

const Loader = memo(({ color, size = SIZE, style, withoutBackground = false }: LoaderProps) => {
  const { theme } = useUnistyles();

  const progress = useSharedValue(0);

  const radius = size / 2 - STROKE_WIDTH / 2;
  const center = vec(size / 2, size / 2);
  const src = rect(0, 0, size, size);

  useEffect(() => {
    progress.set(withRepeat(withTiming(1, { duration: DURATION, easing: EASING }), -1, false));
  }, [progress]);

  const path = useMemo(() => {
    const skPath = Skia.Path.Make();
    skPath.addCircle(size / 2, size / 2, radius);

    return skPath;
  }, [radius, size]);

  const dst = useMemo(() => rect(0, 0, size, size), [size]);

  const transform = useDerivedValue(() => {
    const degrees = progress.value * 360;
    const rotate = (degrees * Math.PI) / 180;

    return [{ rotate }];
  });

  return (
    <Canvas style={[style, { height: size, width: size }]}>
      <Group transform={fitbox('contain', src, dst)}>
        {!withoutBackground && (
          <Circle
            c={center}
            color={color ?? theme.shared.loader.default}
            opacity={0.2}
            r={radius}
            strokeWidth={STROKE_WIDTH}
            // eslint-disable-next-line react/style-prop-object
            style="stroke"
          />
        )}

        <Path
          color={color ?? theme.shared.loader.default}
          end={0.6}
          origin={center}
          path={path}
          start={0}
          strokeCap="round"
          strokeWidth={STROKE_WIDTH}
          // eslint-disable-next-line react/style-prop-object
          style="stroke"
          transform={transform}
        />
      </Group>
    </Canvas>
  );
});

Loader.displayName = 'Loader';

export default Loader;
