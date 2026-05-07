import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';

const MUSCLES = ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'legs', 'core'];

function swatchColor(pct) {
  if (pct >= 70) return '#ff6500';
  if (pct >= 40) return '#facc15';
  return '#ef4444';
}

function AnimatedCount({ target, format = 'compact' }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const dur = 1400;
    const start = performance.now();
    function frame(now) {
      const t = Math.min((now - start) / dur, 1);
      const e = 1 - Math.pow(1 - t, 3);
      const v = target * e;
      setVal(format === 'int' ? Math.round(v) : Math.round(v));
      if (t < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }, [target]);
  return format === 'compact'
    ? <>{val.toLocaleString('en-US')}</>
    : <>{Math.round(val)}</>;
}

export default function Dashboard() {
  const [workouts, setWorkouts] = useState([]);
  const [recovery, setRecovery] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getWorkouts(), api.getRecovery()])
      .then(([w, r]) => { setWorkouts(w); setRecovery(r); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="loading-center"><div className="spin" /></div>
  );

  const totalVolume = workouts.reduce((s, w) => s + w.sets * w.reps * Number(w.weight), 0);
  const weekSessions = workouts.filter(w => new Date(w.created_at) > new Date(Date.now() - 7 * 86400000)).length;
  const prWeight = workouts.length ? Math.max(...workouts.map(w => Number(w.weight))) : 0;
  const avgRecovery = MUSCLES.length
    ? Math.round(MUSCLES.reduce((s, m) => s + (recovery[m] || 100), 0) / MUSCLES.length)
    : 100;

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });

  const recList = MUSCLES
    .map(m => ({ name: m, pct: Math.round(recovery[m] ?? 100) }))
    .sort((a, b) => b.pct - a.pct);

  function formatDate(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short' });
  }

  return (
    <div className="page-enter">
      <div className="page-head">
        <div>
          <div className="page-eyebrow"><span className="num">01</span>Dashboard</div>
          <h1 className="page-title">Here's how you're <em>doing.</em></h1>
        </div>
        <div className="page-aside">{today}</div>
      </div>

      <div className="stats-row">
        <div className="stat">
          <div className="lbl">Best Lift · PR</div>
          <div className="val">
            <AnimatedCount target={prWeight} /><span className="unit">KG</span>
          </div>
          <div className="delta"><span className="arrow">↗</span>All-time personal record</div>
        </div>
        <div className="stat">
          <div className="lbl">Total Volume · Lifetime</div>
          <div className="val">
            <AnimatedCount target={Math.round(totalVolume)} /><span className="unit">KG</span>
          </div>
          <div className="delta"><span className="arrow">↗</span>Across {workouts.length} sessions</div>
        </div>
        <div className="stat">
          <div className="lbl">Sessions · This Week</div>
          <div className="val">
            <AnimatedCount target={weekSessions} format="int" /><span className="frac">/{weekSessions + 1}</span>
          </div>
          <div className="delta"><span className="arrow">↗</span>Keep the streak going</div>
        </div>
      </div>

      <div className="dash-grid">
        <div>
          <div className="sub-title">Recent <em>sessions.</em></div>
          {workouts.length === 0 ? (
            <div className="empty-state">
              No workouts yet. <Link to="/log" style={{ color: 'var(--accent)' }}>Log your first one.</Link>
            </div>
          ) : (
            <div className="workout-list">
              {workouts.slice(0, 5).map((w, i) => (
                <div key={w.id} className="wo">
                  <div className="wo-num">{String(workouts.length - i).padStart(2, '0')}</div>
                  <div>
                    <div className="wo-name" style={{ textTransform: 'capitalize' }}>{w.exercise}</div>
                    <div className="wo-detail">
                      {w.sets}×{w.reps} <span className="sep">·</span> {w.weight}KG
                    </div>
                    <div className="wo-tag">▸ {(w.muscle_group || '').toUpperCase()}</div>
                  </div>
                  <div className="wo-meta">
                    <div className="vol">{(w.sets * w.reps * Number(w.weight)).toLocaleString()} kg</div>
                    <div className="date">{formatDate(w.created_at)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="sub-title">Muscle <em>recovery.</em></div>
          <div className="rec-list">
            {recList.map(({ name, pct }) => {
              const color = swatchColor(pct);
              return (
                <div key={name} className="rec-row">
                  <span className="rec-swatch" style={{ background: color, color }} />
                  <span className="rec-name">{name}</span>
                  <span className="rec-pct" style={{ color }}>{pct}%</span>
                </div>
              );
            })}
          </div>
          <div className="rec-bar">
            <div className="lbl">Composite Readiness</div>
            <div className="composite">
              <AnimatedCount target={avgRecovery} format="int" /><span className="of">/100</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
