import {
  ANIMATION_CONFIGS,
  BottomSheetModal,
  BottomSheetView,
  type BottomSheetBackdropProps,
  type BottomSheetProps,
} from '@gorhom/bottom-sheet';
import { useCallback, useEffect, useRef, type FC, type ReactNode } from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';
import { ReduceMotion } from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

import CustomBackdrop from './CustomBackdrop/CustomBackdrop';

export type BackdropPressBehavior = 'close' | 'none';

const animationConfigs = {
  ...ANIMATION_CONFIGS,
  reduceMotion: ReduceMotion.Never,
};

const styles = StyleSheet.create((theme) => ({
  background: {
    backgroundColor: theme.shared.bottomModal.background,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
  },
  handle: {
    paddingBottom: 16,
    paddingTop: 8,
  },
  handleIndicator: {
    backgroundColor: theme.shared.bottomModal.indicator,
    borderRadius: theme.radius.full,
    height: 4,
    width: 46,
  },
}));

export interface BottomModalProps {
  children: ReactNode;
  visible: boolean;
  accessibilityLabel?: string;
  backdropPressBehavior?: BackdropPressBehavior;
  backgroundStyle?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  enableContentPanningGesture?: boolean;
  enableDismissOnClose?: boolean;
  enableDynamicSizing?: boolean;
  enablePanDownToClose?: boolean;
  keyboardBehavior?: BottomSheetProps['keyboardBehavior'];
  onAnimate?: (fromIndex: number, toIndex: number) => void;
  onClose?: () => void;
}

const BottomModal: FC<BottomModalProps> = ({
  accessibilityLabel,
  backdropPressBehavior = 'close',
  backgroundStyle,
  children,
  contentStyle,
  enableContentPanningGesture = true,
  enableDismissOnClose = true,
  enableDynamicSizing = true,
  enablePanDownToClose = true,
  keyboardBehavior,
  onAnimate,
  onClose,
  visible,
}) => {
  const ref = useRef<BottomSheetModal | null>(null);

  useEffect(() => {
    if (visible) {
      ref.current?.present();
    } else {
      ref.current?.close();
    }
  }, [ref, visible]);

  const handleBackdropPress = useCallback(() => {
    if (backdropPressBehavior === 'close') {
      ref.current?.close();
    }
  }, [backdropPressBehavior]);

  const renderBackdrop = useCallback(
    ({ animatedIndex, style }: BottomSheetBackdropProps) => {
      return (
        <CustomBackdrop animatedIndex={animatedIndex} style={style} onPress={handleBackdropPress} />
      );
    },
    [handleBackdropPress]
  );

  return (
    <BottomSheetModal
      ref={ref}
      accessible={false}
      android_keyboardInputMode="adjustResize"
      animationConfigs={animationConfigs}
      backdropComponent={renderBackdrop}
      backgroundStyle={[styles.background, backgroundStyle]}
      enableContentPanningGesture={enableContentPanningGesture}
      enableDismissOnClose={enableDismissOnClose}
      enableDynamicSizing={enableDynamicSizing}
      enablePanDownToClose={enablePanDownToClose}
      handleIndicatorStyle={styles.handleIndicator}
      handleStyle={styles.handle}
      index={0}
      // According to windowSoftInputMode in AndroidManifest for android:
      // keyboardBehavior="extend" with adjustPan
      // keyboardBehavior="interactive" with adjustResize
      // for ios always keyboardBehavior="extend"
      keyboardBehavior={keyboardBehavior ?? 'interactive'}
      keyboardBlurBehavior="restore"
      onAnimate={onAnimate}
      onDismiss={onClose}
    >
      <BottomSheetView
        accessibilityLabel={accessibilityLabel}
        accessible={!!accessibilityLabel}
        style={contentStyle}
      >
        {children}
      </BottomSheetView>
    </BottomSheetModal>
  );
};

export default BottomModal;
