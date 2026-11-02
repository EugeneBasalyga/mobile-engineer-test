type FontWeight =
  | 'thin'
  | 'extraLight'
  | 'light'
  | 'regular'
  | 'medium'
  | 'semiBold'
  | 'bold'
  | 'extraBold'
  | 'black';

type FontFamily = 'Inter';

type FontStyle = 'default' | 'italic';

const fontFamiliesNames = {
  Inter: 'Inter',
} as const satisfies Record<FontFamily, string>;

const fontWeightNames = {
  black: 'Black',
  bold: 'Bold',
  extraBold: 'ExtraBold',
  extraLight: 'ExtraLight',
  light: 'Light',
  medium: 'Medium',
  regular: 'Regular',
  semiBold: 'SemiBold',
  thin: 'Thin',
} as const satisfies Record<FontWeight, string>;

// const fontStyleNames = {
//   italic: 'Italic',
// } as const satisfies Record<Exclude<FontStyle, 'default'>, string>;

const fontFamilies = {
  Inter: {
    black: {
      default: `${fontFamiliesNames.Inter}-${fontWeightNames.black}`,
    },
    bold: {
      default: `${fontFamiliesNames.Inter}-${fontWeightNames.bold}`,
      // italic: `${fontFamiliesNames.Inter} ${fontWeightNames.bold} ${fontStyleNames.italic}`,
    },
    extraBold: {
      default: `${fontFamiliesNames.Inter}-${fontWeightNames.extraBold}`,
    },
    extraLight: {
      default: `${fontFamiliesNames.Inter}-${fontWeightNames.extraLight}`,
    },
    light: {
      default: `${fontFamiliesNames.Inter}-${fontWeightNames.light}`,
    },
    medium: {
      default: `${fontFamiliesNames.Inter}-${fontWeightNames.medium}`,
    },
    regular: {
      default: `${fontFamiliesNames.Inter}-${fontWeightNames.regular}`,
    },
    semiBold: {
      default: `${fontFamiliesNames.Inter}-${fontWeightNames.semiBold}`,
    },
    thin: {
      default: `${fontFamiliesNames.Inter}-${fontWeightNames.thin}`,
    },
  },
} as const satisfies Record<
  FontFamily,
  Record<FontWeight, Record<Extract<FontStyle, 'default'>, string>>
>;

export default fontFamilies;
