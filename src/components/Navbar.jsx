import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../context/AuthContext.jsx'

export default function Navbar() {
  const { user } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/')
  }

  return (
    <nav className="border-b bg-white">
      <div className="mx-auto flex max-w-2xl items-center justify-between p-4">
        <Link to="/" className="text-xl font-bold text-orange-600">
          Kalapoorti
        </Link>
        <div className="flex items-center gap-4 text-sm">
          {user ? (
            <>
              <Link to="/profile" className="hover:underline">My profile</Link>
              <button onClick={handleLogout} className="text-gray-600 hover:underline">
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:underline">Log in</Link>
              <Link to="/signup" className="rounded bg-orange-600 px-3 py-1.5 text-white hover:bg-orange-700">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
