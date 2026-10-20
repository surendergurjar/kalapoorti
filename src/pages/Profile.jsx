import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../context/AuthContext.jsx'
import SkillsSection from '../components/SkillsSection.jsx'

export default function Profile() {
  const { user } = useAuth()
  const [displayName, setDisplayName] = useState('')
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  // Load my profile row once when the page opens.
  useEffect(() => {
    async function loadProfile() {
      const { data, error } = await supabase
        .from('profiles')
        .select('display_name, username, bio')
        .eq('id', user.id)
        .single()

      if (error) setError(error.message)
      else {
        setDisplayName(data.display_name ?? '')
        setUsername(data.username ?? '')
        setBio(data.bio ?? '')
      }
      setLoading(false)
    }
    loadProfile()
  }, [user.id])

  async function handleSave(e) {
    e.preventDefault()
    setMessage('')
    setError('')

    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: displayName,
        username: username.trim() || null, // empty -> null so it doesn't clash with the unique rule
        bio,
      })
      .eq('id', user.id)

    if (error) {
      // 23505 = Postgres "unique violation" (someone already has this username)
      setError(error.code === '23505' ? 'That username is taken.' : error.message)
    } else {
      setMessage('Profile saved.')
    }
  }

  if (loading) return <p>Loading...</p>

  return (
    <div className="space-y-6">
      <form onSubmit={handleSave} className="space-y-4 rounded bg-white p-6 shadow">
        <h1 className="text-xl font-bold">My profile</h1>
        {error && <p className="rounded bg-red-50 p-2 text-sm text-red-700">{error}</p>}
        {message && <p className="rounded bg-green-50 p-2 text-sm text-green-700">{message}</p>}

        <label className="block text-sm">
          Name
          <input value={displayName} onChange={(e) => setDisplayName(e.target.value)}
            className="mt-1 w-full rounded border p-2" />
        </label>
        <label className="block text-sm">
          Username (optional, must be unique)
          <input value={username} onChange={(e) => setUsername(e.target.value)}
            className="mt-1 w-full rounded border p-2" />
        </label>
        <label className="block text-sm">
          About you
          <textarea rows={3} value={bio} onChange={(e) => setBio(e.target.value)}
            className="mt-1 w-full rounded border p-2" />
        </label>
        <button className="rounded bg-orange-600 px-4 py-2 text-white hover:bg-orange-700">
          Save profile
        </button>
      </form>

      <SkillsSection userId={user.id} kind="teach" title="Skills I can teach" />
      <SkillsSection userId={user.id} kind="learn" title="Skills I want to learn" />
    </div>
  )
}
