import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#3b82f6',
      light: '#60a5fa',
      dark: '#2563eb',
      contrastText: '#fff',
    },
    secondary: {
      main: '#0ea5e9',
      light: '#38bdf8',
      dark: '#0284c7',
      contrastText: '#fff',
    },
    background: {
      default: '#f1f5f9',
      paper: '#ffffff',
    },
    text: {
      primary: '#0f172a',
      secondary: '#64748b',
    },
    success: { main: '#22c55e' },
    warning: { main: '#f59e0b' },
    error: { main: '#ef4444' },
  },
  shape: {
    borderRadius: 10,
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700, letterSpacing: '-0.02em' },
    h5: { fontWeight: 600, letterSpacing: '-0.01em' },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 600 },
    body2: { color: '#64748b' },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiTextField: { defaultProps: { size: 'small' } },
    MuiFormControl: { defaultProps: { size: 'small' } },
    MuiSelect: { defaultProps: { size: 'small' } },
    MuiAutocomplete: { defaultProps: { size: 'small' } },
    MuiSwitch: { defaultProps: { size: 'small' } },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          borderRadius: 8,
          '& .MuiOutlinedInput-notchedOutline': { borderColor: '#cbd5e1' },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#94a3b8' },
          '&.Mui-focused': { boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.15)' },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderWidth: 1, borderColor: '#3b82f6' },
          '&.Mui-error.Mui-focused': { boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.15)' },
          '&.Mui-disabled': { backgroundColor: '#f1f5f9' },
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
          boxShadow: '0 1px 3px 0 rgba(0,0,0,0.06)',
          border: '1px solid rgba(0,0,0,0.04)',
          overflow: 'hidden',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 1px 3px 0 rgba(0,0,0,0.06)',
          border: '1px solid rgba(0,0,0,0.04)',
        },
      },
    },
    MuiTableContainer: { styleOverrides: { root: { borderRadius: 12 } } },
    MuiTableCell: {
      styleOverrides: {
        root: { borderBottom: '1px solid #eef2f7', padding: '10px 16px', fontSize: '0.875rem' },
        head: {
          backgroundColor: '#f8fafc',
          color: '#475569',
          fontWeight: 600,
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          borderBottom: '1px solid #e2e8f0',
          whiteSpace: 'nowrap',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&.MuiTableRow-hover:hover': { backgroundColor: '#f8fafc' },
          '&:last-child td': { borderBottom: 0 },
        },
      },
    },
    MuiTablePagination: {
      styleOverrides: {
        root: { borderTop: '1px solid #eef2f7', color: '#64748b' },
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
        tooltip: { backgroundColor: '#1e293b', fontSize: '0.75rem', borderRadius: 6, padding: '6px 10px' },
        arrow: { color: '#1e293b' },
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
