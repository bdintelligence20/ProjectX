import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/globals.css';  // Tailwind base styles should come first
import './styles/tailwind.css'; // Component styles
import './styles/App.css';      // Custom styles last
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();