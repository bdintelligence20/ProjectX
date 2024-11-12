import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#007bff',
      light: '#3395ff',
      dark: '#0056b3',
    },
    secondary: {
      main: '#ffc905',
      light: '#ffdb4a',
      dark: '#b38f00',
    },
    text: {
      primary: '#000',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    gradient: {
      primary: 'linear-gradient(to right bottom, #6366f1, #a855f7, #ec4899)',
    },
  },
  typography: {
    fontFamily: 'Barlow, -apple-system, BlinkMacSystemFont, sans-serif',
    h6: {
      fontSize: '18px',
      fontWeight: 600,
    },
    subtitle1: {
      fontSize: '16px',
      fontWeight: 500,
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
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        },
      },
    },
  },
});

export default theme;