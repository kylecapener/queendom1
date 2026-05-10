export interface SessionData {
  user?: { username: string }
  isLoggedIn: boolean
}

export const sessionOptions = {
  password: process.env.SESSION_SECRET ?? 'findom-tracker-session-secret-change-me-32chars!!',
  cookieName: 'findom-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24 * 7,
  },
}
