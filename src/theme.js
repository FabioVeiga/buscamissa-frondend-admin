import { createTheme } from '@mui/material/styles';

export const buildTheme = (mode = 'light') => {
  const dark = mode === 'dark';
  const c = dark
    ? {
        bgDefault: '#0b1220', bgPaper: '#131c2e', textPrimary: '#e2e8f0', textSecondary: '#94a3b8', divider: '#273449',
        inputBg: '#0f172a', inputBorder: '#334155', inputBorderHover: '#475569', inputDisabled: '#162033',
        headBg: '#162033', headText: '#94a3b8', headBorder: '#273449', cellBorder: '#1f2a3d', rowHover: '#162033',
        paperBorder: 'rgba(255,255,255,0.06)', shadow: '0 1px 3px 0 rgba(0,0,0,0.4)', tooltipBg: '#334155', primary: '#3b82f6',
        focusRing: 'rgba(96, 165, 250, 0.25)',
      }
    : {
        bgDefault: '#f1f5f9', bgPaper: '#ffffff', textPrimary: '#0f172a', textSecondary: '#64748b', divider: '#e2e8f0',
        inputBg: '#ffffff', inputBorder: '#cbd5e1', inputBorderHover: '#94a3b8', inputDisabled: '#f1f5f9',
        headBg: '#f8fafc', headText: '#475569', headBorder: '#e2e8f0', cellBorder: '#eef2f7', rowHover: '#f8fafc',
        paperBorder: 'rgba(0,0,0,0.04)', shadow: '0 1px 3px 0 rgba(0,0,0,0.06)', tooltipBg: '#1e293b', primary: '#2563eb',
        focusRing: 'rgba(59, 130, 246, 0.15)',
      };

  return createTheme({
  palette: {
    mode,
    primary: {
      main: c.primary,
      light: '#60a5fa',
      dark: '#1d4ed8',
      contrastText: '#fff',
    },
    secondary: {
      main: '#0ea5e9',
      light: '#38bdf8',
      dark: '#0284c7',
      contrastText: '#fff',
    },
    background: {
      default: c.bgDefault,
      paper: c.bgPaper,
    },
    text: {
      primary: c.textPrimary,
      secondary: c.textSecondary,
    },
    divider: c.divider,
    success: { main: '#22c55e' },
    warning: { main: '#f59e0b' },
    error: { main: '#ef4444' },
  },
  shape: {
    borderRadius: 10,
  },
  typography: {
    fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700, letterSpacing: '-0.02em' },
    h5: { fontWeight: 600, letterSpacing: '-0.01em' },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 600 },
    body2: { color: c.textSecondary },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiCssBaseline: { styleOverrides: { body: { colorScheme: mode } } },
    MuiTextField: { defaultProps: { size: 'small' } },
    MuiFormControl: { defaultProps: { size: 'small' } },
    MuiSelect: { defaultProps: { size: 'small' } },
    MuiAutocomplete: { defaultProps: { size: 'small' } },
    MuiSwitch: { defaultProps: { size: 'small' } },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: c.inputBg,
          borderRadius: 8,
          '& .MuiOutlinedInput-notchedOutline': { borderColor: c.inputBorder },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: c.inputBorderHover },
          '&.Mui-focused': { boxShadow: `0 0 0 3px ${c.focusRing}` },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderWidth: 1, borderColor: '#3b82f6' },
          '&.Mui-error.Mui-focused': { boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.15)' },
          '&.Mui-disabled': { backgroundColor: c.inputDisabled },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
          boxShadow: 'none',
          '&:hover': { boxShadow: '0 2px 8px rgba(59, 130, 246, 0.35)' },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: c.shadow,
          border: `1px solid ${c.paperBorder}`,
          overflow: 'hidden',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: c.shadow,
          border: `1px solid ${c.paperBorder}`,
          backgroundImage: 'none',
        },
      },
    },
    MuiTableContainer: { styleOverrides: { root: { borderRadius: 12 } } },
    MuiTableCell: {
      styleOverrides: {
        root: { borderBottom: `1px solid ${c.cellBorder}`, padding: '10px 16px', fontSize: '0.875rem' },
        head: {
          backgroundColor: c.headBg,
          color: c.headText,
          fontWeight: 600,
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          borderBottom: `1px solid ${c.headBorder}`,
          whiteSpace: 'nowrap',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&.MuiTableRow-hover:hover': { backgroundColor: c.rowHover },
          '&:last-child td': { borderBottom: 0 },
        },
      },
    },
    MuiTablePagination: {
      styleOverrides: {
        root: { borderTop: `1px solid ${c.cellBorder}`, color: c.textSecondary },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 500, borderRadius: 8 },
        sizeSmall: { height: 24, fontSize: '0.75rem' },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: { minHeight: 44 },
        indicator: { height: 3, borderRadius: '3px 3px 0 0' },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600, minHeight: 44, fontSize: '0.875rem' },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: { borderRadius: 16, boxShadow: '0 20px 50px -12px rgba(15,23,42,0.25)' },
      },
    },
    MuiDialogTitle: { styleOverrides: { root: { fontWeight: 600, fontSize: '1.125rem' } } },
    MuiDialogActions: { styleOverrides: { root: { padding: '12px 24px 20px' } } },
    MuiTooltip: {
      defaultProps: { arrow: true },
      styleOverrides: {
        tooltip: { backgroundColor: c.tooltipBg, fontSize: '0.75rem', borderRadius: 6, padding: '6px 10px' },
        arrow: { color: c.tooltipBg },
      },
    },
    MuiAlert: {
      styleOverrides: { root: { borderRadius: 10, alignItems: 'center' } },
    },
    MuiCheckbox: { defaultProps: { size: 'small' } },
    MuiIconButton: {
      styleOverrides: {
        root: { '&:focus-visible': { outline: '2px solid #3b82f6', outlineOffset: 2 } },
      },
    },
    MuiButtonBase: {
      styleOverrides: {
        root: { '&.Mui-focusVisible': { outline: '2px solid #3b82f6', outlineOffset: 2 } },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 0 rgba(0,0,0,0.06)',
          backgroundColor: '#1e293b',
        },
      },
    },
  },
  });
};

const theme = buildTheme('light');

export default theme;

// Cores do sidebar (uso em Menu.jsx)
export const SIDEBAR = {
  bg: '#1e293b',
  bgHover: 'rgba(255,255,255,0.06)',
  bgActive: 'rgba(59, 130, 246, 0.2)',
  borderActive: '#3b82f6',
  text: 'rgba(255,255,255,0.88)',
  textMuted: 'rgba(255,255,255,0.6)',
};
