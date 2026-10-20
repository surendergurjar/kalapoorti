import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'

// Shows one list of skills ("teach" or "learn") with add and remove.
// Used twice on the Profile page, once for each kind.
export default function SkillsSection({ userId, kind, title }) {
  const [allSkills, setAllSkills] = useState([]) // every skill in the master list
  const [mySkills, setMySkills] = useState([]) // my rows for this kind
  const [selectedId, setSelectedId] = useState('')
  const [level, setLevel] = useState('beginner')
  const [error, setError] = useState('')

  async function loadMySkills() {
    const { data, error } = await supabase
      .from('user_skills')
      .select('id, level, skill_id, skills(name)') // skills(name) joins the skills table
      .eq('user_id', userId)
      .eq('kind', kind)
      .order('created_at')
    if (error) setError(error.message)
    else setMySkills(data)
  }

  useEffect(() => {
    async function loadAll() {
      const { data, error } = await supabase
        .from('skills')
        .select('id, name, category')
        .order('name')
      if (error) setError(error.message)
      else setAllSkills(data)
    }
    loadAll()
    loadMySkills()
  }, [userId, kind])

  async function handleAdd(e) {
    e.preventDefault()
    if (!selectedId) return
    setError('')

    const { error } = await supabase.from('user_skills').insert({
      user_id: userId,
      skill_id: Number(selectedId),
      kind,
      level,
    })

    if (error) setError(error.code === '23505' ? 'You already added that skill.' : error.message)
    else {
      setSelectedId('')
      loadMySkills()
    }
  }

  async function handleRemove(id) {
    setError('')
    const { error } = await supabase.from('user_skills').delete().eq('id', id)
    if (error) setError(error.message)
    else loadMySkills()
  }

  // Hide skills I already picked so the dropdown only offers new ones.
  const pickedIds = mySkills.map((s) => s.skill_id)
  const options = allSkills.filter((s) => !pickedIds.includes(s.id))

  return (
    <section className="space-y-3 rounded bg-white p-6 shadow">
      <h2 className="text-lg font-bold">{title}</h2>
      {error && <p className="rounded bg-red-50 p-2 text-sm text-red-700">{error}</p>}

      {mySkills.length === 0 ? (
        <p className="text-sm text-gray-500">Nothing added yet.</p>
      ) : (
        <ul className="space-y-2">
          {mySkills.map((s) => (
            <li key={s.id} className="flex items-center justify-between rounded border p-2 text-sm">
              <span>
                {s.skills.name} <span className="text-gray-500">({s.level})</span>
              </span>
              <button onClick={() => handleRemove(s.id)} className="text-red-600 hover:underline">
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleAdd} className="flex flex-wrap gap-2">
        <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}
          className="flex-1 rounded border p-2 text-sm">
          <option value="">Choose a skill...</option>
          {options.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.category})
            </option>
          ))}
        </select>
        <select value={level} onChange={(e) => setLevel(e.target.value)}
          className="rounded border p-2 text-sm">
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
        <button className="rounded bg-orange-600 px-4 py-2 text-sm text-white hover:bg-orange-700">
          Add
        </button>
      </form>
    </section>
  )
}
