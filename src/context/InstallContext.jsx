import React, { createContext, useContext, useState, useEffect } from 'react'
import { useToast } from '../hooks/useToast'

const InstallContext = createContext()

export const InstallProvider = ({ children }) => {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [canInstall, setCanInstall] = useState(false)
  const { showToast } = useToast()

  useEffect(() => {
    // In development mode, mock PWA installability so the UI can be previewed/tested immediately
    if (import.meta.env.DEV) {
      setCanInstall(true)
    }

    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setCanInstall(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const installApp = async () => {
    // Detect mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    
    if (isMobile) {
      // Do absolutely nothing on mobile
      return
    }

    // Always simulate/toast on desktop, do not trigger actual browser native prompt
    showToast('PWA installation triggered! (PWA install prompt is simulated)', 'success')
  }

  return (
    <InstallContext.Provider value={{ canInstall, installApp }}>
      {children}
    </InstallContext.Provider>
  )
}

export const useInstall = () => useContext(InstallContext)
