import { useState } from 'react';
import { api } from '../lib/api';

const MUSCLES = ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Legs', 'Core'];

export default function WorkoutLogger() {
  const [tab, setTab] = useState('manual');
  const [form, setForm] = useState({ exercise: '', sets: '', reps: '', weight: '' });
  const [muscle, setMuscle] = useState('Chest');
  const [voice, setVoice] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [parsed, setParsed] = useState(null);

  function clearStatus() { setSuccess(''); setError(''); }

  async function submitManual(e) {
    e.preventDefault();
    clearStatus(); setLoading(true);
    try {
      await api.createWorkout({
        exercise: form.exercise,
        sets: parseInt(form.sets),
        reps: parseInt(form.reps),
        weight: parseFloat(form.weight),
        muscle_group: muscle.toLowerCase(),
      });
      setSuccess('Workout logged successfully.');
      setForm({ exercise: '', sets: '', reps: '', weight: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function submitVoice(e) {
    e.preventDefault();
    clearStatus(); setParsed(null); setLoading(true);
    try {
      const data = await api.voiceLog(voice);
      setParsed(data.parsed);
      setSuccess('Workout parsed and logged.');
      setVoice('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-enter">
      <div className="page-head">
        <div>
          <div className="page-eyebrow"><span className="num">02</span>Log Workout</div>
          <h1 className="page-title">What did you <em>move?</em></h1>
        </div>
        <div className="page-aside">Manual or natural language</div>
      </div>

      <div className="form-wrap">
        <div className="log-tabs">
          <button
            className={`log-tab${tab === 'manual' ? ' active' : ''}`}
            onClick={() => { setTab('manual'); clearStatus(); }}
          >
            Manual
          </button>
          <button
            className={`log-tab${tab === 'voice' ? ' active' : ''}`}
            onClick={() => { setTab('voice'); clearStatus(); }}
          >
            Voice / Text
          </button>
        </div>

        {tab === 'manual' ? (
          <form onSubmit={submitManual}>
            <div className="field">
              <label>Exercise</label>
              <input
                type="text"
                placeholder="e.g. Bench Press"
                value={form.exercise}
                onChange={e => setForm(f => ({ ...f, exercise: e.target.value }))}
                required
              />
            </div>
            <div className="grid-3">
              <div className="field">
                <label>Sets</label>
                <input
                  type="number"
                  placeholder="5"
                  min="1"
                  value={form.sets}
                  onChange={e => setForm(f => ({ ...f, sets: e.target.value }))}
                  required
                />
              </div>
              <div className="field">
                <label>Reps</label>
                <input
                  type="number"
                  placeholder="5"
                  min="1"
                  value={form.reps}
                  onChange={e => setForm(f => ({ ...f, reps: e.target.value }))}
                  required
                />
              </div>
              <div className="field">
                <label>Weight (kg)</label>
                <input
                  type="number"
                  placeholder="82.5"
                  min="0"
                  step="0.5"
                  value={form.weight}
                  onChange={e => setForm(f => ({ ...f, weight: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="field">
              <label>Muscle Group</label>
              <div className="mg-chips">
                {MUSCLES.map(m => (
                  <button
                    key={m}
                    type="button"
                    className={`mg-chip${muscle === m ? ' active' : ''}`}
                    onClick={() => setMuscle(m)}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="error-msg">{error}</p>}
            {success && <p className="success-msg">{success}</p>}

            <button type="submit" className="btn" disabled={loading}>
              {loading ? 'Logging…' : 'Log Workout'}
            </button>
          </form>
        ) : (
          <form onSubmit={submitVoice}>
            <div className="field">
              <label>Describe your workout</label>
              <textarea
                rows={4}
                placeholder={'"bench press 3 sets of 10 at 80 kilos" or "squatted 100kg for 5x5"'}
                value={voice}
                onChange={e => setVoice(e.target.value)}
                required
              />
            </div>

            <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--fg-dim)', letterSpacing: '.16em', textTransform: 'uppercase', marginBottom: '16px' }}>
              ▸ Parsed by Claude Sonnet 4
            </div>

            {error && <p className="error-msg">{error}</p>}
            {success && <p className="success-msg">{success}</p>}

            {parsed && (
              <div className="parsed-result">
                <div className="pr-label">Parsed as</div>
                {Object.entries(parsed).map(([k, v]) => (
                  <div key={k} className="pr-item">
                    <span className="pr-key">{k}:</span>
                    <span className="pr-val">{String(v)}</span>
                  </div>
                ))}
              </div>
            )}

            <button type="submit" className="btn" disabled={loading}>
              {loading ? 'Parsing with AI…' : 'Parse & Log'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
