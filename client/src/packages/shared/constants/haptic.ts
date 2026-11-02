import { HapticFeedbackTypes } from 'react-native-haptic-feedback';

export const HAPTIC_TYPE: Record<string, HapticFeedbackTypes> = {
  ERROR: HapticFeedbackTypes.notificationError,
  LIGHT: HapticFeedbackTypes.impactLight,
  MEDIUM: HapticFeedbackTypes.impactMedium,
  RIGID: HapticFeedbackTypes.rigid,
  SUCCESS: HapticFeedbackTypes.notificationSuccess,
  WARNING: HapticFeedbackTypes.notificationWarning,
};
