import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'

export default function App() {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    // Hämta eventuell aktiv session vid sidladdning
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })

    // Lyssna på login/logout
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Väntar på att Supabase ska svara innan vi renderar något
  if (session === undefined) return null

  return session ? <Dashboard session={session} /> : <Login />
}
