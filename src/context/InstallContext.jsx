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
    // Detect sandboxed mobile webviews (like Facebook, Instagram, Messenger)
    const ua = navigator.userAgent || navigator.vendor || window.opera
    const isFB = (ua.indexOf("FBAN") > -1) || (ua.indexOf("FBAV") > -1)
    const isInstagram = (ua.indexOf("Instagram") > -1)
    const isSandboxedWebview = isFB || isInstagram

    if (isSandboxedWebview) {
      showToast('To install, tap the top menu (•••) and select "Open in Browser"!', 'info')
      return
    }

    if (deferredPrompt) {
      try {
        deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice
        console.log(`PWA Installation outcome: ${outcome}`)
        setDeferredPrompt(null)
        setCanInstall(false)
      } catch (err) {
        console.error('Direct PWA prompt failed:', err)
        showToast('To install directly, tap your browser menu and select "Install App"!', 'info')
      }
    } else {
      // Check if already running as installed app
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone
      if (isStandalone) {
        showToast('AI Homework Helper is already installed!', 'success')
      } else {
        // Fallback instructing exactly how to install directly from browser menu
        showToast('To install directly, tap your browser menu and select "Install App"!', 'info')
      }
    }
  }

  return (
    <InstallContext.Provider value={{ canInstall, installApp }}>
      {children}
    </InstallContext.Provider>
  )
}

export const useInstall = () => useContext(InstallContext)
