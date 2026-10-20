import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'

export default function Signup() {
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [checkEmail, setCheckEmail] = useState(false)
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault() // stop the browser from reloading the page
    setError('')
    setBusy(true)

    // "data" is saved as raw_user_meta_data; the handle_new_user() trigger in
    // schema.sql reads full_name from it to fill profiles.display_name.
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    setBusy(false)

    if (error) {
      setError(error.message)
    } else if (data.session) {
      navigate('/profile') // email confirmation is off: already logged in
    } else {
      setCheckEmail(true) // email confirmation is on: wait for the link
    }
  }

  if (checkEmail) {
    return (
      <div className="mx-auto max-w-sm rounded bg-white p-6 shadow">
        <h1 className="text-xl font-bold">Check your email</h1>
        <p className="mt-2 text-gray-700">
          We sent a confirmation link to <strong>{email}</strong>. Click it,
          then <Link to="/login" className="text-orange-600 underline">log in</Link>.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-sm space-y-4 rounded bg-white p-6 shadow">
      <h1 className="text-xl font-bold">Create your account</h1>
      {error && <p className="rounded bg-red-50 p-2 text-sm text-red-700">{error}</p>}

      <label className="block text-sm">
        Your name
        <input required value={fullName} onChange={(e) => setFullName(e.target.value)}
          className="mt-1 w-full rounded border p-2" />
      </label>
      <label className="block text-sm">
        Email
        <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded border p-2" />
      </label>
      <label className="block text-sm">
        Password (at least 6 characters)
        <input required type="password" minLength={6} value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded border p-2" />
      </label>

      <button disabled={busy} className="w-full rounded bg-orange-600 p-2 text-white hover:bg-orange-700 disabled:opacity-50">
        {busy ? 'Creating...' : 'Sign up'}
      </button>
      <p className="text-center text-sm">
        Already have an account? <Link to="/login" className="text-orange-600 underline">Log in</Link>
      </p>
    </form>
  )
}
