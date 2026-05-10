import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const from = formData.get('From') as string
  const body = formData.get('Body') as string

  if (!from || !body) return new NextResponse('', { status: 200 })

  // Normalize phone: strip spaces/dashes for matching
  const normalize = (p: string) => p.replace(/\D/g, '')
  const fromNorm = normalize(from)

  const contacts = await prisma.contact.findMany()
  const contact = contacts.find(c => normalize(c.phone) === fromNorm)

  if (contact) {
    await prisma.message.create({
      data: {
        contactId: contact.id,
        direction: 'inbound',
        body,
        sentBy: '',
      },
    })
  }

  // Respond with empty TwiML so Twilio doesn't auto-reply
  return new NextResponse('<Response></Response>', {
    status: 200,
    headers: { 'Content-Type': 'text/xml' },
  })
}
