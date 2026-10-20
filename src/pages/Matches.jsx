import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../context/AuthContext.jsx'

export default function Matches() {
  const { user } = useAuth()
  const [matches, setMatches] = useState([])
  const [requests, setRequests] = useState([]) // every request I sent or received
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    // find_matches() is the SQL function from schema.sql; rpc() calls it.
    const [matchRes, reqRes] = await Promise.all([
      supabase.rpc('find_matches'),
      supabase.from('connection_requests').select('id, from_user, to_user, status'),
    ])
    if (matchRes.error) setError(matchRes.error.message)
    else setMatches(matchRes.data)
    if (reqRes.error) setError(reqRes.error.message)
    else setRequests(reqRes.data)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function sendRequest(toUser, message) {
    setError('')
    const { error } = await supabase.from('connection_requests').insert({
      from_user: user.id,
      to_user: toUser,
      message: message.trim() || null,
    })
    if (error) setError(error.message)
    else load()
  }

  // Find any request (in either direction) between me and this match.
  function requestWith(matchId) {
    return requests.find(
      (r) =>
        (r.from_user === user.id && r.to_user === matchId) ||
        (r.to_user === user.id && r.from_user === matchId)
    )
  }

  if (loading) return <p>Loading...</p>

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Your matches</h1>
      {error && <p className="rounded bg-red-50 p-2 text-sm text-red-700">{error}</p>}

      {matches.length === 0 && (
        <p className="rounded bg-white p-6 text-gray-700 shadow">
          No matches yet. A match needs someone who teaches what you want to
          learn <em>and</em> wants to learn what you teach.{' '}
          <Link to="/profile" className="text-orange-600 underline">Add more skills</Link>.
        </p>
      )}

      {matches.map((m) => (
        <MatchCard
          key={m.match_user_id}
          match={m}
          request={requestWith(m.match_user_id)}
          myId={user.id}
          onSend={sendRequest}
        />
      ))}
    </div>
  )
}

function MatchCard({ match, request, myId, onSend }) {
  const [message, setMessage] = useState('')

  let action
  if (!request) {
    action = (
      <div className="mt-3 flex flex-wrap gap-2">
        <input value={message} onChange={(e) => setMessage(e.target.value)}
          placeholder="Say hello (optional)" maxLength={300}
          className="flex-1 rounded border p-2 text-sm" />
        <button onClick={() => onSend(match.match_user_id, message)}
          className="rounded bg-orange-600 px-4 py-2 text-sm text-white hover:bg-orange-700">
          Send request
        </button>
      </div>
    )
  } else if (request.status === 'pending') {
    action = (
      <p className="mt-3 text-sm text-gray-600">
        {request.from_user === myId
          ? 'Request sent, waiting for a reply.'
          : 'They sent you a request. Reply on the Requests page.'}
      </p>
    )
  } else if (request.status === 'accepted') {
    action = <p className="mt-3 text-sm text-green-700">Connected.</p>
  } else {
    action = <p className="mt-3 text-sm text-gray-500">Request declined.</p>
  }

  return (
    <div className="rounded bg-white p-6 shadow">
      <h2 className="font-bold">{match.match_name}</h2>
      <p className="mt-1 text-sm">They can teach you: <strong>{match.they_teach_me.join(', ')}</strong></p>
      <p className="text-sm">You can teach them: <strong>{match.i_teach_them.join(', ')}</strong></p>
      {action}
    </div>
  )
}
