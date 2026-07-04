import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { applyTheme, getThemeMode } from './theme.js'

// The iOS/iPadOS 26 design system tokens key dark mode off a `data-theme`
// attribute rather than a media query, so mirror the OS preference onto <html>
// unless the user picked an explicit light/dark mode in Settings.
applyTheme()
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  if (getThemeMode() === 'auto') applyTheme()
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
