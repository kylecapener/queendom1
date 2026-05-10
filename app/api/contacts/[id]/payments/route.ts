import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const { amount, date, note } = await request.json()
  if (!amount || !date) return NextResponse.json({ error: 'Amount and date required' }, { status: 400 })
  const payment = await prisma.payment.create({
    data: { contactId: parseInt(params.id), amount: parseFloat(amount), date: new Date(date), note: note?.trim() ?? '' },
  })
  return NextResponse.json(payment, { status: 201 })
}
