import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { io } from 'socket.io-client';

export default function LeaderboardPage() {
  const { id } = useParams();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [challengeId, setChallengeId] = useState(id || null);
  const [challenges, setChallenges] = useState([]);

  const myEmail = (() => {
    try { return JSON.parse(localStorage.getItem('ascend_user') || '{}').email || ''; } catch { return ''; }
  })();

  useEffect(() => {
    if (!id) {
      api.getChallenges()
        .then(cs => {
          setChallenges(cs);
          if (cs.length > 0) setChallengeId(String(cs[0].id));
        })
        .catch(() => {});
    }
  }, [id]);

  useEffect(() => {
    if (!challengeId) { setLoading(false); return; }
    setLoading(true);
    api.getLeaderboard(challengeId)
      .then(data => { setLeaderboard(data); setLastUpdate(new Date()); })
      .catch(() => {})
      .finally(() => setLoading(false));

    const socket = io({ path: '/socket.io' });
    socket.emit('join_challenge', challengeId);
    socket.on('leaderboard_update', (data) => {
      if (String(data.challengeId) === String(challengeId)) {
        setLeaderboard(data.leaderboard);
        setLastUpdate(new Date());
      }
    });
    return () => {
      socket.emit('leave_challenge', challengeId);
      socket.disconnect();
    };
  }, [challengeId]);

  if (loading) return <div className="loading-center"><div className="spin" /></div>;

  const updateTime = lastUpdate
    ? lastUpdate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
    : '';

  return (
    <div className="page-enter">
      <div className="page-head">
        <div>
          {id && (
            <div style={{ marginBottom: 12 }}>
              <Link to="/challenges" style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-dim)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                ← Challenges
              </Link>
            </div>
          )}
          <div className="page-eyebrow"><span className="num">05</span>Leaderboard</div>
          <h1 className="page-title">The <em>standings.</em></h1>
        </div>
        <div className="live-pill">
          <span className="live-dot" />
          Live{updateTime ? ` · updated ${updateTime}` : ''}
        </div>
      </div>

      {!id && challenges.length > 1 && (
        <div className="ex-tabs" style={{ marginBottom: 32 }}>
          {challenges.map(c => (
            <button
              key={c.id}
              className={`ex-tab${String(c.id) === challengeId ? ' active' : ''}`}
              onClick={() => setChallengeId(String(c.id))}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      {leaderboard.length === 0 ? (
        <div className="empty-state">
          {challengeId ? 'No participants yet. Join a challenge and log workouts to appear here.' : 'No challenges found. Create one first.'}
        </div>
      ) : (
        <div className="lb-list">
          {leaderboard.map((entry, i) => {
            const isMe = entry.email === myEmail;
            const rankStr = String(i + 1).padStart(2, '0');
            return (
              <div key={entry.user_id} className={`lb-row${i === 0 ? ' top' : ''}`}>
                <div className="lb-rank">{rankStr}</div>
                <div>
                  <div className="lb-name">
                    {entry.email?.split('@')[0] || 'Unknown'}
                    {isMe && (
                      <span style={{ color: 'var(--accent)', fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.18em', marginLeft: 10 }}>YOU</span>
                    )}
                  </div>
                  <div className="lb-sub">{entry.email}</div>
                </div>
                <div className="lb-vol">
                  {Number(entry.total_volume || 0).toLocaleString()} kg
                </div>
                <div className="lb-best">
                  Best · {entry.best_weight || 0} kg
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
