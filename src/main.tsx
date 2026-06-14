import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Handle Vite dynamic import chunk load failures (due to new deployments)
if (typeof window !== 'undefined') {
  window.addEventListener('vite:preloadError', (event) => {
    console.warn('New version detected. Reloading page...', event);
    window.location.reload();
  });
}

createRoot(document.getElementById('root')!).render(
  <App />,
)
