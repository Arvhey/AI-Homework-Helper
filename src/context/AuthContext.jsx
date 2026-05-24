import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../services/supabase'

export const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    // Safety timeout: fallback in case Supabase never responds (e.g. no internet)
    // 5s gives enough time for the stored session to be read from localStorage on mobile
    const safetyTimeout = setTimeout(() => {
      if (active) {
        setLoading(false)
        console.warn("Auth check safety timeout reached — no session found.")
      }
    }, 5000)

    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (active) {
          clearTimeout(safetyTimeout)  // Cancel fallback — we got a definitive answer
          setUser(session?.user ?? null)
          setLoading(false)
        }
      } catch (e) {
        console.error('Failed to get session:', e)
        if (active) {
          clearTimeout(safetyTimeout)
          setLoading(false)
        }
      }
    }

    getSession()

    let subscription;
    try {
      const res = supabase.auth.onAuthStateChange((_event, session) => {
        if (active) {
          setUser(session?.user ?? null)
          setLoading(false)
        }
      })
      subscription = res.data?.subscription
    } catch (e) {
      console.error('Failed to register auth state listener:', e)
      if (active) {
        setLoading(false)
      }
    }

    return () => {
      active = false
      clearTimeout(safetyTimeout)
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [])

  const value = {
    signUp: (data) => supabase.auth.signUp(data),
    signIn: (data) => supabase.auth.signInWithPassword(data),
    signOut: () => supabase.auth.signOut(),
    user,
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
