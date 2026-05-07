const BASE = '/api'

function token() {
  return localStorage.getItem('token')
}

function headers(extra = {}) {
  const h = { 'Content-Type': 'application/json', ...extra }
  const t = token()
  if (t) h['Authorization'] = `Bearer ${t}`
  return h
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: headers(options.headers)
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

export const api = {
  signup: (email, password) =>
    request('/auth/signup', { method: 'POST', body: JSON.stringify({ email, password }) }),

  login: (email, password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  getWorkouts: () => request('/workouts'),

  createWorkout: (data) =>
    request('/workouts', { method: 'POST', body: JSON.stringify(data) }),

  deleteWorkout: (id) =>
    request(`/workouts/${id}`, { method: 'DELETE' }),

  searchWorkouts: (q) => request(`/workouts/search?q=${encodeURIComponent(q)}`),

  getRecovery: () => request('/recovery'),

  getChallenges: () => request('/challenges'),

  createChallenge: (data) =>
    request('/challenges', { method: 'POST', body: JSON.stringify(data) }),

  joinChallenge: (id) =>
    request(`/challenges/${id}/join`, { method: 'POST' }),

  getLeaderboard: (id) => request(`/leaderboard/${id}`),

  chat: (message) =>
    request('/chat', { method: 'POST', body: JSON.stringify({ message }) }),

  voiceLog: (text) =>
    request('/workouts/voice', { method: 'POST', body: JSON.stringify({ text }) }),
}

export async function chatStream(message, onChunk, onDone) {
  const res = await fetch(`${BASE}/chat`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ message, stream: true })
  })
  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop()
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const payload = line.slice(6)
        if (payload === '[DONE]') { onDone(); return }
        try {
          const { text } = JSON.parse(payload)
          onChunk(text)
        } catch {}
      }
    }
  }
  onDone()
}
