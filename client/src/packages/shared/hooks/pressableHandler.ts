import { type GestureResponderEvent } from 'react-native';
import { HapticFeedbackTypes } from 'react-native-haptic-feedback';
import { useSharedValue } from 'react-native-reanimated';

import { triggerHaptic } from '@/packages/shared/utils/haptic';

interface PressableHandlerParams {
  onPress?: ((event: GestureResponderEvent) => void) | null;
  onPressIn?: ((event: GestureResponderEvent) => void) | null;
  onPressOut?: ((event: GestureResponderEvent) => void) | null;
  withHapticFeedback?: boolean;
}

export const usePressableHandler = ({
  onPress,
  onPressIn,
  onPressOut,
  withHapticFeedback = true,
}: PressableHandlerParams = {}) => {
  const isPressed = useSharedValue(false);

  const handlePressIn = (event: GestureResponderEvent) => {
    isPressed.set(true);

    onPressIn?.(event);
  };

  const handlePressOut = (event: GestureResponderEvent) => {
    isPressed.set(false);

    onPressOut?.(event);
  };

  const handlePress = (event: GestureResponderEvent) => {
    if (withHapticFeedback) {
      triggerHaptic(HapticFeedbackTypes.clockTick);
    }

    onPress?.(event);
  };

  return { handlePress, handlePressIn, handlePressOut, pressed: isPressed };
};
