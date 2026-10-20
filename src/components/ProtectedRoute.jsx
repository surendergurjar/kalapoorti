import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

// Wrap a page in this to make it visible only to logged-in users.
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return <p className="p-4">Loading...</p>
  if (!user) return <Navigate to="/login" replace />
  return children
}
