import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

// Catch and ignore Vite's HMR WebSocket connection errors which are expected in this environment
const suppressHmrErrors = (event: ErrorEvent | PromiseRejectionEvent) => {
  const message = 'reason' in event ? event.reason?.message : event.message;
  if (message && (
    message.includes('WebSocket closed without opened') ||
    message.includes('failed to connect to websocket') ||
    message.includes('Vite hot reload')
  )) {
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

// Register Service Worker for PWA
const isIframe = window.self !== window.top;

if ('serviceWorker' in navigator && !isIframe) {
  window.addEventListener('load', () => {
    // Add a version query to force the browser to see the new sw.js
    navigator.serviceWorker.register('/sw.js?v=2').then(registration => {
      console.log('SW registered: ', registration);
      
      // Check for updates every 5 minutes
      setInterval(() => {
        try {
          if (registration.active) {
            registration.update().catch(err => {
              // Ignore "invalid state" errors which are common in some environments
              if (!err.message?.includes('invalid state')) {
                console.warn('SW update failed:', err);
              }
            });
          }
        } catch (e) {
          // Catch synchronous errors from update()
        }
      }, 300000);
    }).catch(registrationError => {
      console.log('SW registration failed: ', registrationError);
    });
  });

  // Refresh the page when the new service worker takes over
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      refreshing = true;
      window.location.reload();
    }
  });
}
