import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setBusy(false)

    if (error) setError(error.message)
    else navigate('/profile')
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-sm space-y-4 rounded bg-white p-6 shadow">
      <h1 className="text-xl font-bold">Log in</h1>
      {error && <p className="rounded bg-red-50 p-2 text-sm text-red-700">{error}</p>}

      <label className="block text-sm">
        Email
        <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded border p-2" />
      </label>
      <label className="block text-sm">
        Password
        <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded border p-2" />
      </label>

      <button disabled={busy} className="w-full rounded bg-orange-600 p-2 text-white hover:bg-orange-700 disabled:opacity-50">
        {busy ? 'Logging in...' : 'Log in'}
      </button>
      <p className="text-center text-sm">
        New here? <Link to="/signup" className="text-orange-600 underline">Create an account</Link>
      </p>
    </form>
  )
}
