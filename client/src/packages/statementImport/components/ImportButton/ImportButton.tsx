import { memo } from 'react';

import { Button, type ButtonVariant } from '@/packages/shared/components';

interface ImportButtonProps {
  onPress: () => void;
  title: string;
  disabled?: boolean;
  variant?: ButtonVariant;
}

const ImportButton = memo(
  ({ disabled = false, onPress, title, variant = 'secondary' }: ImportButtonProps) => {
    return <Button disabled={disabled} title={title} variant={variant} onPress={onPress} />;
  }
);

ImportButton.displayName = 'ImportButton';

export default ImportButton;
