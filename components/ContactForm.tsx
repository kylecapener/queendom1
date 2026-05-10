'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  contact?: { id: number; name: string; phone: string; notes: string | null }
}

export function ContactForm({ contact }: Props) {
  const router = useRouter()
  const [name, setName] = useState(contact?.name ?? '')
  const [phone, setPhone] = useState(contact?.phone ?? '')
  const [notes, setNotes] = useState(contact?.notes ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const url = contact ? `/api/contacts/${contact.id}` : '/api/contacts'
    const method = contact ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone, notes }),
    })

    if (res.ok) {
      const data = await res.json()
      router.push(`/contacts/${data.id}`)
      router.refresh()
    } else {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? 'Something went wrong.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#666' }}>Name</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          autoFocus
          placeholder="Their name"
          className="input-dark"
        />
      </div>
      <div>
        <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#666' }}>Phone</label>
        <input
          type="tel"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          required
          placeholder="+1 555 000 0000"
          className="input-dark"
        />
      </div>
      <div>
        <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#666' }}>Notes</label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={4}
          placeholder="Any notes about this donor..."
          className="input-dark resize-none"
        />
      </div>

      {error && (
        <p className="text-xs py-2 px-3 rounded-lg" style={{ color: '#f87171', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>{error}</p>
      )}

      <div className="flex gap-3">
        <button type="submit" disabled={loading} className="btn-fun px-6 py-2.5">
          {loading ? 'Saving…' : contact ? 'Save Changes' : 'Add Donor 💸'}
        </button>
        <button type="button" onClick={() => router.back()} className="text-sm px-4 py-2.5 rounded-xl"
          style={{ color: '#555', border: '1px solid #2a2a2a' }}>
          Cancel
        </button>
      </div>
    </form>
  )
}
