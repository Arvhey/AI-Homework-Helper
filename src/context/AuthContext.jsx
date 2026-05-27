import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../services/supabase'
import { GraduationCap } from 'lucide-react'

export const AuthContext = createContext({})

// Native mobile notification-style popup shown while session is being restored
const SessionLoader = () => (
  <>
    {/* Keyframe animations */}
    <style>{`
      @keyframes notif-slide-down {
        from { transform: translateY(-120%) scale(0.95); opacity: 0; }
        to   { transform: translateY(0)      scale(1);    opacity: 1; }
      }
      @keyframes notif-spin-cw  { to { transform: rotate(360deg); } }
      @keyframes notif-spin-ccw { to { transform: rotate(-360deg); } }
      @keyframes notif-dot {
        0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
        40%           { opacity: 1;   transform: scale(1); }
      }
    `}</style>

    {/* Notification banner — slides in from the top like a native Android/iOS alert */}
    <div style={{
      position: 'fixed',
      top: '12px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 99999,
      width: 'calc(100% - 32px)',
      maxWidth: '380px',
      animation: 'notif-slide-down 0.45s cubic-bezier(0.34,1.56,0.64,1) forwards',
    }}>
      <div style={{
        background: 'rgba(15,23,42,0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(99,102,241,0.25)',
        borderRadius: '20px',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.06)',
      }}>

        {/* App icon */}
        <div style={{
          width: '40px', height: '40px', borderRadius: '12px', flexShrink: 0,
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(99,102,241,0.4)',
          position: 'relative',
        }}>
          <GraduationCap style={{ color: 'white', width: '20px', height: '20px' }} />
        </div>

        {/* Text content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: '2px',
          }}>
            <span style={{
              color: 'white', fontSize: '12px', fontWeight: 800,
              letterSpacing: '0.01em',
            }}>AI Homework Helper</span>
            <span style={{
              color: 'rgba(148,163,184,0.5)', fontSize: '10px', fontWeight: 600,
            }}>now</span>
          </div>
          <div style={{
            color: 'rgba(148,163,184,0.8)', fontSize: '11px', fontWeight: 500,
            display: 'flex', alignItems: 'center', gap: '6px',
          }}>
            Signing you in
            {/* Animated dots like native "typing..." indicator */}
            {[0, 0.2, 0.4].map((delay, i) => (
              <span key={i} style={{
                display: 'inline-block', width: '4px', height: '4px',
                borderRadius: '50%', background: '#6366f1',
                animation: `notif-dot 1.2s ease-in-out ${delay}s infinite`,
              }} />
            ))}
          </div>
        </div>

        {/* Mini dual-ring spinner on the right */}
        <div style={{ position: 'relative', width: '28px', height: '28px', flexShrink: 0 }}>
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            border: '2.5px solid transparent',
            borderTopColor: '#6366f1',
            borderBottomColor: 'rgba(99,102,241,0.15)',
            animation: 'notif-spin-cw 1.2s linear infinite',
          }} />
          <div style={{
            position: 'absolute', inset: '5px', borderRadius: '50%',
            border: '2px dashed transparent',
            borderTopColor: '#8b5cf6',
            animation: 'notif-spin-ccw 0.8s linear infinite',
          }} />
        </div>

      </div>
    </div>
  </>
)


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
      {loading ? <SessionLoader /> : children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
