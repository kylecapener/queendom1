'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'

const links = [
  { href: '/dashboard',   label: 'Dashboard' },
  { href: '/leaderboard', label: '👑 Leaderboard' },
  { href: '/contacts/new', label: '+ Add Donor' },
]

export function Nav({ username }: { username: string }) {
  const router = useRouter()
  const pathname = usePathname()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <nav style={{ background: '#0d0d0d', borderBottom: '1px solid #1e1e1e' }}>
      <div className="fun-bar" />
      <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="fun-text text-lg font-black tracking-tight">
            👑 Queendom
          </Link>
          <div className="flex items-center gap-6">
            {links.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-semibold transition-colors"
                style={{ color: pathname === link.href ? '#ff3cac' : '#555' }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span style={{ color: '#444' }}>{username}</span>
          <button onClick={handleLogout} className="text-sm" style={{ color: '#444' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#aaa')}
            onMouseLeave={e => (e.currentTarget.style.color = '#444')}
          >
            Sign out
          </button>
        </div>
      </div>
    </nav>
  )
}
