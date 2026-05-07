import React, { useEffect, useState, useMemo } from 'react'
import { api } from '../lib/api'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  ReferenceLine, CartesianGrid
} from 'recharts'

const ORANGE = '#ff6500'

function PRBadge() {
  return (
    <span className="ml-2 text-xs font-bold px-1.5 py-0.5 rounded-full text-black" style={{ backgroundColor: ORANGE }}>
      PR
    </span>
  )
}

function StatCard({ label, value, sub }) {
  return (
    <div className="bg-[#111] border border-white/5 rounded-2xl p-5">
      <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
      {sub && <p className="text-xs text-zinc-600 mt-1">{sub}</p>}
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-3 text-sm shadow-xl">
      <p className="text-zinc-400 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">
          {p.name}: {Number(p.value).toLocaleString()}{p.name === 'Volume' ? ' kg' : ' kg'}
        </p>
      ))}
    </div>
  )
}

export default function Progress() {
  const [workouts, setWorkouts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedExercise, setSelectedExercise] = useState('')

  useEffect(() => {
    api.getWorkouts().then(w => {
      setWorkouts(w)
      if (w.length > 0) {
        const exercises = [...new Set(w.map(x => x.exercise))]
        setSelectedExercise(exercises[0])
      }
    }).finally(() => setLoading(false))
  }, [])

  const exercises = useMemo(() => [...new Set(workouts.map(w => w.exercise))].sort(), [workouts])

  const exerciseData = useMemo(() => {
    if (!selectedExercise) return []
    return workouts
      .filter(w => w.exercise === selectedExercise)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      .map(w => ({
        date: new Date(w.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        weight: Number(w.weight),
        volume: w.sets * w.reps * Number(w.weight),
        sets: w.sets,
        reps: w.reps,
        rawDate: w.created_at
      }))
  }, [workouts, selectedExercise])

  // Mark PRs — each point that's the highest weight seen so far
  const dataWithPR = useMemo(() => {
    let maxSoFar = 0
    return exerciseData.map(d => {
      const isPR = d.weight > maxSoFar
      if (isPR) maxSoFar = d.weight
      return { ...d, isPR }
    })
  }, [exerciseData])

  const pr = exerciseData.length ? Math.max(...exerciseData.map(d => d.weight)) : 0
  const totalSessions = exerciseData.length
  const totalVolume = exerciseData.reduce((s, d) => s + d.volume, 0)
  const avgWeight = exerciseData.length
    ? (exerciseData.reduce((s, d) => s + d.weight, 0) / exerciseData.length).toFixed(1)
    : 0

  // Progress streak: consecutive improvement
  const lastPRDate = dataWithPR.filter(d => d.isPR).at(-1)?.date

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: ORANGE, borderTopColor: 'transparent' }} />
    </div>
  )

  if (workouts.length === 0) return (
    <div className="flex flex-col items-center justify-center h-full text-zinc-600 gap-3">
      <p className="text-5xl">📈</p>
      <p className="text-lg">No workout data yet.</p>
      <p className="text-sm">Log some workouts to see your progress here.</p>
    </div>
  )

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Progress</h1>
        <p className="text-zinc-500 text-sm mt-1">Track your PRs and overload over time</p>
      </div>

      {/* Exercise selector */}
      <div className="mb-6">
        <label className="text-xs text-zinc-500 mb-2 block uppercase tracking-wider">Exercise</label>
        <div className="flex flex-wrap gap-2">
          {exercises.map(ex => (
            <button
              key={ex}
              onClick={() => setSelectedExercise(ex)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors capitalize ${
                selectedExercise === ex ? 'text-black' : 'bg-white/5 text-zinc-400 hover:text-white'
              }`}
              style={selectedExercise === ex ? { backgroundColor: ORANGE } : {}}
            >
              {ex}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Personal Record" value={`${pr} kg`} sub={lastPRDate ? `Set on ${lastPRDate}` : ''} />
        <StatCard label="Avg Weight" value={`${avgWeight} kg`} />
        <StatCard label="Total Sessions" value={totalSessions} />
        <StatCard label="Total Volume" value={`${(totalVolume / 1000).toFixed(1)}t`} sub="kg lifted" />
      </div>

      {exerciseData.length < 2 ? (
        <div className="bg-[#111] border border-white/5 rounded-2xl p-10 text-center text-zinc-600">
          <p>Log at least 2 {selectedExercise} sessions to see trend lines.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Weight over time */}
          <div className="bg-[#111] border border-white/5 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-sm font-semibold text-white capitalize">{selectedExercise} — Max Weight</h2>
                <p className="text-xs text-zinc-500 mt-0.5">Orange dots = personal records</p>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ORANGE }} />
                <span className="text-xs text-zinc-500">PR</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={dataWithPR}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                <XAxis dataKey="date" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} unit="kg" width={45} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="weight"
                  name="Weight"
                  stroke={ORANGE}
                  strokeWidth={2.5}
                  dot={({ cx, cy, payload }) => (
                    payload.isPR
                      ? <circle key={`dot-${cx}`} cx={cx} cy={cy} r={5} fill={ORANGE} stroke="#0a0a0a" strokeWidth={2} />
                      : <circle key={`dot-${cx}`} cx={cx} cy={cy} r={3} fill="#333" stroke={ORANGE} strokeWidth={1.5} />
                  )}
                  activeDot={{ r: 6, fill: ORANGE, stroke: '#0a0a0a', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Volume over time */}
          <div className="bg-[#111] border border-white/5 rounded-2xl p-6">
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-white capitalize">{selectedExercise} — Session Volume</h2>
              <p className="text-xs text-zinc-500 mt-0.5">Sets × Reps × Weight per session</p>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={dataWithPR}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                <XAxis dataKey="date" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} unit="kg" width={50} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="volume"
                  name="Volume"
                  stroke="#ff9a4d"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#ff9a4d', strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: '#ff9a4d' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* PR history table */}
          <div className="bg-[#111] border border-white/5 rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-white mb-4">PR Timeline</h2>
            <div className="flex flex-col gap-2">
              {dataWithPR.filter(d => d.isPR).reverse().map((d, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold">{d.weight} kg</span>
                    {i === 0 && <PRBadge />}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-zinc-400">{d.sets}×{d.reps}</p>
                    <p className="text-xs text-zinc-600">{d.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
