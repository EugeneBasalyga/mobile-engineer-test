import { StyleSheet } from 'react-native-unistyles';

import colors from '@/packages/shared/theme/colors';
import fontFamilies from '@/packages/shared/theme/fontFamilies';
import radius from '@/packages/shared/theme/radius';
import spacing from '@/packages/shared/theme/spacing';
import sharedTheme from '@/packages/shared/theme/theme';
import typography from '@/packages/shared/theme/typography';

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
      radius,
      shared: sharedTheme,
      spacing,
      typography,
    },
  },
});
