import { type FC } from 'react';
import { createAnimatedComponent, type AnimatedProps } from 'react-native-reanimated';
import { type SvgProps } from 'react-native-svg';

const ANIMATED_ICONS_MAP = new Map<FC<SvgProps>, FC<AnimatedProps<SvgProps>>>();

export const getAnimatedIcon = (Icon: FC<SvgProps>): FC<AnimatedProps<SvgProps>> => {
  if (ANIMATED_ICONS_MAP.has(Icon)) {
    return ANIMATED_ICONS_MAP.get(Icon)!;
  }

  const AnimatedIcon = createAnimatedComponent(Icon) as FC<AnimatedProps<SvgProps>>;

  ANIMATED_ICONS_MAP.set(Icon, AnimatedIcon);

  return AnimatedIcon;
};
