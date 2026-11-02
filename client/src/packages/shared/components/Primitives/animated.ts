import BlurView from '@sbaiahmed1/react-native-blur';
import { Pressable } from 'react-native';
import Animated from 'react-native-reanimated';

export const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);
