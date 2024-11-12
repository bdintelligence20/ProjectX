import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/globals.css';  // Tailwind styles
import './styles/App.css';     // Custom styles
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();