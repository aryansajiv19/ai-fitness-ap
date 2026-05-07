import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'

export default function Auth() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function submit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'login') {
        const data = await api.login(email, password)
        localStorage.setItem('token', data.token)
        localStorage.setItem('userId', data.userId)
        navigate('/')
      } else {
        await api.signup(email, password)
        setMode('login')
        setError('Account created — sign in below')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black tracking-tight" style={{ color: '#ff6500' }}>ASCEND</h1>
          <p className="text-zinc-500 mt-2 text-sm">Your AI-powered training coach</p>
        </div>

        <div className="bg-[#111] border border-white/5 rounded-2xl p-8">
          <div className="flex gap-2 mb-6">
            {['login', 'signup'].map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                  mode === m
                    ? 'text-black font-semibold'
                    : 'text-zinc-500 hover:text-white bg-transparent'
                }`}
                style={mode === m ? { backgroundColor: '#ff6500' } : {}}
              >
                {m}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#ff6500]/50 transition-colors"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#ff6500]/50 transition-colors"
            />
            {error && (
              <p className={`text-sm ${error.includes('created') ? 'text-[#ff6500]' : 'text-red-400'}`}>{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-black text-sm transition-opacity disabled:opacity-50"
              style={{ backgroundColor: '#ff6500' }}
            >
              {loading ? '...' : mode === 'login' ? 'Sign in' : 'Create account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
