export type ButtonThemeState = 'default' | 'disabled' | 'loading' | 'pressed';

export interface ButtonTheme {
  background:
    | Record<ButtonThemeState, string>
    | Record<ButtonThemeState, readonly [string, string]>;
  content: Record<ButtonThemeState, string>;
}

export type ButtonSize = 'large' | 'medium' | 'small' | 'extraSmall';
