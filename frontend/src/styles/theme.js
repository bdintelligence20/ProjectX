// theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#007bff',  // Adjust to your brand colors
    },
    secondary: {
      main: '#ffc905',  // Your secondary color
    },
    text: {
      primary: '#000',
    },
    background: {
      default: '#f5f5f5',  // Light background for the sidebar
    },
  },
  typography: {
    fontFamily: 'Barlow, sans-serif',  // Use your preferred font
    h6: {
      fontSize: '18px',
      fontWeight: 600,
    },
    subtitle1: {
      fontSize: '16px',
      fontWeight: 500,
    },
  },
});

export default theme;
