import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

// Catch and ignore Vite's HMR WebSocket connection errors which are expected in this environment
const suppressHmrErrors = (event: ErrorEvent | PromiseRejectionEvent) => {
  const message = 'reason' in event ? event.reason?.message : event.message;
  const isViteError = message && (
    message.includes('WebSocket closed without opened') ||
    message.includes('failed to connect to websocket') ||
    message.includes('Vite hot reload') ||
    message.includes('[vite] failed to connect') ||
    message.includes('HMR')
  );

  if (isViteError) {
    // Silence the error in the console if possible, though browser might still log it
    // We prevent default to stop the "overlay" from showing up if enabled
    event.preventDefault();
    return true;
  }
  return false;
};

window.addEventListener('unhandledrejection', suppressHmrErrors);
window.addEventListener('error', suppressHmrErrors);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

