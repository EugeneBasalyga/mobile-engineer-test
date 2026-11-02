const normalizeColor = (color: string): string => {
  'worklet';

  const value = color.replace('#', '').toLowerCase();

  if (value.length === 3 || value.length === 4) {
    return value
      .split('')
      .map((char) => char + char)
      .join('');
  }

  return value;
};

export const extractColorAndAlpha = (hex: string): { alpha: number; color: string } => {
  'worklet';

  const value = normalizeColor(hex);

  if (value.length === 6) {
    return { alpha: 1, color: `#${value}` };
  }

  const color = value.slice(0, 6);
  const alphaHex = value.slice(6, 8);

  const alpha = alphaHex ? parseInt(alphaHex, 16) / 0xff : 1;

  return { alpha, color: `#${color}` };
};

export const getColorAlpha = (hex: string, opacity = 1): string => {
  'worklet';

  const color = normalizeColor(hex).slice(0, 6);

  const alpha = Math.floor(0xff * opacity)
    .toString(16)
    .padStart(2, '0');

  return `#${color}${alpha}`;
};
