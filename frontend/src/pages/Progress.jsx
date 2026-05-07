import { useEffect, useState, useMemo } from 'react';
import { api } from '../lib/api';

function buildChartPoints(data, width = 740, height = 160, padX = 40) {
  if (data.length < 2) return { pts: [], prIdxs: [] };
  const weights = data.map(d => d.weight);
  const minW = Math.min(...weights);
  const maxW = Math.max(...weights);
  const range = maxW - minW || 1;
  const xs = data.map((_, i) => padX + (i / (data.length - 1)) * (width - padX * 2));
  const ys = data.map(d => height - 20 - ((d.weight - minW) / range) * (height - 40));
  const pts = xs.map((x, i) => `${x},${ys[i]}`).join(' ');
  const prIdxs = [];
  let maxSoFar = 0;
  data.forEach((d, i) => {
    if (d.weight > maxSoFar) { maxSoFar = d.weight; prIdxs.push(i); }
  });
  return { pts, xs, ys, prIdxs };
}

export default function Progress() {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExercise, setSelectedExercise] = useState('');

  useEffect(() => {
    api.getWorkouts()
      .then(w => {
        setWorkouts(w);
        if (w.length > 0) {
          const exs = [...new Set(w.map(x => x.exercise))];
          setSelectedExercise(exs[0]);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const exercises = useMemo(() => [...new Set(workouts.map(w => w.exercise))].sort(), [workouts]);

  const exerciseData = useMemo(() => {
    if (!selectedExercise) return [];
    return workouts
      .filter(w => w.exercise === selectedExercise)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      .map(w => ({
        date: new Date(w.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase(),
        weight: Number(w.weight),
        volume: w.sets * w.reps * Number(w.weight),
        sets: w.sets,
        reps: w.reps,
      }));
  }, [workouts, selectedExercise]);

  const prRecords = useMemo(() => {
    let maxSoFar = 0;
    return exerciseData
      .map(d => { const isPR = d.weight > maxSoFar; if (isPR) maxSoFar = d.weight; return { ...d, isPR }; })
      .filter(d => d.isPR)
      .reverse();
  }, [exerciseData]);

  const pr = exerciseData.length ? Math.max(...exerciseData.map(d => d.weight)) : 0;
  const avgWeight = exerciseData.length
    ? (exerciseData.reduce((s, d) => s + d.weight, 0) / exerciseData.length).toFixed(1)
    : 0;
  const totalVolume = exerciseData.reduce((s, d) => s + d.volume, 0);

  const { pts, xs, ys, prIdxs } = useMemo(() => {
    if (exerciseData.length < 2) return { pts: '', xs: [], ys: [], prIdxs: [] };
    return buildChartPoints(exerciseData);
  }, [exerciseData]);

  if (loading) return <div className="loading-center"><div className="spin" /></div>;

  if (workouts.length === 0) return (
    <div className="page-enter">
      <div className="page-head">
        <div>
          <div className="page-eyebrow"><span className="num">06</span>Progress</div>
          <h1 className="page-title">PRs &amp; <em>overload.</em></h1>
        </div>
      </div>
      <div className="empty-state">Log workouts to see your progress here.</div>
    </div>
  );

  return (
    <div className="page-enter">
      <div className="page-head">
        <div>
          <div className="page-eyebrow"><span className="num">06</span>Progress</div>
          <h1 className="page-title">PRs &amp; <em>overload.</em></h1>
        </div>
        <div className="page-aside">Last 90 days</div>
      </div>

      <div className="ex-tabs">
        {exercises.map(ex => (
          <button
            key={ex}
            className={`ex-tab${selectedExercise === ex ? ' active' : ''}`}
            onClick={() => setSelectedExercise(ex)}
            style={{ textTransform: 'capitalize' }}
          >
            {ex}
          </button>
        ))}
      </div>

      <div className="stats-row" style={{ marginBottom: 40 }}>
        <div className="stat">
          <div className="lbl">Personal Record</div>
          <div className="val">{pr}<span className="unit">KG</span></div>
          <div className="delta">
            {prRecords[0] ? `Set ${prRecords[0].date}` : 'No PRs yet'}
          </div>
        </div>
        <div className="stat">
          <div className="lbl">Avg Weight</div>
          <div className="val">{avgWeight}<span className="unit">KG</span></div>
          <div className="delta">Across {exerciseData.length} sessions</div>
        </div>
        <div className="stat">
          <div className="lbl">Total Volume</div>
          <div className="val">{(totalVolume / 1000).toFixed(1)}<span className="unit">T</span></div>
          <div className="delta">Lifetime, this lift</div>
        </div>
      </div>

      {exerciseData.length >= 2 && (
        <div className="chart-card">
          <div className="chart-card-head">
            <div className="chart-card-title" style={{ textTransform: 'capitalize' }}>
              {selectedExercise} · <em>max weight.</em>
            </div>
            <div className="chart-card-aside">Orange = personal records</div>
          </div>

          <svg className="chart-svg" viewBox="0 0 800 240" preserveAspectRatio="none">
            <line className="axis" x1="40" y1="200" x2="780" y2="200" />
            <line className="gridline" x1="40" y1="40" x2="780" y2="40" />
            <line className="gridline" x1="40" y1="100" x2="780" y2="100" />
            <line className="gridline" x1="40" y1="160" x2="780" y2="160" />

            {exerciseData.length > 1 && xs && (
              <>
                {xs.slice(0, Math.max(1, Math.floor(xs.length / 4))).map((x, i) => (
                  <text key={i} x={xs[i * Math.floor(xs.length / 4)] || xs[0]} y="225" className="tick-label" textAnchor="middle">
                    {exerciseData[i * Math.floor(exerciseData.length / 4)]?.date.slice(0, 6)}
                  </text>
                ))}
                <text x={xs[xs.length - 1]} y="225" className="tick-label" textAnchor="middle">NOW</text>
              </>
            )}

            {pts && <polyline className="line" fill="none" points={pts} />}

            {xs && xs.map((x, i) => (
              <circle
                key={i}
                className={`pt${prIdxs.includes(i) ? ' pr' : ''}`}
                cx={x}
                cy={ys[i]}
                style={{ animationDelay: `${0.5 + i * 0.08}s` }}
              />
            ))}
          </svg>
        </div>
      )}

      <div className="chart-card">
        <div className="chart-card-head">
          <div className="chart-card-title">PR <em>timeline.</em></div>
          <div className="chart-card-aside">{prRecords.length} record{prRecords.length !== 1 ? 's' : ''} this lift</div>
        </div>
        {prRecords.length === 0 ? (
          <div className="empty-state" style={{ padding: '40px 0' }}>Log more sessions to set PRs</div>
        ) : (
          <div className="pr-list">
            {prRecords.map((d, i) => (
              <div key={i} className="pr-row">
                <div className="pr-weight">
                  {d.weight} kg
                  {i === 0 && <em>LATEST PR</em>}
                </div>
                <div className="pr-sets">{d.sets} × {d.reps}</div>
                <div className="pr-date">{d.date}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
