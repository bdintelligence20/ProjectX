import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#3b82f6',
      light: '#60a5fa',
      dark: '#2563eb',
    },
    secondary: {
      main: '#ec4899',
      light: '#f472b6',
      dark: '#db2777',
    },
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h3: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          padding: '8px 16px',
          fontSize: '0.875rem',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          '&.summary-paper': {
            backgroundColor: '#f8fafc',
            borderRadius: '12px',
            padding: '16px',
            transition: 'box-shadow 0.2s ease-in-out',
            '&:hover': {
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            },
          },
          '&.chat-message': {
            transition: 'box-shadow 0.2s ease-in-out',
            '&:hover': {
              boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.1)',
            },
          },
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          '&.summary-title': {
            fontWeight: 600,
            color: '#1e293b',
          },
          '&.summary-date': {
            color: '#64748b',
            fontSize: '0.75rem',
          },
          '&.source-title': {
            color: '#1e293b',
            fontWeight: 600,
            fontSize: '0.75rem',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          '&.source-chip': {
            backgroundColor: 'rgba(59, 130, 246, 0.05)',
            borderColor: 'rgba(59, 130, 246, 0.3)',
            '&:hover': {
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
            },
          },
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          '&.source-link': {
            color: '#3b82f6',
            textDecoration: 'none',
            fontSize: '0.75rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            '&:hover': {
              textDecoration: 'underline',
            },
          },
        },
      },
    },
  },
});

export default theme;