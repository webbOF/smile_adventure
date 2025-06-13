/**
 * 🚀 SmileAdventure Main Entry Point
 * Initialize the React application with all services
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { initializeServices } from './services/index.js';

// Initialize all API services on app startup
initializeServices();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
