import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'

// A React "context" is a way to share a value (here: the logged-in user)
// with every component, without passing it down by hand.
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 1. On page load, ask Supabase if there is already a saved login.
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    // 2. Stay updated when the user logs in or out.
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  const value = { session, user: session?.user ?? null, loading }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
