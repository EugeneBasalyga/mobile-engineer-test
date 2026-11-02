// import { getColorAlpha } from '@/packages/shared/utils/colorAlpha';

import colors from './colors';

const gradients = {
  g01: [colors.gradient1_1, colors.gradient1_2],
  // g03: [colors.gradient2, getColorAlpha(colors.gradient2, 0)],
} as const;

export default gradients;
