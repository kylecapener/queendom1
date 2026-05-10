import { redirect, notFound } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getDayStart, getDayEnd, getWeekStart, getWeekEnd } from '@/lib/utils'
import { Nav } from '@/components/Nav'
import { PaymentSection } from '@/components/PaymentSection'
import { MessageThread } from '@/components/MessageThread'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function ContactPage({ params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session.isLoggedIn) redirect('/login')

  const id = parseInt(params.id)
  if (isNaN(id)) notFound()

  const contact = await prisma.contact.findUnique({
    where: { id },
    include: { payments: { orderBy: { date: 'desc' } } },
  })
  if (!contact) notFound()

  const dayStart  = getDayStart()
  const dayEnd    = getDayEnd()
  const weekStart = getWeekStart()
  const weekEnd   = getWeekEnd()

  const dayTotal  = contact.payments.filter(p => new Date(p.date) >= dayStart  && new Date(p.date) <= dayEnd).reduce((s, p) => s + p.amount, 0)
  const weekTotal = contact.payments.filter(p => new Date(p.date) >= weekStart && new Date(p.date) <  weekEnd).reduce((s, p) => s + p.amount, 0)
  const allTime   = contact.payments.reduce((s, p) => s + p.amount, 0)

  const serialized = contact.payments.map(p => ({
    id: p.id,
    amount: p.amount,
    note: p.note,
    date: p.date.toISOString(),
  }))

  return (
    <div className="min-h-screen" style={{ background: '#0d0d0d' }}>
      <Nav username={session.user!.username} />
      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="fun-text text-4xl font-black tracking-tight">{contact.name}</h1>
            <p className="text-sm mt-1" style={{ color: '#555' }}>{contact.phone}</p>
            {contact.notes && (
              <p className="text-sm mt-2" style={{ color: '#666' }}>{contact.notes}</p>
            )}
          </div>
          <Link href={`/contacts/${id}/edit`} className="text-sm px-4 py-2 rounded-xl"
            style={{ color: '#666', border: '1px solid #2a2a2a' }}>Edit</Link>
        </div>

        <div className="grid grid-cols-2 gap-6 items-start">
          <PaymentSection
            contactId={id}
            payments={serialized}
            dayTotal={dayTotal}
            weekTotal={weekTotal}
            allTime={allTime}
          />
          <MessageThread contactId={id} currentUser={session.user!.username} />
        </div>
      </main>
    </div>
  )
}
