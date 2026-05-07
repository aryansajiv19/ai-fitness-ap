import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../lib/api'
import { io } from 'socket.io-client'

export default function LeaderboardPage() {
  const { id } = useParams()
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(null)

  useEffect(() => {
    api.getLeaderboard(id).then(setLeaderboard).finally(() => setLoading(false))

    const socket = io({ path: '/socket.io' })
    socket.emit('join_challenge', id)
    socket.on('leaderboard_update', (data) => {
      if (String(data.challengeId) === String(id)) {
        setLeaderboard(data.leaderboard)
        setLastUpdate(new Date())
      }
    })
    return () => {
      socket.emit('leave_challenge', id)
      socket.disconnect()
    }
  }, [id])

  const medal = ['🥇', '🥈', '🥉']

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-6 h-6 border-2 border-[#c8ff2e] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-8">
        <Link to="/challenges" className="text-zinc-500 text-sm hover:text-white mb-2 inline-block">← Challenges</Link>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Leaderboard</h1>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#c8ff2e] rounded-full animate-pulse" />
            <span className="text-xs text-zinc-500">Live</span>
          </div>
        </div>
        {lastUpdate && (
          <p className="text-xs text-zinc-600 mt-1">Updated {lastUpdate.toLocaleTimeString()}</p>
        )}
      </div>

      {leaderboard.length === 0 ? (
        <div className="text-center py-16 text-zinc-600">
          <p className="text-4xl mb-3">🏆</p>
          <p>No participants yet. Join and log workouts to appear here!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {leaderboard.map((entry, i) => (
            <div
              key={entry.user_id}
              className={`bg-[#111] border rounded-2xl p-5 flex items-center gap-4 ${
                i === 0 ? 'border-[#c8ff2e]/30' : 'border-white/5'
              }`}
            >
              <div className="text-2xl w-8 text-center">{medal[i] || `${i + 1}`}</div>
              <div className="flex-1">
                <p className="text-white font-medium">{entry.email}</p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Best: {entry.best_weight}kg &nbsp;·&nbsp; Volume: {Number(entry.total_volume).toLocaleString()}kg
                </p>
              </div>
              {i === 0 && (
                <div className="text-xs font-bold px-2 py-1 rounded-full text-black" style={{ backgroundColor: '#c8ff2e' }}>
                  #1
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
