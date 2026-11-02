type Spacing =
  | 'none'
  | 'xxs'
  | 'xs'
  | 'sm'
  | 'md'
  | 'mdPlus'
  | 'lg'
  | 'xl'
  | 'xl2'
  | 'xl3'
  | 'xl4'
  | 'xl5'
  | 'xl6'
  | 'xl7'
  | 'xl8'
  | 'xl9'
  | 'xl10'
  | 'xl11';

const spacing = {
  lg: 12,
  md: 8,
  mdPlus: 10,
  none: 0,
  sm: 6,
  xl: 16,
  xl2: 20,
  xl3: 24,
  xl4: 32,
  xl5: 40,
  xl6: 48,
  xl7: 64,
  xl8: 80,
  xl9: 96,
  xl10: 128,
  xl11: 160,
  xs: 4,
  xxs: 2,
} as const satisfies Record<Spacing, number>;

export default spacing;
