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

    const installedHandler = () => {
      setCanInstall(false)
      setDeferredPrompt(null)
      showToast('App installed successfully!', 'success')
    }
    window.addEventListener('appinstalled', installedHandler)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      window.removeEventListener('appinstalled', installedHandler)
    }
  }, [])

  const installApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      console.log(`PWA Installation outcome: ${outcome}`)
      setDeferredPrompt(null)
      setCanInstall(false)
    } else {
      // Fallback for simulation in dev environment
      showToast('PWA installation triggered! (PWA install prompt is simulated in development)', 'success')
    }
  }

  return (
    <InstallContext.Provider value={{ canInstall, installApp }}>
      {children}
    </InstallContext.Provider>
  )
}

export const useInstall = () => useContext(InstallContext)
