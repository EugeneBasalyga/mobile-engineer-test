import { Pressable, Text as RNText } from 'react-native';

export type ButtonVariant = 'danger' | 'primary' | 'secondary';

export const Text = RNText;

export const Loader = () => null;

export const Button = ({ onPress, title }: { onPress?: () => void; title?: string }) => (
  <Pressable onPress={onPress}>
    <RNText>{title}</RNText>
  </Pressable>
);
