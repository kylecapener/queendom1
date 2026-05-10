'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'

export type DonorRow = {
  id: number
  name: string
  phone: string
  dayTotal: number
  weekTotal: number
  allTime: number
}

export function DonorTable({ contacts }: { contacts: DonorRow[] }) {
  const router = useRouter()

  async function handleDelete(id: number, name: string) {
    if (!confirm(`Remove ${name} from the Queendom? All their payment history goes too.`)) return
    const res = await fetch(`/api/contacts/${id}`, { method: 'DELETE' })
    if (res.ok) router.refresh()
    else alert('Failed to delete.')
  }

  if (contacts.length === 0) {
    return (
      <div className="card">
        <div className="fun-bar" />
        <div className="px-6 py-16 text-center">
          <p className="text-3xl mb-3">💸</p>
          <p className="text-sm" style={{ color: '#555' }}>No donors yet. Time to recruit!</p>
          <Link href="/contacts/new" className="text-sm mt-2 inline-block" style={{ color: '#ff3cac' }}>Add your first donor →</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="fun-bar" />
      <table className="w-full text-sm">
        <thead>
          <tr style={{ borderBottom: '1px solid #222' }}>
            {['Donor', 'Phone', 'Today', 'This Week', 'All-Time', ''].map(h => (
              <th key={h} className={`px-5 py-3.5 text-xs font-bold uppercase tracking-widest ${['Today','This Week','All-Time',''].includes(h) ? 'text-right' : 'text-left'}`}
                style={{ color: '#444' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {contacts.map((c, i) => (
            <tr key={c.id} style={{ borderTop: i > 0 ? '1px solid #1c1c1c' : undefined }}
              onMouseEnter={e => (e.currentTarget.style.background = '#1a1a1a')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
              <td className="px-5 py-4">
                <Link href={`/contacts/${c.id}`} className="font-bold text-white hover:underline">{c.name}</Link>
              </td>
              <td className="px-5 py-4" style={{ color: '#555' }}>{c.phone}</td>
              <td className="px-5 py-4 text-right">
                <span className="money">{c.dayTotal > 0 ? formatCurrency(c.dayTotal) : <span style={{ color: '#333' }}>—</span>}</span>
              </td>
              <td className="px-5 py-4 text-right">
                <span className="money">{formatCurrency(c.weekTotal)}</span>
              </td>
              <td className="px-5 py-4 text-right">
                <span className="money text-base">{formatCurrency(c.allTime)}</span>
              </td>
              <td className="px-5 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <Link href={`/contacts/${c.id}/edit`} className="text-xs px-3 py-1.5 rounded-lg"
                    style={{ color: '#666', border: '1px solid #2a2a2a' }}>Edit</Link>
                  <button onClick={() => handleDelete(c.id, c.name)} className="text-xs px-3 py-1.5 rounded-lg"
                    style={{ color: '#666', border: '1px solid #2a2a2a' }}>Remove</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
