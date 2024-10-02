// App.js
import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import Dashboard from './components/Dashboard';
import theme from './styles/theme';  // Import the custom theme

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Dashboard />
    </ThemeProvider>
  );
}

export default App;
