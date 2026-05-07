import React from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'

const LIME = '#c8ff2e'

export default function Layout() {
  const navigate = useNavigate()

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    navigate('/auth')
  }

  const linkClass = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive ? 'text-[#c8ff2e] bg-[#c8ff2e]/10' : 'text-zinc-400 hover:text-white hover:bg-white/5'
    }`

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 bg-[#111] border-r border-white/5 flex flex-col py-6 px-3">
        <div className="mb-8 px-2">
          <span className="text-xl font-black tracking-tight" style={{ color: LIME }}>ASCEND</span>
        </div>
        <nav className="flex flex-col gap-1">
          <NavLink to="/" end className={linkClass}>
            <span>⚡</span> Dashboard
          </NavLink>
          <NavLink to="/log" className={linkClass}>
            <span>💪</span> Log Workout
          </NavLink>
          <NavLink to="/chat" className={linkClass}>
            <span>🤖</span> AI Coach
          </NavLink>
          <NavLink to="/challenges" className={linkClass}>
            <span>🏆</span> Challenges
          </NavLink>
        </nav>
        <div className="mt-auto">
          <button
            onClick={logout}
            className="w-full text-left px-3 py-2 text-sm text-zinc-500 hover:text-white transition-colors rounded-lg hover:bg-white/5"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto bg-[#0a0a0a]">
        <Outlet />
      </main>
    </div>
  )
}
