import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { type SessionData, sessionOptions } from './session'

// Change these passwords before sharing
export const ADMINS = [
  { username: 'admin', password: 'queendom1' },
  { username: 'zach',  password: 'queendom2' },
]

export async function getSession() {
  return getIronSession<SessionData>(cookies() as any, sessionOptions)
}
