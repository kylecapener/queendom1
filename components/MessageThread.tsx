'use client'

import { useState, useEffect, useRef } from 'react'

type Message = {
  id: number
  direction: 'inbound' | 'outbound'
  body: string
  sentBy: string
  createdAt: string
}

export function MessageThread({ contactId, currentUser }: { contactId: number; currentUser: string }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  async function load() {
    const res = await fetch(`/api/contacts/${contactId}/messages`)
    if (res.ok) setMessages(await res.json())
  }

  useEffect(() => {
    load()
    const interval = setInterval(load, 5000)
    return () => clearInterval(interval)
  }, [contactId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    setSending(true)
    const res = await fetch(`/api/contacts/${contactId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: text.trim() }),
    })
    if (res.ok) {
      setText('')
      await load()
    } else {
      const d = await res.json().catch(() => ({}))
      alert(d.error ?? 'Failed to send.')
    }
    setSending(false)
  }

  return (
    <div className="card flex flex-col" style={{ height: '520px' }}>
      <div className="fun-bar" />
      <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid #1e1e1e' }}>
        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#555' }}>Messages</p>
        <p className="text-xs" style={{ color: '#333' }}>{messages.length} total</p>
      </div>

      {/* Thread */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-sm" style={{ color: '#444', marginTop: '6rem' }}>No messages yet. Say hi! 👋</p>
        )}
        {messages.map(m => {
          const isOut = m.direction === 'outbound'
          return (
            <div key={m.id} className={`flex ${isOut ? 'justify-end' : 'justify-start'}`}>
              <div className="max-w-xs">
                <div
                  className="px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
                  style={isOut
                    ? { background: 'linear-gradient(135deg, #ff3cac, #cb5eee)', color: '#fff', borderBottomRightRadius: '4px' }
                    : { background: '#222', color: '#ddd', borderBottomLeftRadius: '4px' }
                  }
                >
                  {m.body}
                </div>
                <p className="text-xs mt-1" style={{ color: '#333', textAlign: isOut ? 'right' : 'left' }}>
                  {isOut ? m.sentBy : 'them'} · {new Date(m.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Send box */}
      <form onSubmit={handleSend} className="px-4 py-3 flex gap-2" style={{ borderTop: '1px solid #1e1e1e' }}>
        <input
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Type a message…"
          className="input-dark flex-1 py-2 text-sm"
          disabled={sending}
        />
        <button
          type="submit"
          disabled={sending || !text.trim()}
          className="btn-fun px-4 py-2 text-sm"
          style={{ opacity: (!text.trim() || sending) ? 0.5 : 1 }}
        >
          {sending ? '…' : 'Send'}
        </button>
      </form>
    </div>
  )
}
