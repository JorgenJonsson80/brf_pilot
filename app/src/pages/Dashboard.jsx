import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useCommitments } from '../hooks/useCommitments'
import CommitmentCard from '../components/CommitmentCard'
import NewCommitmentForm from '../components/NewCommitmentForm'

export default function Dashboard({ session }) {
  const { grouped, loading, markAsDone, createCommitment } = useCommitments()
  const [showForm, setShowForm] = useState(false)

  async function handleSave(fields) {
    const { error } = await createCommitment(fields)
    if (!error) setShowForm(false)
    return { error }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
        <h1 className="text-lg font-semibold text-gray-900">BRF Copilot</h1>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-500 hover:text-gray-900 cursor-pointer"
        >
          Logga ut
        </button>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {loading ? (
          <p className="text-gray-400 text-sm">Laddar...</p>
        ) : (
          <div className="flex flex-col gap-8">

            {showForm ? (
              <NewCommitmentForm
                onSave={handleSave}
                onCancel={() => setShowForm(false)}
              />
            ) : (
              <button
                onClick={() => setShowForm(true)}
                className="w-full border-2 border-dashed border-gray-200 rounded-xl py-3 text-sm text-gray-400 hover:border-blue-300 hover:text-blue-500 cursor-pointer transition-colors"
              >
                + Nytt åtagande
              </button>
            )}

            <Section
              title="Försenade"
              items={grouped.overdue}
              onMarkDone={markAsDone}
              emptyText="Inga försenade åtaganden"
              titleClass="text-red-600"
            />
            <Section
              title="Öppna"
              items={grouped.open}
              onMarkDone={markAsDone}
              emptyText="Inga öppna åtaganden"
            />
            <Section
              title="Klara"
              items={grouped.done}
              onMarkDone={markAsDone}
              emptyText="Inga klara åtaganden än"
            />
          </div>
        )}
      </main>
    </div>
  )
}

function Section({ title, items, onMarkDone, emptyText, titleClass = 'text-gray-900' }) {
  return (
    <div>
      <h2 className={`text-sm font-semibold uppercase tracking-wide mb-3 ${titleClass}`}>
        {title} {items.length > 0 && <span className="font-normal">({items.length})</span>}
      </h2>
      {items.length === 0 ? (
        <p className="text-sm text-gray-400">{emptyText}</p>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map(c => (
            <CommitmentCard key={c.id} commitment={c} onMarkDone={onMarkDone} />
          ))}
        </div>
      )}
    </div>
  )
}
