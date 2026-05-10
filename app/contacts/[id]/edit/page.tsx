import { redirect, notFound } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { Nav } from '@/components/Nav'
import { ContactForm } from '@/components/ContactForm'

export default async function EditContactPage({ params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session.isLoggedIn) redirect('/login')

  const id = parseInt(params.id)
  if (isNaN(id)) notFound()

  const contact = await prisma.contact.findUnique({ where: { id } })
  if (!contact) notFound()

  return (
    <div className="min-h-screen" style={{ background: '#0d0d0d' }}>
      <Nav username={session.user!.username} />
      <main className="max-w-xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="fun-text text-4xl font-black tracking-tight">Edit Donor</h1>
          <p className="text-sm mt-1" style={{ color: '#555' }}>{contact.name}</p>
        </div>
        <div className="card">
          <div className="fun-bar" />
          <div className="px-6 py-6">
            <ContactForm contact={{ id: contact.id, name: contact.name, phone: contact.phone, notes: contact.notes }} />
          </div>
        </div>
      </main>
    </div>
  )
}
