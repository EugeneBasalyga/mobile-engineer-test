import { StyleSheet } from 'react-native-unistyles';

import colors from '@/packages/shared/theme/colors';
import fontFamilies from '@/packages/shared/theme/fontFamilies';
import gradients from '@/packages/shared/theme/gradients';
import radius from '@/packages/shared/theme/radius';
import spacing from '@/packages/shared/theme/spacing';
import sharedTheme from '@/packages/shared/theme/theme';
import typography from '@/packages/shared/theme/typography';
import { zIndex } from '@/packages/shared/theme/zIndex';

import appTheme from '@/app/theme/theme';

StyleSheet.configure({
  settings: {
    adaptiveThemes: false,
    initialTheme: 'primary',
  },
  themes: {
    primary: {
      app: appTheme,
      colors,
      fontFamilies,
      gradients,
      radius,
      shared: sharedTheme,
      spacing,
      typography,
      zIndex,
    },
  },
});
