import Toast from 'react-native-toast-message';

import { HAPTIC_TYPE } from '@/packages/shared/constants/haptic';
import { ToastTypes } from '@/packages/shared/constants/toast';

import { triggerHaptic } from './haptic';

export const showToast = (type: ToastTypes, message: string) => {
  switch (type) {
    case ToastTypes.Error:
      triggerHaptic(HAPTIC_TYPE.ERROR);
      break;
    default:
      break;
  }

  Toast.show({
    position: 'top',
    props: {
      text: message,
    },
    topOffset: 0,
    type,
    visibilityTime: 5000,
  });
};
