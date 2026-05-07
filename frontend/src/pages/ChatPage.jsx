import React, { useState, useRef, useEffect } from 'react'
import { chatStream } from '../lib/api'

export default function ChatPage() {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hey! I\'m your ASCEND AI coach. I have access to your workout history and recovery data. Ask me anything about your training.' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send(e) {
    e.preventDefault()
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput('')
    setMessages(m => [...m, { role: 'user', text: userMsg }])
    setLoading(true)

    let aiText = ''
    setMessages(m => [...m, { role: 'assistant', text: '', streaming: true }])

    try {
      await chatStream(
        userMsg,
        (chunk) => {
          aiText += chunk
          setMessages(m => m.map((msg, i) => i === m.length - 1 ? { ...msg, text: aiText } : msg))
        },
        () => {
          setMessages(m => m.map((msg, i) => i === m.length - 1 ? { ...msg, streaming: false } : msg))
          setLoading(false)
        }
      )
    } catch (err) {
      setMessages(m => m.map((msg, i) => i === m.length - 1 ? { role: 'assistant', text: 'Sorry, something went wrong.', streaming: false } : msg))
      setLoading(false)
    }
  }

  const suggestions = [
    'What should I train today?',
    'How is my chest recovery?',
    'Give me a progressive overload tip',
    'Analyze my recent workouts'
  ]

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto">
      <div className="p-6 border-b border-white/5">
        <h1 className="text-2xl font-bold text-white">AI Coach</h1>
        <p className="text-zinc-500 text-sm mt-1">Powered by Claude — knows your history</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'text-black font-medium'
                  : 'bg-[#111] border border-white/5 text-zinc-200'
              }`}
              style={msg.role === 'user' ? { backgroundColor: '#c8ff2e' } : {}}
            >
              {msg.text || (msg.streaming ? <span className="animate-pulse">▋</span> : '')}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div className="px-6 pb-2 flex flex-wrap gap-2">
          {suggestions.map(s => (
            <button
              key={s}
              onClick={() => setInput(s)}
              className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-zinc-400 hover:text-white hover:border-[#c8ff2e]/30 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <form onSubmit={send} className="p-4 border-t border-white/5 flex gap-3">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask your coach anything..."
          disabled={loading}
          className="flex-1 bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#c8ff2e]/50 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-5 py-3 rounded-xl font-semibold text-black text-sm disabled:opacity-40 transition-opacity"
          style={{ backgroundColor: '#c8ff2e' }}
        >
          {loading ? '...' : 'Send'}
        </button>
      </form>
    </div>
  )
}
