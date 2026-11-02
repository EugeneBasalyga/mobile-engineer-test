import {
  type ReanimatedKeyframe,
  type BaseAnimationBuilder,
  type EntryExitAnimationFunction,
} from 'react-native-reanimated';

export type EntryOrExitLayoutType =
  | BaseAnimationBuilder
  | typeof BaseAnimationBuilder
  | EntryExitAnimationFunction
  | ReanimatedKeyframe;
