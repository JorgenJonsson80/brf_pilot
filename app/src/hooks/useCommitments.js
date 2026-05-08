import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useCommitments() {
  const [commitments, setCommitments] = useState([])
  const [loading, setLoading] = useState(true)

  async function fetchCommitments() {
    const { data } = await supabase
      .from('commitments')
      .select(`
        *,
        profiles!assigned_to (full_name)
      `)
      .order('deadline', { ascending: true })

    setCommitments(data ?? [])
    setLoading(false)
  }

  async function markAsDone(id) {
    await supabase
      .from('commitments')
      .update({ status: 'done', completed_at: new Date().toISOString() })
      .eq('id', id)

    // Uppdatera lokalt direkt utan att vänta på ny fetch
    setCommitments(prev =>
      prev.map(c => c.id === id ? { ...c, status: 'done' } : c)
    )
  }

  useEffect(() => {
    fetchCommitments()
  }, [])

  // Räkna ut "försenad" vid rendering – behöver inte lagras i databasen
  const today = new Date().toISOString().split('T')[0]

  const grouped = {
    overdue: commitments.filter(c => c.status === 'open' && c.deadline < today),
    open:    commitments.filter(c => c.status === 'open' && c.deadline >= today),
    done:    commitments.filter(c => c.status === 'done'),
  }

  async function createCommitment(fields) {
    const { data, error } = await supabase
      .from('commitments')
      .insert(fields)
      .select(`*, profiles!assigned_to (full_name)`)
      .single()

    if (!error) {
      setCommitments(prev => [...prev, data])
    }
    return { error }
  }

  return { grouped, loading, markAsDone, createCommitment }
}
