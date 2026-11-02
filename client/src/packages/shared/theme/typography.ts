import { type TextStyle } from 'react-native';

import fontFamilies from './fontFamilies';

interface FontStyle extends Pick<
  TextStyle,
  'fontFamily' | 'fontSize' | 'lineHeight' | 'textTransform'
> {}

type Heading = 'h1' | 'h2' | 'h3' | 'h4' | 'h5';

type HeadingVariants = 'medium' | 'regular';

type Body = 'xl' | 'l' | 'm' | 's';

type BodyVariants = 'medium' | 'regular' | 'bold' | 'semiBold';

type Captions = 'm' | 's';

type CaptionsVariants = 'medium' | 'regular' | 'bold' | 'mediumCaps' | 'regularCaps' | 'boldCaps';

const typography = {
  body: {
    l: {
      bold: {
        fontFamily: fontFamilies.Inter.bold.default,
        fontSize: 18,
        lineHeight: 28,
      },
      medium: {
        fontFamily: fontFamilies.Inter.medium.default,
        fontSize: 18,
        lineHeight: 28,
      },
      regular: {
        fontFamily: fontFamilies.Inter.regular.default,
        fontSize: 18,
        lineHeight: 28,
      },
      semiBold: {
        fontFamily: fontFamilies.Inter.semiBold.default,
        fontSize: 18,
        lineHeight: 28,
      },
    },
    m: {
      bold: {
        fontFamily: fontFamilies.Inter.bold.default,
        fontSize: 16,
        lineHeight: 25,
      },
      medium: {
        fontFamily: fontFamilies.Inter.medium.default,
        fontSize: 16,
        lineHeight: 25,
      },
      regular: {
        fontFamily: fontFamilies.Inter.regular.default,
        fontSize: 16,
        lineHeight: 25,
      },
      semiBold: {
        fontFamily: fontFamilies.Inter.semiBold.default,
        fontSize: 16,
        lineHeight: 25,
      },
    },
    s: {
      bold: {
        fontFamily: fontFamilies.Inter.bold.default,
        fontSize: 14,
        lineHeight: 22,
      },
      medium: {
        fontFamily: fontFamilies.Inter.medium.default,
        fontSize: 14,
        lineHeight: 22,
      },
      regular: {
        fontFamily: fontFamilies.Inter.regular.default,
        fontSize: 14,
        lineHeight: 22,
      },
      semiBold: {
        fontFamily: fontFamilies.Inter.semiBold.default,
        fontSize: 14,
        lineHeight: 22,
      },
    },
    xl: {
      bold: {
        fontFamily: fontFamilies.Inter.bold.default,
        fontSize: 20,
        lineHeight: 32,
      },
      medium: {
        fontFamily: fontFamilies.Inter.medium.default,
        fontSize: 20,
        lineHeight: 32,
      },
      regular: {
        fontFamily: fontFamilies.Inter.regular.default,
        fontSize: 20,
        lineHeight: 32,
      },
      semiBold: {
        fontFamily: fontFamilies.Inter.semiBold.default,
        fontSize: 20,
        lineHeight: 32,
      },
    },
  } as const satisfies Record<Body, Record<BodyVariants, FontStyle>>,
  captions: {
    m: {
      bold: {
        fontFamily: fontFamilies.Inter.bold.default,
        fontSize: 12,
        lineHeight: 19,
      },
      boldCaps: {
        fontFamily: fontFamilies.Inter.bold.default,
        fontSize: 12,
        lineHeight: 19,
        textTransform: 'uppercase',
      },
      medium: {
        fontFamily: fontFamilies.Inter.medium.default,
        fontSize: 12,
        lineHeight: 19,
      },
      mediumCaps: {
        fontFamily: fontFamilies.Inter.medium.default,
        fontSize: 12,
        lineHeight: 19,
        textTransform: 'uppercase',
      },
      regular: {
        fontFamily: fontFamilies.Inter.regular.default,
        fontSize: 12,
        lineHeight: 19,
      },
      regularCaps: {
        fontFamily: fontFamilies.Inter.regular.default,
        fontSize: 12,
        lineHeight: 19,
        textTransform: 'uppercase',
      },
    },
    s: {
      bold: {
        fontFamily: fontFamilies.Inter.bold.default,
        fontSize: 10,
        lineHeight: 16,
      },
      boldCaps: {
        fontFamily: fontFamilies.Inter.bold.default,
        fontSize: 10,
        lineHeight: 16,
        textTransform: 'uppercase',
      },
      medium: {
        fontFamily: fontFamilies.Inter.medium.default,
        fontSize: 10,
        lineHeight: 16,
      },
      mediumCaps: {
        fontFamily: fontFamilies.Inter.medium.default,
        fontSize: 10,
        lineHeight: 16,
        textTransform: 'uppercase',
      },
      regular: {
        fontFamily: fontFamilies.Inter.regular.default,
        fontSize: 10,
        lineHeight: 16,
      },
      regularCaps: {
        fontFamily: fontFamilies.Inter.regular.default,
        fontSize: 10,
        lineHeight: 16,
        textTransform: 'uppercase',
      },
    },
  } as const satisfies Record<Captions, Record<CaptionsVariants, FontStyle>>,
  heading: {
    h1: {
      medium: {
        fontFamily: fontFamilies.Inter.medium.default,
        fontSize: 32,
        lineHeight: 44,
      },
      regular: {
        fontFamily: fontFamilies.Inter.regular.default,
        fontSize: 32,
        lineHeight: 44,
      },
    },
    h2: {
      medium: {
        fontFamily: fontFamilies.Inter.medium.default,
        fontSize: 28,
        lineHeight: 39,
      },
      regular: {
        fontFamily: fontFamilies.Inter.regular.default,
        fontSize: 28,
        lineHeight: 39,
      },
    },
    h3: {
      medium: {
        fontFamily: fontFamilies.Inter.medium.default,
        fontSize: 24,
        lineHeight: 34,
      },
      regular: {
        fontFamily: fontFamilies.Inter.regular.default,
        fontSize: 24,
        lineHeight: 34,
      },
    },
    h4: {
      medium: {
        fontFamily: fontFamilies.Inter.medium.default,
        fontSize: 20,
        lineHeight: 28,
      },
      regular: {
        fontFamily: fontFamilies.Inter.regular.default,
        fontSize: 20,
        lineHeight: 28,
      },
    },
    h5: {
      medium: {
        fontFamily: fontFamilies.Inter.medium.default,
        fontSize: 18,
        lineHeight: 26,
      },
      regular: {
        fontFamily: fontFamilies.Inter.regular.default,
        fontSize: 18,
        lineHeight: 26,
      },
    },
  } as const satisfies Record<Heading, Record<HeadingVariants, FontStyle>>,
} as const;

export default typography;
