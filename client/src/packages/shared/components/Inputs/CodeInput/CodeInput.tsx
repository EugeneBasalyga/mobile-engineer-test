import { times } from 'lodash';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
  type AccessibilityProps,
  Pressable,
  type StyleProp,
  TextInput,
  View,
  type ViewStyle,
} from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import Item from './Item';

const styles = StyleSheet.create(() => ({
  content: {
    columnGap: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minWidth: 284,
  },
  root: {
    justifyContent: 'center',
  },
  textInput: {
    bottom: 0,
    left: 0,
    opacity: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 10,
  },
}));

interface CodeProps extends AccessibilityProps {
  onChange: (value: string) => void;
  value: string;
  length?: number;
  style?: StyleProp<ViewStyle>;
}

const CodeInput = memo(
  ({
    accessibilityHint,
    accessibilityLabel,
    accessibilityRole = 'text',
    length = 6,
    onChange,
    style,
    value,
  }: CodeProps) => {
    const inputRef = useRef<TextInput>(null);

    const [focused, setFocused] = useState(false);

    useEffect(() => {
      const timeout = setTimeout(() => {
        inputRef.current?.focus();
      }, 300);

      return () => clearTimeout(timeout);
    }, []);

    const handleTextChange = useCallback(
      (text: string) => {
        if (text.length > length) {
          onChange(text.substring(0, length));

          return;
        }

        onChange(text);
      },
      [onChange, length]
    );

    const handleFocusPress = useCallback(() => {
      inputRef.current?.focus();
    }, []);

    const handleFocus = useCallback(() => {
      setFocused(true);
    }, []);

    const handleBlur = useCallback(() => {
      setFocused(false);
    }, []);

    return (
      <View style={[styles.root, style]}>
        <Pressable
          accessibilityHint={accessibilityHint}
          accessibilityLabel={accessibilityLabel}
          accessibilityRole={accessibilityRole}
          accessibilityValue={{ text: value }}
          style={styles.content}
          onPress={handleFocusPress}
        >
          {times(length, (index) => {
            const isLastFilled = index === value.length - 1;
            const itemFocused = focused && index === value.length;

            return (
              <Item
                key={index}
                focused={itemFocused}
                isLastFilled={isLastFilled}
                value={value[index]}
              />
            );
          })}

          <View style={styles.textInput}>
            <TextInput
              ref={inputRef}
              caretHidden
              collapsable={false}
              keyboardType="decimal-pad"
              spellCheck={false}
              value={value}
              onBlur={handleBlur}
              onChangeText={handleTextChange}
              onFocus={handleFocus}
            />
          </View>
        </Pressable>
      </View>
    );
  }
);

CodeInput.displayName = 'CodeInput';

export default CodeInput;
