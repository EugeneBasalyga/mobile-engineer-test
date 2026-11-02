import {
  type BgBlurSize,
  type ButtonTheme,
  type ButtonVariant,
  type HeaderBlurSize,
  type IconButtonVariant,
  type LinearGradientStop,
  type SocialButtonVariant,
} from '@/packages/shared/components';
import { getColorAlpha } from '@/packages/shared/utils/colorAlpha';

import colors from './colors';
import gradients from './gradients';

const theme = {
  bgBlur: {
    l: [getColorAlpha(colors.neutral50, 0), getColorAlpha(colors.neutral50, 1)],
    m: [getColorAlpha(colors.neutral200, 0), getColorAlpha(colors.neutral200, 1)],
  } as const satisfies Record<BgBlurSize, string[]>,
  bottomModal: {
    backdrop: colors.domain900,
    background: colors.neutral200,
    indicator: colors.neutral500,
  },
  button: {
    iconVariant: {
      primary: {
        background: {
          default: gradients.g01,
          disabled: [colors.neutral300, colors.neutral300],
          loading: gradients.g01,
          pressed: [colors.domain900, colors.domain800],
        },
        content: {
          default: colors.neutral50,
          disabled: colors.neutral600,
          loading: colors.neutral50,
          pressed: colors.neutral50,
        },
      },
      secondary: {
        background: {
          default: colors.neutral50,
          disabled: colors.neutral50,
          loading: colors.neutral50,
          pressed: getColorAlpha(colors.neutral50, 0.75),
        },
        content: {
          default: colors.domain900,
          disabled: colors.neutral600,
          loading: colors.domain900,
          pressed: colors.domain900,
        },
      },
    } as const satisfies Record<IconButtonVariant, ButtonTheme>,
    socialVariant: {
      primary: {
        background: {
          default: getColorAlpha(colors.neutral50, 0.1),
          disabled: getColorAlpha(colors.neutral50, 0.1),
          loading: getColorAlpha(colors.neutral50, 0.1),
          pressed: getColorAlpha(colors.neutral50, 0.15),
        },
        content: {
          default: colors.neutral50,
          disabled: getColorAlpha(colors.neutral50, 0.6),
          loading: colors.neutral50,
          pressed: colors.neutral50,
        },
      },
      secondary: {
        background: {
          default: colors.neutral50,
          disabled: colors.neutral50,
          loading: colors.neutral50,
          pressed: getColorAlpha(colors.neutral50, 0.75),
        },
        content: {
          default: colors.neutral950,
          disabled: colors.neutral600,
          loading: colors.neutral950,
          pressed: colors.neutral950,
        },
      },
    } as const satisfies Record<SocialButtonVariant, ButtonTheme>,
    variants: {
      bare: {
        background: {
          default: colors.transparent,
          disabled: colors.transparent,
          loading: colors.transparent,
          pressed: colors.transparent,
        },
        content: {
          default: colors.domain900,
          disabled: colors.neutral600,
          loading: colors.domain900,
          pressed: colors.domain700,
        },
      },
      bareSecondary: {
        background: {
          default: colors.transparent,
          disabled: colors.transparent,
          loading: colors.transparent,
          pressed: colors.transparent,
        },
        content: {
          default: colors.neutral50,
          disabled: getColorAlpha(colors.neutral50, 0.5),
          loading: colors.neutral50,
          pressed: getColorAlpha(colors.neutral50, 0.75),
        },
      },
      primary: {
        background: {
          default: gradients.g01,
          disabled: [colors.neutral300, colors.neutral300],
          loading: gradients.g01,
          pressed: [colors.domain900, colors.domain800],
        },
        content: {
          default: colors.neutral50,
          disabled: colors.neutral600,
          loading: colors.neutral50,
          pressed: colors.neutral50,
        },
      },
      secondary: {
        background: {
          default: colors.neutral50,
          disabled: colors.neutral50,
          loading: colors.neutral50,
          pressed: getColorAlpha(colors.neutral50, 0.75),
        },
        content: {
          default: colors.domain900,
          disabled: colors.neutral600,
          loading: colors.basicRed500,
          pressed: colors.domain900,
        },
      },
    } as const satisfies Record<ButtonVariant, ButtonTheme>,
  },
  checkbox: {
    checked: colors.basicRed500,
    default: colors.neutral500,
    icon: colors.neutral50,
  },
  divider: {
    background: colors.neutral200,
  },
  header: {
    button: {
      background: {
        default: colors.neutral50,
        disabled: colors.neutral50,
        loading: colors.neutral50,
        pressed: getColorAlpha(colors.neutral50, 0.75),
      },
      content: {
        default: colors.domain900,
        disabled: colors.neutral600,
        loading: colors.domain900,
        pressed: colors.domain900,
      },
    } as const satisfies ButtonTheme,
  },
  headerBlur: {
    l: [
      {
        color: getColorAlpha(colors.domain100, 1),
        offset: 0,
      },
      {
        color: getColorAlpha(colors.neutral50, 0.25),
        offset: 0.69,
      },
      {
        color: getColorAlpha(colors.neutral50, 0),
        offset: 1,
      },
    ],
    lAlt: [
      {
        color: getColorAlpha(colors.neutral50, 1),
        offset: 0,
      },
      {
        color: getColorAlpha(colors.neutral50, 0.25),
        offset: 0.69,
      },
      {
        color: getColorAlpha(colors.neutral50, 0),
        offset: 1,
      },
    ],
    m: [getColorAlpha(colors.domain100, 0.8), getColorAlpha(colors.neutral200, 0)],
  } satisfies Record<HeaderBlurSize, string[] | LinearGradientStop[]>,
  icon: {
    primary: colors.neutral50,
  },
  inputs: {
    code: {
      background: {
        default: getColorAlpha(colors.neutral50, 0.75),
        filled: colors.basicRed50,
        filledLast: colors.neutral50,
        focused: colors.neutral50,
      },
      cursor: colors.basicRed500,
      text: {
        default: colors.basicRed500,
        last: colors.domain900,
      },
    },
    input: {
      variants: {
        primary: {
          background: {
            default: colors.neutral50,
            disabled: colors.neutral100,
            error: colors.basicRed50,
          },
          border: {
            default: colors.transparentLight,
            disabled: colors.transparentLight,
            error: colors.basicRed300,
          },
          cursor: colors.basicRed500,
          error: colors.basicRed500,
          placeholder: colors.neutral600,
          text: colors.neutral950,
        },
        secondary: {
          background: {
            default: colors.neutral200,
            disabled: colors.neutral100,
            error: colors.basicRed50,
          },
          border: {
            default: colors.transparentLight,
            disabled: colors.transparentLight,
            error: colors.basicRed300,
          },
          cursor: colors.basicRed500,
          error: colors.basicRed500,
          placeholder: colors.neutral600,
          text: colors.neutral950,
        },
      },
    },
    searchInput: {
      icon: colors.neutral500,
    },
  },
  loader: {
    default: colors.neutral50,
  },
  pageControl: {
    active: colors.neutral50,
    inactive: getColorAlpha(colors.neutral50, 0.25),
  },
  text: {
    primary: colors.neutral950,
  },
  toast: {
    background: colors.domain950,
    icon: colors.neutral50,
    text: colors.neutral50,
  },
};

export default theme;
