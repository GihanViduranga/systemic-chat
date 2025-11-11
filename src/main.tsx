import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import systemicLogo from './assets/systemicLogo.png'

const favicon = document.querySelector<HTMLLinkElement>("link[rel*='icon']")
if (favicon) {
  favicon.href = systemicLogo
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
