import React, { useState } from 'react'
import { api } from '../lib/api'

const MUSCLES = ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'legs', 'core']

export default function WorkoutLogger() {
  const [form, setForm] = useState({ exercise: '', sets: '', reps: '', weight: '', muscle_group: 'chest' })
  const [voice, setVoice] = useState('')
  const [tab, setTab] = useState('manual')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [parsed, setParsed] = useState(null)

  async function submitManual(e) {
    e.preventDefault()
    setError(''); setSuccess(''); setLoading(true)
    try {
      await api.createWorkout({
        exercise: form.exercise,
        sets: parseInt(form.sets),
        reps: parseInt(form.reps),
        weight: parseFloat(form.weight),
        muscle_group: form.muscle_group
      })
      setSuccess('Workout logged!')
      setForm({ exercise: '', sets: '', reps: '', weight: '', muscle_group: 'chest' })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function submitVoice(e) {
    e.preventDefault()
    setError(''); setSuccess(''); setParsed(null); setLoading(true)
    try {
      const data = await api.voiceLog(voice)
      setParsed(data.parsed)
      setSuccess('Workout parsed and logged!')
      setVoice('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Log Workout</h1>
        <p className="text-zinc-500 text-sm mt-1">Manual entry or natural language</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {['manual', 'voice'].map(t => (
          <button
            key={t}
            onClick={() => { setTab(t); setError(''); setSuccess('') }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
              tab === t ? 'text-black' : 'text-zinc-400 bg-white/5 hover:text-white'
            }`}
            style={tab === t ? { backgroundColor: '#c8ff2e' } : {}}
          >
            {t === 'voice' ? '🎙 Voice / Text' : '📝 Manual'}
          </button>
        ))}
      </div>

      <div className="bg-[#111] border border-white/5 rounded-2xl p-6">
        {tab === 'manual' ? (
          <form onSubmit={submitManual} className="flex flex-col gap-4">
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Exercise</label>
              <input
                value={form.exercise}
                onChange={e => setForm(f => ({ ...f, exercise: e.target.value }))}
                placeholder="e.g. Bench Press"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#c8ff2e]/50"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              {['sets', 'reps', 'weight'].map(field => (
                <div key={field}>
                  <label className="text-xs text-zinc-500 mb-1 block capitalize">{field}{field === 'weight' ? ' (kg)' : ''}</label>
                  <input
                    type="number"
                    value={form[field]}
                    onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                    required
                    min="0"
                    step={field === 'weight' ? '0.5' : '1'}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-sm text-white focus:outline-none focus:border-[#c8ff2e]/50"
                  />
                </div>
              ))}
            </div>
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Muscle Group</label>
              <select
                value={form.muscle_group}
                onChange={e => setForm(f => ({ ...f, muscle_group: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#c8ff2e]/50"
              >
                {MUSCLES.map(m => <option key={m} value={m} className="bg-[#111] capitalize">{m}</option>)}
              </select>
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            {success && <p className="text-[#c8ff2e] text-sm">{success}</p>}
            <button
              type="submit"
              disabled={loading}
              className="py-3 rounded-xl font-semibold text-black text-sm disabled:opacity-50"
              style={{ backgroundColor: '#c8ff2e' }}
            >
              {loading ? 'Logging...' : 'Log Workout'}
            </button>
          </form>
        ) : (
          <form onSubmit={submitVoice} className="flex flex-col gap-4">
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Describe your workout</label>
              <textarea
                value={voice}
                onChange={e => setVoice(e.target.value)}
                placeholder='e.g. "bench press 3 sets of 10 at 80 kilos" or "squatted 100kg for 5x5"'
                required
                rows={4}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#c8ff2e]/50 resize-none"
              />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            {success && <p className="text-[#c8ff2e] text-sm">{success}</p>}
            {parsed && (
              <div className="bg-white/5 rounded-xl p-4 text-sm">
                <p className="text-zinc-400 mb-2 text-xs uppercase tracking-wider">Parsed as:</p>
                <div className="grid grid-cols-2 gap-1">
                  {Object.entries(parsed).map(([k, v]) => (
                    <div key={k} className="flex gap-2">
                      <span className="text-zinc-500 capitalize">{k}:</span>
                      <span className="text-white font-medium">{String(v)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="py-3 rounded-xl font-semibold text-black text-sm disabled:opacity-50"
              style={{ backgroundColor: '#c8ff2e' }}
            >
              {loading ? 'Parsing with AI...' : '🤖 Parse & Log'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
