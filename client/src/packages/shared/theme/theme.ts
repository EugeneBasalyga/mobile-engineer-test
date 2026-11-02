import { type ButtonTheme, type ButtonVariant } from '@/packages/shared/components';

import colors from './colors';

const theme = {
  border: colors.beige,
  button: {
    variants: {
      danger: {
        background: {
          default: colors.red100,
          disabled: colors.red30,
          loading: colors.red100,
          pressed: colors.red200,
        },
        content: {
          default: colors.white,
          disabled: colors.white,
          loading: colors.white,
          pressed: colors.white,
        },
      },
      primary: {
        background: {
          default: colors.teal100,
          disabled: colors.teal30,
          loading: colors.teal100,
          pressed: colors.teal200,
        },
        content: {
          default: colors.white,
          disabled: colors.white,
          loading: colors.white,
          pressed: colors.white,
        },
      },
      secondary: {
        background: {
          default: colors.white,
          disabled: colors.white,
          loading: colors.white,
          pressed: colors.white,
        },
        content: {
          default: colors.blue200,
          disabled: colors.blue30,
          loading: colors.blue200,
          pressed: colors.blue100,
        },
      },
    } as const satisfies Record<ButtonVariant, ButtonTheme>,
  },
  loader: {
    default: colors.teal100,
  },
  notice: {
    background: colors.beige,
  },
  text: {
    primary: colors.blue100,
    secondary: colors.blue70,
  },
};

export default theme;
