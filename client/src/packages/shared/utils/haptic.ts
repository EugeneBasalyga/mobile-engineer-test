import ReactNativeHapticFeedback, { type HapticFeedbackTypes } from 'react-native-haptic-feedback';

import { HAPTIC_TYPE } from '@/packages/shared/constants/haptic';

export const triggerHaptic = (type: HapticFeedbackTypes = HAPTIC_TYPE.RIGID) => {
  ReactNativeHapticFeedback.trigger(type, { enableVibrateFallback: true });
};
