import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'sonner'
import { ErrorBoundary } from './components/ErrorBoundary'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <Toaster position="top-right" richColors />
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
