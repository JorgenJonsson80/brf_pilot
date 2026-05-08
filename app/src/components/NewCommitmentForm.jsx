import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function NewCommitmentForm({ onSave, onCancel }) {
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [title, setTitle] = useState('')
  const [assignedTo, setAssignedTo] = useState('')
  const [deadline, setDeadline] = useState('')
  const [meetingRef, setMeetingRef] = useState('')

  useEffect(() => {
    supabase
      .from('profiles')
      .select('id, full_name')
      .then(({ data }) => {
        setProfiles(data ?? [])
        if (data?.length) setAssignedTo(data[0].id)
      })
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Hämta brf_id från den inloggades profil
    const { data: profile } = await supabase
      .from('profiles')
      .select('brf_id')
      .eq('id', (await supabase.auth.getUser()).data.user.id)
      .single()

    const { error } = await onSave({
      title,
      assigned_to: assignedTo,
      deadline,
      meeting_ref: meetingRef || null,
      brf_id: profile.brf_id,
    })

    if (error) {
      setError('Kunde inte spara åtagandet.')
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col gap-4">
      <h2 className="font-semibold text-gray-900">Nytt åtagande</h2>

      <input
        type="text"
        placeholder="Vad ska göras?"
        value={title}
        onChange={e => setTitle(e.target.value)}
        required
        className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
      />

      <select
        value={assignedTo}
        onChange={e => setAssignedTo(e.target.value)}
        required
        className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
      >
        {profiles.map(p => (
          <option key={p.id} value={p.id}>{p.full_name}</option>
        ))}
      </select>

      <input
        type="date"
        value={deadline}
        onChange={e => setDeadline(e.target.value)}
        required
        className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
      />

      <input
        type="text"
        placeholder="Från vilket möte? (valfritt)"
        value={meetingRef}
        onChange={e => setMeetingRef(e.target.value)}
        className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
      />

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
        >
          {loading ? 'Sparar...' : 'Spara'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-sm text-gray-500 hover:text-gray-900 cursor-pointer"
        >
          Avbryt
        </button>
      </div>
    </form>
  )
}
