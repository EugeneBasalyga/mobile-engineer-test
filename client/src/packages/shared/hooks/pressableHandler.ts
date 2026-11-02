import { type GestureResponderEvent } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';

interface PressableHandlerParams {
  onPress?: ((event: GestureResponderEvent) => void) | null;
  onPressIn?: ((event: GestureResponderEvent) => void) | null;
  onPressOut?: ((event: GestureResponderEvent) => void) | null;
}

export const usePressableHandler = ({
  onPress,
  onPressIn,
  onPressOut,
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
    onPress?.(event);
  };

  return { handlePress, handlePressIn, handlePressOut, pressed: isPressed };
};
