/**
 * content - content that is not fixed and can be scrolled
 * static - fixed content (for example% headers or fixed buttons with bg)
 * underStatic - content that is under fixed content(for example: BgBlur, HeaderBlur, ButtonBgContainer)
 */
export const zIndex = {
  content: 1,
  static: 100,
  underStatic: 90,
} as const;
