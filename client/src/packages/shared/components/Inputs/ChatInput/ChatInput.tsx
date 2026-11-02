import { memo, useCallback } from 'react';
import { StyleSheet } from 'react-native-unistyles';

import { Check } from '@/packages/shared/assets/icons';
import { Button } from '@/packages/shared/components/Buttons';
import Input, { type InputProps } from '@/packages/shared/components/Inputs/Input';

export interface ChatInputProps extends Omit<InputProps, 'renderRightContent'> {
  onSubmitEditing?: () => void;
}

const styles = StyleSheet.create((theme) => {
  return {
    button: {
      paddingHorizontal: theme.spacing.xl,
    },
  };
});

const ChatInput = memo(
  ({
    editable,
    errorText,
    onSubmitEditing,
    returnKeyType = 'send',
    size = 'small',
    variant = 'secondary',
    ...props
  }: ChatInputProps) => {
    const hideButton = !editable || !!errorText;

    const renderRightContent = useCallback(() => {
      if (hideButton) {
        return null;
      }

      return (
        <Button IconLeft={Check} size={size} style={styles.button} onPress={onSubmitEditing} />
      );
    }, [hideButton, size, onSubmitEditing]);

    return (
      <Input
        editable={editable}
        errorText={errorText}
        renderRightContent={renderRightContent}
        returnKeyType={returnKeyType}
        size={size}
        variant={variant}
        onSubmitEditing={onSubmitEditing}
        {...props}
      />
    );
  }
);

ChatInput.displayName = 'ChatInput';

export default ChatInput;
