import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const MUSCLES = ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'legs', 'core']

function RecoveryBar({ muscle, pct }) {
  const color = pct >= 70 ? '#ff6500' : pct >= 40 ? '#facc15' : '#ef4444'
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="capitalize text-zinc-400">{muscle}</span>
        <span style={{ color }}>{pct}%</span>
      </div>
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
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

export default function Dashboard() {
  const [workouts, setWorkouts] = useState([])
  const [recovery, setRecovery] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.getWorkouts(), api.getRecovery()])
      .then(([w, r]) => { setWorkouts(w); setRecovery(r) })
      .finally(() => setLoading(false))
  }, [])

  const totalVolume = workouts.reduce((s, w) => s + w.sets * w.reps * w.weight, 0)
  const avgRecovery = MUSCLES.length
    ? Math.round(MUSCLES.reduce((s, m) => s + (recovery[m] || 0), 0) / MUSCLES.length)
    : 0

  const chartData = workouts.slice(0, 10).reverse().map(w => ({
    name: w.exercise?.slice(0, 8),
    volume: w.sets * w.reps * w.weight
  }))

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-6 h-6 border-2 border-[#ff6500] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-zinc-500 text-sm mt-1">Here's how you're doing</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Workouts" value={workouts.length} />
        <StatCard label="Total Volume" value={`${(totalVolume / 1000).toFixed(1)}t`} sub="kg lifted" />
        <StatCard label="Avg Recovery" value={`${avgRecovery}%`} />
        <StatCard label="This Week" value={workouts.filter(w => new Date(w.created_at) > new Date(Date.now() - 7 * 86400000)).length} sub="sessions" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Volume chart */}
        <div className="bg-[#111] border border-white/5 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Recent Volume</h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={chartData}>
                <XAxis dataKey="name" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 8 }}
                  labelStyle={{ color: '#fff' }}
                  itemStyle={{ color: '#ff6500' }}
                />
                <Bar dataKey="volume" fill="#ff6500" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-zinc-600 text-sm text-center py-10">Log workouts to see your volume chart</p>
          )}
        </div>

        {/* Recovery */}
        <div className="bg-[#111] border border-white/5 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Muscle Recovery</h2>
          <div className="flex flex-col gap-3">
            {MUSCLES.map(m => (
              <RecoveryBar key={m} muscle={m} pct={recovery[m] ?? 100} />
            ))}
          </div>
        </div>
      </div>

      {/* Recent workouts */}
      <div className="bg-[#111] border border-white/5 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-white">Recent Workouts</h2>
          <Link to="/log" className="text-xs text-[#ff6500] hover:underline">+ Log new</Link>
        </div>
        {workouts.length === 0 ? (
          <p className="text-zinc-600 text-sm text-center py-6">No workouts yet. <Link to="/log" className="text-[#ff6500]">Log your first one.</Link></p>
        ) : (
          <div className="flex flex-col gap-2">
            {workouts.slice(0, 6).map(w => (
              <div key={w.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div>
                  <p className="text-sm text-white font-medium capitalize">{w.exercise}</p>
                  <p className="text-xs text-zinc-500 capitalize">{w.muscle_group}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-white">{w.sets}×{w.reps} @ {w.weight}kg</p>
                  <p className="text-xs text-zinc-600">{new Date(w.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
