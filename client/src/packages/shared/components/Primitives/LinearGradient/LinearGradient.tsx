import { useState, type FC, type ReactNode } from 'react';
import { View, type LayoutChangeEvent, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Defs, Rect, Stop, LinearGradient as SvgLinearGradient } from 'react-native-svg';
import { StyleSheet } from 'react-native-unistyles';

import { extractColorAndAlpha } from '@/packages/shared/utils/colorAlpha';

export interface LinearGradientStop {
  color: string;
  offset: number;
}

interface LinearGradientProps {
  colors: string[] | LinearGradientStop[];
  children?: ReactNode;
  end?: { x: number; y: number };
  start?: { x: number; y: number };
  style?: StyleProp<ViewStyle>;
}

const LinearGradient: FC<LinearGradientProps> = ({
  children,
  colors,
  end = { x: 0, y: 1 },
  start = { x: 0, y: 0 },
  style,
}) => {
  const [size, setSize] = useState({ height: 1, width: 1 });

  const handleLayout = (e: LayoutChangeEvent) => {
    const { height, width } = e.nativeEvent.layout;

    setSize({
      height: Math.max(1, height),
      width: Math.max(1, width),
    });
  };

  return (
    <View style={style} onLayout={handleLayout}>
      <Svg
        height="100%"
        pointerEvents="none"
        style={StyleSheet.absoluteFill}
        viewBox={`0 0 ${size.width} ${size.height}`}
        width="100%"
      >
        <Defs>
          <SvgLinearGradient id="grad" x1={start.x} x2={end.x} y1={start.y} y2={end.y}>
            {colors.map((colorItem, index) => {
              const { alpha, color } = extractColorAndAlpha(
                typeof colorItem === 'string' ? colorItem : colorItem.color
              );

              const offset = `${
                (typeof colorItem === 'string' ? index / (colors.length - 1) : colorItem.offset) *
                100
              }%`;

              return <Stop key={index} offset={offset} stopColor={color} stopOpacity={alpha} />;
            })}
          </SvgLinearGradient>
        </Defs>

        <Rect fill="url(#grad)" height="100%" width="100%" x="0" y="0" />
      </Svg>

      {children}
    </View>
  );
};

export default LinearGradient;
