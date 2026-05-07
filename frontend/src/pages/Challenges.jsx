import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'

const MUSCLES = ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'legs', 'core']

export default function Challenges() {
  const [challenges, setChallenges] = useState([])
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    name: '', description: '', challenge_type: 'volume',
    target_muscle: 'chest', end_date: ''
  })
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.getChallenges().then(setChallenges).finally(() => setLoading(false))
  }, [])

  async function join(id) {
    setJoining(id)
    try {
      await api.joinChallenge(id)
    } catch (err) {
      alert(err.message)
    } finally {
      setJoining(null)
    }
  }

  async function create(e) {
    e.preventDefault()
    setCreating(true); setError('')
    try {
      const c = await api.createChallenge(form)
      setChallenges(prev => [c, ...prev])
      setShowForm(false)
      setForm({ name: '', description: '', challenge_type: 'volume', target_muscle: 'chest', end_date: '' })
    } catch (err) {
      setError(err.message)
    } finally {
      setCreating(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-6 h-6 border-2 border-[#c8ff2e] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Challenges</h1>
          <p className="text-zinc-500 text-sm mt-1">Compete with others</p>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className="px-4 py-2 rounded-xl text-black text-sm font-semibold"
          style={{ backgroundColor: '#c8ff2e' }}
        >
          + Create
        </button>
      </div>

      {showForm && (
        <div className="bg-[#111] border border-white/5 rounded-2xl p-6 mb-6">
          <h2 className="text-sm font-semibold text-white mb-4">New Challenge</h2>
          <form onSubmit={create} className="flex flex-col gap-3">
            <input
              placeholder="Challenge name"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              required
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#c8ff2e]/50"
            />
            <textarea
              placeholder="Description"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={2}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#c8ff2e]/50 resize-none"
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Type</label>
                <select
                  value={form.challenge_type}
                  onChange={e => setForm(f => ({ ...f, challenge_type: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-sm text-white focus:outline-none"
                >
                  <option value="volume" className="bg-[#111]">Volume</option>
                  <option value="max_weight" className="bg-[#111]">Max Weight</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Muscle Group</label>
                <select
                  value={form.target_muscle}
                  onChange={e => setForm(f => ({ ...f, target_muscle: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-sm text-white focus:outline-none capitalize"
                >
                  {MUSCLES.map(m => <option key={m} value={m} className="bg-[#111] capitalize">{m}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">End Date</label>
              <input
                type="date"
                value={form.end_date}
                onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#c8ff2e]/50"
              />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={creating}
              className="py-3 rounded-xl font-semibold text-black text-sm disabled:opacity-50"
              style={{ backgroundColor: '#c8ff2e' }}
            >
              {creating ? 'Creating...' : 'Create Challenge'}
            </button>
          </form>
        </div>
      )}

      {challenges.length === 0 ? (
        <div className="text-center py-16 text-zinc-600">
          <p className="text-4xl mb-3">🏆</p>
          <p>No challenges yet. Create the first one!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {challenges.map(c => (
            <div key={c.id} className="bg-[#111] border border-white/5 rounded-2xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-white font-semibold">{c.name}</h3>
                  {c.description && <p className="text-zinc-500 text-sm mt-1">{c.description}</p>}
                  <div className="flex gap-3 mt-2">
                    <span className="text-xs bg-white/5 px-2 py-1 rounded-full text-zinc-400 capitalize">{c.target_muscle}</span>
                    <span className="text-xs bg-white/5 px-2 py-1 rounded-full text-zinc-400 capitalize">{c.challenge_type}</span>
                    {c.end_date && (
                      <span className="text-xs text-zinc-600">
                        Ends {new Date(c.end_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <button
                    onClick={() => join(c.id)}
                    disabled={joining === c.id}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-black disabled:opacity-50"
                    style={{ backgroundColor: '#c8ff2e' }}
                  >
                    {joining === c.id ? '...' : 'Join'}
                  </button>
                  <Link
                    to={`/challenges/${c.id}/leaderboard`}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 bg-white/5 hover:text-white text-center"
                  >
                    Leaderboard
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
