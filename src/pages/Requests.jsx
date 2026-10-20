import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../context/AuthContext.jsx'

export default function Requests() {
  const { user } = useAuth()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    // The profiles!..._fkey parts join in each person's name. Two foreign keys
    // point to profiles, so we name which one we mean.
    const { data, error } = await supabase
      .from('connection_requests')
      .select(`
        id, from_user, to_user, status, message, created_at,
        sender:profiles!connection_requests_from_user_fkey(display_name),
        receiver:profiles!connection_requests_to_user_fkey(display_name)
      `)
      .order('created_at', { ascending: false })
    if (error) setError(error.message)
    else setRequests(data)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function respond(id, status) {
    setError('')
    const { error } = await supabase.from('connection_requests').update({ status }).eq('id', id)
    if (error) setError(error.message)
    else load()
  }

  if (loading) return <p>Loading...</p>

  const incoming = requests.filter((r) => r.to_user === user.id && r.status === 'pending')
  const sent = requests.filter((r) => r.from_user === user.id && r.status === 'pending')
  const connected = requests.filter((r) => r.status === 'accepted')

  return (
    <div className="space-y-6">
      {error && <p className="rounded bg-red-50 p-2 text-sm text-red-700">{error}</p>}

      <Box title="Requests for you" empty="No pending requests." items={incoming}>
        {(r) => (
          <>
            <div>
              <strong>{r.sender.display_name}</strong> wants to connect.
              {r.message && <p className="text-gray-600">"{r.message}"</p>}
            </div>
            <div className="flex gap-3">
              <button onClick={() => respond(r.id, 'accepted')} className="text-green-700 hover:underline">Accept</button>
              <button onClick={() => respond(r.id, 'declined')} className="text-red-600 hover:underline">Decline</button>
            </div>
          </>
        )}
      </Box>

      <Box title="Requests you sent" empty="Nothing waiting." items={sent}>
        {(r) => <div>Waiting for <strong>{r.receiver.display_name}</strong> to reply.</div>}
      </Box>

      <Box title="Connected" empty="No connections yet." items={connected}>
        {(r) => (
          <div>
            <strong>{r.from_user === user.id ? r.receiver.display_name : r.sender.display_name}</strong>
          </div>
        )}
      </Box>
    </div>
  )
}

// A white card with a title and a list of rows. "children" is a function that
// draws one row for a request.
function Box({ title, empty, items, children }) {
  return (
    <section className="space-y-2 rounded bg-white p-6 shadow">
      <h2 className="text-lg font-bold">{title}</h2>
      {items.length === 0 ? (
        <p className="text-sm text-gray-500">{empty}</p>
      ) : (
        <ul className="space-y-2">
          {items.map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-4 rounded border p-2 text-sm">
              {children(r)}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
