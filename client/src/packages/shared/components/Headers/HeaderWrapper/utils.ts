import { HEADER_BASE_HEIGHT, HEADER_BASE_TOP_OFFSET } from './constants';

export const getHeaderTopOffset = (safeAreaTop: number | null) => {
  return safeAreaTop === null ? 0 : Math.max(safeAreaTop, HEADER_BASE_TOP_OFFSET);
};

export const getHeaderHeight = (safeAreaTop: number | null) => {
  return HEADER_BASE_HEIGHT + getHeaderTopOffset(safeAreaTop);
};
