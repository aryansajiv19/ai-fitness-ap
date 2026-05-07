import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';

const MUSCLES = ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'legs', 'core'];
const AV_CLASSES = ['a1', 'a2', 'a3', 'a4'];

function progressOf(c) {
  if (!c.target_value || !c.user_score) return 0;
  return Math.min(100, Math.round((Number(c.user_score) / Number(c.target_value)) * 100));
}

function dayLabel(c) {
  if (!c.end_date) return '';
  const end = new Date(c.end_date);
  const now = new Date();
  const start = c.created_at ? new Date(c.created_at) : now;
  const total = Math.max(1, Math.round((end - start) / 86400000));
  const elapsed = Math.round((now - start) / 86400000);
  return `Day ${Math.max(1, elapsed)} / ${total}`;
}

export default function Challenges() {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '', description: '', challenge_type: 'volume',
    target_muscle: 'chest', end_date: '', target_value: '',
  });
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(null);
  const [error, setError] = useState('');
  const [fillReady, setFillReady] = useState(false);

  useEffect(() => {
    api.getChallenges()
      .then(setChallenges)
      .catch(() => {})
      .finally(() => {
        setLoading(false);
        setTimeout(() => setFillReady(true), 400);
      });
  }, []);

  async function join(id) {
    setJoining(id);
    try {
      await api.joinChallenge(id);
      const updated = await api.getChallenges();
      setChallenges(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setJoining(null);
    }
  }

  async function create(e) {
    e.preventDefault();
    setCreating(true); setError('');
    try {
      const c = await api.createChallenge({
        ...form,
        target_value: form.target_value ? Number(form.target_value) : undefined,
      });
      setChallenges(prev => [c, ...prev]);
      setShowForm(false);
      setForm({ name: '', description: '', challenge_type: 'volume', target_muscle: 'chest', end_date: '', target_value: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  }

  if (loading) return <div className="loading-center"><div className="spin" /></div>;

  return (
    <div className="page-enter">
      <div className="page-head">
        <div>
          <div className="page-eyebrow"><span className="num">04</span>Challenges</div>
          <h1 className="page-title">Compete with <em>others.</em></h1>
        </div>
        <button className="ch-create-toggle" onClick={() => setShowForm(v => !v)}>
          {showForm ? '✕ Cancel' : '+ Create'}
        </button>
      </div>

      {showForm && (
        <div className="ch-create-form">
          <h2>New Challenge</h2>
          <form onSubmit={create}>
            <div className="field">
              <label>Challenge Name</label>
              <input
                type="text"
                placeholder="e.g. One Hundred Thousand Kilograms"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div className="field">
              <label>Description</label>
              <textarea
                rows={2}
                placeholder="What's the goal?"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="grid-3">
              <div className="field">
                <label>Type</label>
                <select value={form.challenge_type} onChange={e => setForm(f => ({ ...f, challenge_type: e.target.value }))}>
                  <option value="volume">Volume</option>
                  <option value="max_weight">Max Weight</option>
                </select>
              </div>
              <div className="field">
                <label>Muscle Group</label>
                <select value={form.target_muscle} onChange={e => setForm(f => ({ ...f, target_muscle: e.target.value }))}>
                  {MUSCLES.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Target (kg)</label>
                <input
                  type="number"
                  placeholder="100000"
                  value={form.target_value}
                  onChange={e => setForm(f => ({ ...f, target_value: e.target.value }))}
                />
              </div>
            </div>
            <div className="field">
              <label>End Date</label>
              <input
                type="date"
                value={form.end_date}
                onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
                required
              />
            </div>
            {error && <p className="error-msg">{error}</p>}
            <button type="submit" className="btn" disabled={creating}>
              {creating ? 'Creating…' : 'Create Challenge'}
            </button>
          </form>
        </div>
      )}

      {challenges.length === 0 ? (
        <div className="empty-state">No challenges yet. Create the first one.</div>
      ) : (
        <div className="ch-list">
          {challenges.map((c, idx) => {
            const pct = progressOf(c);
            return (
              <div key={c.id} className="ch-item">
                <div className="ch-head-row">
                  <div className="ch-tags">
                    <span className="live-dot" />
                    <span className="chip">{c.challenge_type?.replace('_', ' ')} · {c.target_muscle}</span>
                  </div>
                  <div className="ch-days">{dayLabel(c)}</div>
                </div>
                <div className="ch-name">{c.name || 'Untitled Challenge'}</div>
                {c.description && <div className="ch-desc">{c.description}</div>}
                <div className="ch-progress-wrap">
                  <div className="ch-bar">
                    <div className="ch-fill" style={{ width: fillReady ? `${pct}%` : '0%' }} />
                  </div>
                  <div className="ch-prog-meta">
                    <span>
                      {c.user_score ? Number(c.user_score).toLocaleString() : '0'}
                      {c.target_value ? ` / ${Number(c.target_value).toLocaleString()} KG` : ''}
                    </span>
                    <span className="pct-big">{pct}%</span>
                  </div>
                </div>
                <div className="ch-foot-row">
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div className="avatars">
                      {[0,1,2,3].map(i => (
                        <div key={i} className={`av ${AV_CLASSES[i]}`}>{String.fromCharCode(65 + (idx + i) % 26)}</div>
                      ))}
                    </div>
                    <Link
                      to={`/challenges/${c.id}/leaderboard`}
                      style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--fg-dim)', letterSpacing: '0.1em', textTransform: 'uppercase' }}
                    >
                      View board →
                    </Link>
                  </div>
                  <button
                    className="ch-create-toggle"
                    style={{ padding: '8px 16px', fontSize: 10 }}
                    disabled={joining === c.id}
                    onClick={() => join(c.id)}
                  >
                    {joining === c.id ? '…' : 'Join'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
