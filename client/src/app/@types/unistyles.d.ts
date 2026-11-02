import type colors from '@/packages/shared/theme/colors';
import type fontFamilies from '@/packages/shared/theme/fontFamilies';
import type gradients from '@/packages/shared/theme/gradients';
import type radius from '@/packages/shared/theme/radius';
import type spacing from '@/packages/shared/theme/spacing';
import type sharedTheme from '@/packages/shared/theme/theme';
import type typography from '@/packages/shared/theme/typography';
import { type zIndex } from '@/packages/shared/theme/zIndex';

import type appTheme from '@/app/theme/theme';

type AppThemes = {
  primary: {
    app: typeof appTheme;
    colors: typeof colors;
    fontFamilies: typeof fontFamilies;
    gradients: typeof gradients;
    radius: typeof radius;
    shared: typeof sharedTheme;
    spacing: typeof spacing;
    typography: typeof typography;
    zIndex: typeof zIndex;
  };
};

declare module 'react-native-unistyles' {
  export interface UnistylesThemes extends AppThemes {}
}
