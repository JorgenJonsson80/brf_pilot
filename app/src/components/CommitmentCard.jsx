export default function CommitmentCard({ commitment, onMarkDone }) {
  const isDone = commitment.status === 'done'

  return (
    <div className={`bg-white rounded-xl p-4 shadow-sm border ${isDone ? 'opacity-50' : 'border-gray-100'}`}>
      <div className="flex justify-between items-start gap-4">
        <div>
          <p className={`font-medium text-gray-900 ${isDone ? 'line-through' : ''}`}>
            {commitment.title}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Ansvarig: {commitment.profiles?.full_name ?? '–'}
          </p>
          {commitment.meeting_ref && (
            <p className="text-xs text-gray-400 mt-1">{commitment.meeting_ref}</p>
          )}
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <DeadlineBadge deadline={commitment.deadline} status={commitment.status} />
          {!isDone && (
            <button
              onClick={() => onMarkDone(commitment.id)}
              className="text-xs text-blue-600 hover:text-blue-800 cursor-pointer"
            >
              Markera klar
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function DeadlineBadge({ deadline, status }) {
  const today = new Date().toISOString().split('T')[0]
  const isOverdue = status === 'open' && deadline < today

  const label = new Date(deadline + 'T12:00:00').toLocaleDateString('sv-SE', {
    day: 'numeric',
    month: 'short',
  })

  return (
    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
      isOverdue
        ? 'bg-red-100 text-red-700'
        : status === 'done'
        ? 'bg-gray-100 text-gray-500'
        : 'bg-blue-50 text-blue-700'
    }`}>
      {label}
    </span>
  )
}
