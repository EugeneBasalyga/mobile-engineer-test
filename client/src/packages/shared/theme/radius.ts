type Radius = 'none' | 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xl2' | 'xl3' | 'xl4' | 'full';

const radius = {
  full: 9999,
  lg: 10,
  md: 8,
  none: 0,
  sm: 6,
  xl: 12,
  xl2: 16,
  xl3: 20,
  xl4: 24,
  xs: 4,
  xxs: 2,
} as const satisfies Record<Radius, number>;

export default radius;
