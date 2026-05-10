'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatCurrency } from '@/lib/utils'

type Payment = { id: number; amount: number; note: string | null; date: string }

type Props = {
  contactId: number
  payments: Payment[]
  dayTotal: number
  weekTotal: number
  allTime: number
}

function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  d.setDate(d.getDate() - day)
  d.setHours(0, 0, 0, 0)
  return d
}

function groupByWeek(payments: Payment[]): [string, Payment[]][] {
  const map = new Map<string, Payment[]>()
  for (const p of payments) {
    const ws = getWeekStart(new Date(p.date))
    const key = ws.toISOString()
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(p)
  }
  return Array.from(map.entries()).sort(([a], [b]) => b.localeCompare(a))
}

function formatWeekLabel(isoKey: string) {
  const d = new Date(isoKey)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function PaymentSection({ contactId, payments, dayTotal, weekTotal, allTime }: Props) {
  const router = useRouter()
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [adding, setAdding] = useState(false)
  const [deleting, setDeleting] = useState<number | null>(null)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setAdding(true)
    const res = await fetch(`/api/contacts/${contactId}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: parseFloat(amount), note }),
    })
    if (res.ok) {
      setAmount('')
      setNote('')
      router.refresh()
    } else {
      alert('Failed to log payment.')
    }
    setAdding(false)
  }

  async function handleDelete(id: number) {
    if (!confirm('Remove this payment?')) return
    setDeleting(id)
    const res = await fetch(`/api/contacts/${contactId}/payments/${id}`, { method: 'DELETE' })
    if (res.ok) router.refresh()
    else alert('Failed to delete.')
    setDeleting(null)
  }

  const grouped = groupByWeek(payments)

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Today',     value: dayTotal },
          { label: 'This Week', value: weekTotal },
          { label: 'All-Time',  value: allTime },
        ].map(({ label, value }) => (
          <div key={label} className="card">
            <div className="fun-bar" />
            <div className="px-5 py-4">
              <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#555' }}>{label}</p>
              <p className="money text-2xl font-black" style={{ fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(value)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Log payment form */}
      <div className="card">
        <div className="fun-bar" />
        <div className="px-6 py-5">
          <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#666' }}>Log Payment 💸</p>
          <form onSubmit={handleAdd} className="flex gap-3 flex-wrap">
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              required
              placeholder="Amount ($)"
              className="input-dark w-36"
            />
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Note (optional)"
              className="input-dark flex-1 min-w-40"
            />
            <button type="submit" disabled={adding} className="btn-fun px-5 py-2">
              {adding ? 'Logging…' : '+ Log'}
            </button>
          </form>
        </div>
      </div>

      {/* Payment history */}
      {grouped.length === 0 ? (
        <div className="card">
          <div className="fun-bar" />
          <div className="px-6 py-12 text-center">
            <p className="text-3xl mb-2">💸</p>
            <p className="text-sm" style={{ color: '#555' }}>No payments yet. Log the first one above!</p>
          </div>
        </div>
      ) : (
        grouped.map(([key, week]) => {
          const weekSum = week.reduce((s, p) => s + p.amount, 0)
          return (
            <div key={key} className="card">
              <div className="fun-bar" />
              <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid #222' }}>
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#555' }}>
                  Week of {formatWeekLabel(key)}
                </p>
                <span className="money text-sm font-black">{formatCurrency(weekSum)}</span>
              </div>
              <table className="w-full text-sm">
                <tbody>
                  {week
                    .slice()
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((p, i) => (
                      <tr key={p.id}
                        style={{ borderTop: i > 0 ? '1px solid #1c1c1c' : undefined }}>
                        <td className="px-6 py-3" style={{ color: '#555' }}>
                          {new Date(p.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </td>
                        <td className="px-6 py-3" style={{ color: '#777' }}>{p.note ?? '—'}</td>
                        <td className="px-6 py-3 text-right">
                          <span className="money">{formatCurrency(p.amount)}</span>
                        </td>
                        <td className="px-6 py-3 text-right">
                          <button
                            onClick={() => handleDelete(p.id)}
                            disabled={deleting === p.id}
                            className="text-xs px-2 py-1 rounded"
                            style={{ color: '#444', border: '1px solid #222' }}>
                            {deleting === p.id ? '…' : '×'}
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )
        })
      )}
    </div>
  )
}
