import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { InstallProvider } from './context/InstallContext'
import { AIProvider } from './context/AIContext'
import { ToastProvider } from './context/ToastContext'
import { LanguageProvider } from './context/LanguageContext'
import { AlarmProvider } from './context/AlarmContext'
import App from './App.jsx'
import './index.css'

// Programmatic Cache-Busting and Service Worker upgrade hook
const APP_VERSION = 'v1.1.4'
try {
  const savedVersion = localStorage.getItem('app_build_version')
  if (savedVersion !== APP_VERSION) {
    localStorage.setItem('app_build_version', APP_VERSION)
    if ('caches' in window) {
      caches.keys().then(names => {
        for (let name of names) {
          caches.delete(name)
        }
      }).catch(err => console.warn('Cache clear failed:', err))
    }
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        for (let registration of registrations) {
          registration.unregister()
        }
      }).catch(err => console.warn('Service worker unregister failed:', err))
    }
  }
} catch (e) {
  console.warn('Cache-busting / local storage disabled or failed:', e)
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AIProvider>
            <ToastProvider>
              <AlarmProvider>
                <LanguageProvider>
                  <InstallProvider>
                    <App />
                  </InstallProvider>
                </LanguageProvider>
              </AlarmProvider>
            </ToastProvider>
          </AIProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
)

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`/sw.js?v=${APP_VERSION}`)
      .then(reg => console.log('SW registered:', reg))
      .catch(err => console.error('SW registration failed:', err))
  })
}

