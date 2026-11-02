import { memo, useCallback } from 'react';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { Check } from '@/packages/shared/assets/icons';
import Input, { type InputProps } from '@/packages/shared/components/Inputs/Input';

export interface SearchInputProps extends Omit<InputProps, 'renderLeftContent'> {}

const styles = StyleSheet.create((theme) => {
  return {
    icon: {
      marginLeft: theme.spacing.lg,
      marginVertical: theme.spacing.mdPlus,
    },
  };
});

const SearchInput = memo(
  ({
    dataDetectorTypes = 'lookupSuggestion',
    keyboardType = 'web-search',
    returnKeyType = 'search',
    size = 'small',
    ...props
  }: SearchInputProps) => {
    const { theme } = useUnistyles();

    const renderLeftContent = useCallback(() => {
      return <Check color={theme.shared.inputs.searchInput.icon} style={styles.icon} />;
    }, [theme.shared.inputs.searchInput.icon]);

    return (
      <Input
        dataDetectorTypes={dataDetectorTypes}
        keyboardType={keyboardType}
        renderLeftContent={renderLeftContent}
        returnKeyType={returnKeyType}
        size={size}
        {...props}
      />
    );
  }
);

SearchInput.displayName = 'SearchInput';

export default SearchInput;
