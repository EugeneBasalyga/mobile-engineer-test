import { Pressable, Text as RNText } from 'react-native';

// The shared kit needs Skia, Reanimated and Unistyles natives. These tests check which truth the
// status screen tells, so only its text and actions have to render.
export type ButtonVariant = 'primary' | 'secondary' | 'bare' | 'bareSecondary';

export const Text = RNText;

export const Loader = () => null;

export const Button = ({ onPress, title }: { onPress?: () => void; title?: string }) => (
  <Pressable onPress={onPress}>
    <RNText>{title}</RNText>
  </Pressable>
);
