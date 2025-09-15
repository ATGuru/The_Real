export const Colors: { [key: string]: string } = {
  background: '#0A0D12',
  surface: '#12171D',
  primary: '#00E6FF', // neon cyan
  secondary: '#2EC9FF', // electric blue
  assistant: '#00B3B3', // tech teal
  inceptionAssistant: '#7A3EFF', // purple-blue
  divider: '#2C3540', // inputs/dividers
  success: '#16A34A', // green for compatible
  error: '#DC2626', // red for not recommended/oversize
  muted: '#6B7280', // gray for incompatible
  placeholder: '#7a7a7a',
  textPrimary: '#FFFFFF',
  textMuted: '#9AA4AE',
};

export type ColorKeys = keyof typeof Colors;
