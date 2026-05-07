import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import WorkoutLogger from './pages/WorkoutLogger'
import ChatPage from './pages/ChatPage'
import Challenges from './pages/Challenges'
import LeaderboardPage from './pages/LeaderboardPage'
import Progress from './pages/Progress'
import Layout from './components/Layout'

function PrivateRoute({ children }) {
  return localStorage.getItem('token') ? children : <Navigate to="/auth" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="log" element={<WorkoutLogger />} />
        <Route path="chat" element={<ChatPage />} />
        <Route path="challenges" element={<Challenges />} />
        <Route path="challenges/:id/leaderboard" element={<LeaderboardPage />} />
        <Route path="progress" element={<Progress />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
