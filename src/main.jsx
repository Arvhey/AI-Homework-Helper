import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { InstallProvider } from './context/InstallContext'
import { AIProvider } from './context/AIContext'
import { ToastProvider } from './context/ToastContext'
import { LanguageProvider } from './context/LanguageContext'
import App from './App.jsx'
import './index.css'

// Programmatic Cache-Busting and Service Worker upgrade hook
const APP_VERSION = 'v1.0.5'
if (localStorage.getItem('app_build_version') !== APP_VERSION) {
  localStorage.setItem('app_build_version', APP_VERSION)
  if ('caches' in window) {
    caches.keys().then(names => {
      for (let name of names) {
        caches.delete(name)
      }
    })
  }
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      for (let registration of registrations) {
        registration.unregister()
      }
      setTimeout(() => {
        window.location.reload()
      }, 100)
    })
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AIProvider>
            <ToastProvider>
              <LanguageProvider>
                <InstallProvider>
                  <App />
                </InstallProvider>
              </LanguageProvider>
            </ToastProvider>
          </AIProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
)

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('SW registered:', reg))
      .catch(err => console.error('SW registration failed:', err))
  })
}

