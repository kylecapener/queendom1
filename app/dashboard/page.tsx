import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getDayStart, getDayEnd, getWeekStart, getWeekEnd, formatCurrency } from '@/lib/utils'
import { Nav } from '@/components/Nav'
import { DonorTable } from '@/components/DonorTable'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const session = await getSession()
  if (!session.isLoggedIn) redirect('/login')

  const dayStart  = getDayStart()
  const dayEnd    = getDayEnd()
  const weekStart = getWeekStart()
  const weekEnd   = getWeekEnd()

  const contacts = await prisma.contact.findMany({
    include: { payments: true },
    orderBy: { name: 'asc' },
  })

  const rows = contacts.map(c => {
    const dayTotal  = c.payments.filter(p => new Date(p.date) >= dayStart  && new Date(p.date) <= dayEnd).reduce((s, p) => s + p.amount, 0)
    const weekTotal = c.payments.filter(p => new Date(p.date) >= weekStart && new Date(p.date) <  weekEnd).reduce((s, p) => s + p.amount, 0)
    const allTime   = c.payments.reduce((s, p) => s + p.amount, 0)
    return { id: c.id, name: c.name, phone: c.phone, dayTotal, weekTotal, allTime }
  })

  const totalDay  = rows.reduce((s, r) => s + r.dayTotal, 0)
  const totalWeek = rows.reduce((s, r) => s + r.weekTotal, 0)
  const totalAll  = rows.reduce((s, r) => s + r.allTime, 0)

  return (
    <div className="min-h-screen" style={{ background: '#0d0d0d' }}>
      <Nav username={session.user!.username} />
      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="fun-text text-4xl font-black tracking-tight">Dashboard</h1>
            <p className="text-sm mt-1" style={{ color: '#555' }}>{contacts.length} donor{contacts.length !== 1 ? 's' : ''}</p>
          </div>
          <Link href="/contacts/new" className="btn-fun">+ Add Donor</Link>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Donors',    value: String(contacts.length), isMoney: false },
            { label: 'Today',     value: formatCurrency(totalDay),  isMoney: true },
            { label: 'This Week', value: formatCurrency(totalWeek), isMoney: true },
            { label: 'All-Time',  value: formatCurrency(totalAll),  isMoney: true },
          ].map(({ label, value, isMoney }) => (
            <div key={label} className="card">
              <div className="fun-bar" />
              <div className="px-5 py-4">
                <p className="text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: '#555' }}>{label}</p>
                <p className="text-2xl font-black" style={{ color: isMoney ? '#F5C542' : '#fff', fontVariantNumeric: 'tabular-nums' }}>{value}</p>
              </div>
            </div>
          ))}
        </div>

        <DonorTable contacts={rows} />
      </main>
    </div>
  )
}
