import { useEffect, useRef } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';

const NAV = [
  { num: '01', label: 'Dashboard', to: '/dashboard' },
  { num: '02', label: 'Log Workout', to: '/log' },
  { num: '03', label: 'AI Coach', to: '/chat' },
  { num: '04', label: 'Challenges', to: '/challenges' },
  { num: '05', label: 'Leaderboard', to: '/leaderboard' },
  { num: '06', label: 'Progress', to: '/progress' },
];

export default function Layout() {
  const navigate = useNavigate();
  const glowRef = useRef(null);
  const animRef = useRef(null);
  const mouse = useRef({ x: 0, y: 0 });
  const cur = useRef({ x: 0, y: 0 });

  const user = (() => {
    try { return JSON.parse(localStorage.getItem('ascend_user') || '{}'); } catch { return {}; }
  })();

  const email = user.email || '';
  const initials = email ? email.slice(0, 2).toUpperCase() : 'ME';
  const displayName = user.username || email.split('@')[0] || 'You';
  const streak = user.streak || 0;

  useEffect(() => {
    const onMove = (e) => { mouse.current.x = e.clientX; mouse.current.y = e.clientY; };
    document.addEventListener('mousemove', onMove);
    function loop() {
      cur.current.x += (mouse.current.x - cur.current.x) * 0.08;
      cur.current.y += (mouse.current.y - cur.current.y) * 0.08;
      if (glowRef.current) {
        glowRef.current.style.left = cur.current.x + 'px';
        glowRef.current.style.top = cur.current.y + 'px';
      }
      animRef.current = requestAnimationFrame(loop);
    }
    loop();
    return () => {
      document.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('ascend_user');
    navigate('/auth');
  }

  return (
    <>
      <div className="ambient">
        <div className="glow g1" />
        <div className="glow g2" />
      </div>
      <div className="cursor-glow" ref={glowRef} />
      <div className="grain">
        <svg xmlns="http://www.w3.org/2000/svg">
          <filter id="grain-filter">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
            <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.6 0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#grain-filter)" />
        </svg>
      </div>

      <div className="app">
        <aside className="nav">
          <div className="nav-mark">
            {'ASCEND'.split('').map((ch, i) => <span key={i} className="ch">{ch}</span>)}
            <span className="dot">.</span>
          </div>

          <nav className="nav-list">
            {NAV.map(({ num, label, to }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              >
                <span className="num">{num}</span>
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="nav-foot">
            <div className="nav-user" style={{ cursor: 'pointer' }} onClick={handleLogout} title="Click to sign out">
              <div className="nav-avatar">{initials}</div>
              <div className="meta">
                <div className="name">{displayName}</div>
                <div className="streak"><b>●</b> {streak}-day streak</div>
              </div>
            </div>
          </div>
        </aside>

        <main className="canvas">
          <Outlet />
        </main>
      </div>
    </>
  );
}
