export const Colors = {
  background: '#0A0D12',
  surface: '#12171D',
  primary: '#00E6FF', // neon cyan
  secondary: '#2EC9FF', // electric blue
  assistant: '#00B3B3', // tech teal
  inceptionAssistant: '#7A3EFF', // purple-blue
  divider: '#2C3540', // inputs/dividers
  placeholder: '#7a7a7a',
  textPrimary: '#FFFFFF',
  textMuted: '#9AA4AE',
} as const;

export type ColorKeys = keyof typeof Colors;

