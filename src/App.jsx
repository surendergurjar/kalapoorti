import { Routes, Route, Navigate } from 'react-router-dom'
import { supabaseConfigured } from './lib/supabase.js'
import Navbar from './components/Navbar.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Home from './pages/Home.jsx'
import Signup from './pages/Signup.jsx'
import Login from './pages/Login.jsx'
import Profile from './pages/Profile.jsx'

export default function App() {
  if (!supabaseConfigured) {
    return (
      <div className="mx-auto max-w-xl p-8">
        <h1 className="text-2xl font-bold">Supabase keys missing</h1>
        <p className="mt-2 text-gray-700">
          Copy <code>.env.example</code> to <code>.env.local</code>, fill in
          VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then restart{' '}
          <code>npm run dev</code>.
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50 text-gray-900">
      <Navbar />
      <main className="mx-auto max-w-2xl p-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}
