import { Easing, type WithTimingConfig } from 'react-native-reanimated';

import { type ButtonSize } from './types';

export const BUTTON_ANIMATION_CONFIG = {
  duration: 150,
  easing: Easing.inOut(Easing.ease),
} satisfies WithTimingConfig;

export const BUTTON_SIZE: Record<ButtonSize, number> = {
  extraSmall: 36,
  large: 52,
  medium: 48,
  small: 40,
};
