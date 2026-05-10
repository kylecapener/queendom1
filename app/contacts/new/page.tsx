import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { Nav } from '@/components/Nav'
import { ContactForm } from '@/components/ContactForm'

export default async function NewContactPage() {
  const session = await getSession()
  if (!session.isLoggedIn) redirect('/login')

  return (
    <div className="min-h-screen" style={{ background: '#0d0d0d' }}>
      <Nav username={session.user!.username} />
      <main className="max-w-xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="fun-text text-4xl font-black tracking-tight">New Donor</h1>
          <p className="text-sm mt-1" style={{ color: '#555' }}>Add someone to the Queendom 👑</p>
        </div>
        <div className="card">
          <div className="fun-bar" />
          <div className="px-6 py-6">
            <ContactForm />
          </div>
        </div>
      </main>
    </div>
  )
}
