import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getDayStart, getDayEnd, getWeekStart, getWeekEnd, formatCurrency } from '@/lib/utils'
import { Nav } from '@/components/Nav'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const RAINBOW = ['#ff3cac', '#f97316', '#eab308', '#22c55e', '#4be1ec', '#cb5eee']
const TOP3_COLOR: Record<number, string> = { 1: '#F5C542', 2: '#9CA3AF', 3: '#cd7f32' }

function CrownSVG() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#F5C542">
      <path d="M3 18h18v2H3v-2zm0-2 3-9 4.5 4.5L12 4l1.5 7.5L18 7l3 9H3z" />
    </svg>
  )
}

export default async function LeaderboardPage() {
  const session = await getSession()
  if (!session.isLoggedIn) redirect('/login')

  const dayStart  = getDayStart()
  const dayEnd    = getDayEnd()
  const weekStart = getWeekStart()
  const weekEnd   = getWeekEnd()

  const contacts = await prisma.contact.findMany({ include: { payments: true } })

  const ranked = contacts
    .map(c => ({
      id: c.id, name: c.name,
      dayTotal:  c.payments.filter(p => new Date(p.date) >= dayStart  && new Date(p.date) <= dayEnd).reduce((s, p) => s + p.amount, 0),
      weekTotal: c.payments.filter(p => new Date(p.date) >= weekStart && new Date(p.date) <  weekEnd).reduce((s, p) => s + p.amount, 0),
      allTime:   c.payments.reduce((s, p) => s + p.amount, 0),
    }))
    .sort((a, b) => b.allTime - a.allTime)

  return (
    <div className="min-h-screen" style={{ background: '#0d0d0d' }}>
      <Nav username={session.user!.username} />
      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="fun-text text-4xl font-black tracking-tight">Leaderboard</h1>
          <p className="text-sm mt-1" style={{ color: '#555' }}>Top donors, all-time</p>
        </div>

        {ranked.length === 0 ? (
          <div className="card">
            <div className="fun-bar" />
            <div className="px-6 py-16 text-center">
              <p className="text-3xl mb-3">💸</p>
              <p className="text-sm" style={{ color: '#555' }}>No donors yet.</p>
              <Link href="/contacts/new" className="text-sm mt-2 inline-block" style={{ color: '#ff3cac' }}>Add your first donor →</Link>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {ranked.map((c, i) => {
              const rank = i + 1
              const rankColor = TOP3_COLOR[rank] ?? RAINBOW[(rank - 4) % RAINBOW.length]
              return (
                <div key={c.id} className={rank === 1 ? 'card-queen' : 'card-subtle'}>
                  <div className="fun-bar" />
                  <div className="flex items-center px-6 py-5 gap-5">
                    <div className="w-10 flex-shrink-0 flex flex-col items-center gap-1">
                      {rank === 1 && <CrownSVG />}
                      <span className="text-xl font-black" style={{ color: rankColor, fontVariantNumeric: 'tabular-nums' }}>{rank}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link href={`/contacts/${c.id}`}>
                        <p className="font-bold text-white hover:underline truncate">{c.name}</p>
                      </Link>
                      <p className="text-xs mt-0.5 flex gap-3" style={{ color: '#555' }}>
                        <span>Today: <span className="money">{formatCurrency(c.dayTotal)}</span></span>
                        <span>Week: <span className="money">{formatCurrency(c.weekTotal)}</span></span>
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="money font-black" style={{ fontSize: rank === 1 ? '1.5rem' : '1.15rem' }}>
                        {formatCurrency(c.allTime)}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: '#444' }}>all-time</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
