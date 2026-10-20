import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Home() {
  const { user } = useAuth()

  return (
    <div className="py-10 text-center">
      <h1 className="text-3xl font-bold">Teach what you know. Learn what you love.</h1>
      <p className="mt-3 text-gray-700">
        Kalapoorti matches you with people who want to learn your skill and can
        teach you theirs.
      </p>
      <div className="mt-6">
        {user ? (
          <Link to="/profile" className="rounded bg-orange-600 px-4 py-2 text-white hover:bg-orange-700">
            Set up my skills
          </Link>
        ) : (
          <Link to="/signup" className="rounded bg-orange-600 px-4 py-2 text-white hover:bg-orange-700">
            Get started
          </Link>
        )}
      </div>
    </div>
  )
}
