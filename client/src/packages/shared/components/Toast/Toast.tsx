import { type FC, memo, useCallback } from 'react';
import { Pressable, View } from 'react-native';
import { type SvgProps } from 'react-native-svg';
import Toast, { type ToastConfigParams } from 'react-native-toast-message';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { Check } from '@/packages/shared/assets/icons';
import { Text } from '@/packages/shared/components';
import { ToastTypes } from '@/packages/shared/constants/toast';

const styles = StyleSheet.create((theme, runtime) => ({
  icon: {
    marginVertical: theme.spacing.xxs,
  },
  root: {
    alignSelf: 'center',
    paddingHorizontal: theme.spacing.xl6,
    paddingTop: runtime.insets.top + theme.spacing.md,
  },
  text: {
    color: theme.shared.toast.text,
    ...theme.typography.body.m.medium,
  },
  toast: {
    backgroundColor: theme.shared.toast.background,
    borderRadius: 22,
    columnGap: theme.spacing.sm,
    flexDirection: 'row',
    justifyContent: 'center',
    minHeight: 44,
    paddingLeft: theme.spacing.xl,
    paddingRight: theme.spacing.xl3,
    paddingVertical: theme.spacing.mdPlus,
  },
}));

interface ToastComponentProps {
  type: ToastTypes;
  text?: string;
}

const ICONS_MAP: Record<ToastTypes, FC<SvgProps>> = {
  [ToastTypes.Success]: Check,
  [ToastTypes.Error]: Check,
};

const ToastComponent = memo(({ text = '', type }: ToastComponentProps) => {
  const { theme } = useUnistyles();

  const Icon = ICONS_MAP[type];

  const handlePress = useCallback(() => {
    Toast.hide();
  }, []);

  return (
    <View pointerEvents="box-none" style={styles.root}>
      <Pressable style={styles.toast} onPress={handlePress}>
        <Icon color={theme.shared.toast.icon} height={20} style={styles.icon} width={20} />

        <Text style={styles.text}>{text}</Text>
      </Pressable>
    </View>
  );
});

ToastComponent.displayName = 'Toast';

interface CustomToastProps {
  text: string;
}

const toastConfig = {
  [ToastTypes.Error]: ({ props }: ToastConfigParams<CustomToastProps>) => (
    <ToastComponent text={props.text} type={ToastTypes.Error} />
  ),
  [ToastTypes.Success]: ({ props }: ToastConfigParams<CustomToastProps>) => (
    <ToastComponent text={props.text} type={ToastTypes.Success} />
  ),
};

const CustomToast: FC = () => {
  return <Toast config={toastConfig} />;
};

CustomToast.displayName = 'CustomToast';

export default CustomToast;
