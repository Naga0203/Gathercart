/**
 * GatherCart / NeighbourBuy Design System Tokens
 * Extracted directly from approved UI reference screens (Screens 1 - 7).
 */

export const designTokens = {
  colors: {
    brand: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d', // Primary brand green
      800: '#166534', // Hover / dark green
      900: '#14532d',
      950: '#052e16',
    },
    neutral: {
      light: {
        bg: '#f8fafc',
        surface: '#ffffff',
        surfaceSubtle: '#f1f5f9',
        borderSubtle: '#e2e8f0',
        borderStrong: '#cbd5e1',
        textPrimary: '#0f172a',
        textSecondary: '#475569',
        textMuted: '#64748b',
      },
      dark: {
        bg: '#0b1120',
        surface: '#131c2e',
        surfaceSubtle: '#1e293b',
        borderSubtle: '#1e293b',
        borderStrong: '#334155',
        textPrimary: '#f8fafc',
        textSecondary: '#cbd5e1',
        textMuted: '#94a3b8',
      },
    },
    status: {
      open: {
        bg: '#f0fdf4',
        text: '#15803d',
        border: '#bbf7d0',
        dot: '#22c55e',
      },
      actionRequired: {
        bg: '#fffbeb',
        text: '#b45309',
        border: '#fde68a',
        dot: '#d97706',
      },
      endingSoon: {
        bg: '#fff7ed',
        text: '#c2410c',
        border: '#fed7aa',
        dot: '#ea580c',
      },
      confirmed: {
        bg: '#ecfdf5',
        text: '#047857',
        border: '#a7f3d0',
        dot: '#10b981',
      },
      closed: {
        bg: '#f1f5f9',
        text: '#64748b',
        border: '#cbd5e1',
        dot: '#94a3b8',
      },
      danger: {
        bg: '#fff1f2',
        text: '#be123c',
        border: '#fecdd3',
        dot: '#e11d48',
      },
    },
  },
  typography: {
    fontFamily: {
      sans: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    },
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1rem' }],
      sm: ['0.875rem', { lineHeight: '1.25rem' }],
      base: ['1rem', { lineHeight: '1.5rem' }],
      lg: ['1.125rem', { lineHeight: '1.75rem' }],
      xl: ['1.25rem', { lineHeight: '1.75rem' }],
      '2xl': ['1.5rem', { lineHeight: '2rem' }],
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
      black: '900',
    },
  },
  borderRadius: {
    none: '0',
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    '2xl': '1.25rem',
    '3xl': '1.5rem',
    full: '9999px',
  },
  shadows: {
    xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
} as const;

export type DesignTokens = typeof designTokens;

