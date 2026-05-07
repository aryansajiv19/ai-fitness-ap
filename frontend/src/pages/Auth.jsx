import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

export default function Auth() {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        const data = await api.login(email, password);
        localStorage.setItem('token', data.token);
        localStorage.setItem('ascend_user', JSON.stringify({
          email,
          userId: data.userId,
          username: email.split('@')[0],
          streak: 0,
        }));
        navigate('/dashboard');
      } else {
        await api.signup(email, password);
        setMode('login');
        setError('Account created — sign in below');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="ambient">
        <div className="glow g1" />
        <div className="glow g2" />
      </div>
      <div className="grain">
        <svg xmlns="http://www.w3.org/2000/svg">
          <filter id="grain-filter">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
            <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.6 0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#grain-filter)" />
        </svg>
      </div>

      <div style={{ position: 'relative', zIndex: 10, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="auth-wrap page-enter">
          <div className="auth-mark">ASCEND<span className="dot">.</span></div>
          <div className="auth-deck">Your AI-powered training coach.</div>

          <div className="auth-tabs">
            <button
              className={`auth-tab${mode === 'login' ? ' active' : ''}`}
              onClick={() => { setMode('login'); setError(''); }}
            >
              Sign In
            </button>
            <button
              className={`auth-tab${mode === 'signup' ? ' active' : ''}`}
              onClick={() => { setMode('signup'); setError(''); }}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={submit}>
            <div className="field">
              <label>Email</label>
              <input
                type="email"
                placeholder="you@somewhere.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <p className={error.includes('created') ? 'success-msg' : 'error-msg'}>{error}</p>
            )}

            <button type="submit" className="btn" disabled={loading}>
              {loading ? 'Please wait…' : 'Continue'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
