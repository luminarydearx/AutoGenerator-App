// LockdownCheck.jsx — AutoGenerator-App
// ─────────────────────────────────────────────────────────────────────────────
// CARA PAKAI:
//   Wrap seluruh App.jsx dengan <LockdownCheck>
//   import LockdownCheck from './components/LockdownCheck';
//
// CARA KERJA:
//   - Fetch /lockdown.json setiap mount
//   - Jika active=true dan routes=[]:   FULL lockdown → semua halaman kena
//   - Jika active=true dan routes=["/cv", "/surat-lamaran"]:
//       ROUTE lockdown → hanya path yang cocok kena, yang lain bebas
//   - Navbar TIDAK pernah kena lockdown (hanya konten halaman)
//
// CONTOH INTEGRASI ROUTE LOCKDOWN DI APP.JSX:
//   <LockdownCheck currentPath={location.pathname}>
//     <Routes>...</Routes>
//   </LockdownCheck>
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react';

function matchRoute(lockdownRoutes, currentPath) {
  if (!lockdownRoutes || lockdownRoutes.length === 0) return true; // full lockdown
  return lockdownRoutes.some(r => {
    const clean = r.replace(/\/$/, '');
    const path  = (currentPath || '/').replace(/\/$/, '') || '/';
    return path === clean || path.startsWith(clean + '/');
  });
}

export default function LockdownCheck({ children, currentPath }) {
  const [state, setState] = useState({ checked: false, active: false, data: null });

  useEffect(() => {
    fetch('/lockdown.json?_=' + Date.now(), { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(d => setState({ checked: true, active: !!d?.active, data: d }))
      .catch(() => setState({ checked: true, active: false, data: null }));
  }, []);

  // Not yet checked — render children normally (avoids flash)
  if (!state.checked) return children;

  // Not locked — render normally
  if (!state.active) return children;

  // Locked — check if this route is affected
  const path = currentPath || (typeof window !== 'undefined' ? window.location.pathname : '/');
  const affected = matchRoute(state.data?.routes, path);

  if (!affected) return children; // This route is NOT locked

  // Show lockdown screen
  const d = state.data;
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 99990,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0a0a14 0%, #0d0d1f 50%, #0a0a14 100%)',
      fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
      padding: 24, textAlign: 'center',
      minHeight: '100vh',
    }}>
      {/* Animated rings */}
      <div style={{ position: 'relative', width: 120, height: 120, marginBottom: 32 }}>
        {[0,1,2].map(i => (
          <div key={i} style={{
            position: 'absolute', inset: i * 16,
            borderRadius: '50%',
            border: '1px solid rgba(124,58,237,' + (0.4 - i * 0.1) + ')',
            animation: `lockPulse ${2 + i * 0.5}s ease-in-out infinite`,
          }} />
        ))}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          background: 'rgba(124,58,237,.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '1px solid rgba(124,58,237,.4)',
        }}>
          <span style={{ fontSize: 36 }}>🔒</span>
        </div>
      </div>

      {/* Media */}
      {d?.mediaUrl && (
        <div style={{ marginBottom: 24, borderRadius: 16, overflow: 'hidden',
          maxWidth: 480, width: '100%', border: '1px solid rgba(124,58,237,.2)' }}>
          {/\.(mp4|webm|mov)/i.test(d.mediaUrl)
            ? <video src={d.mediaUrl} autoPlay muted loop style={{ width: '100%', maxHeight: 260, objectFit: 'cover' }} />
            : <img src={d.mediaUrl} alt="" style={{ width: '100%', maxHeight: 260, objectFit: 'cover' }} />}
        </div>
      )}

      <h1 style={{ margin: '0 0 8px', fontSize: 28, fontWeight: 800,
        color: '#fff', letterSpacing: '-0.02em' }}>
        {d?.routes?.length > 0 ? 'Fitur Dalam Perbaikan' : 'Sedang Maintenance'}
      </h1>

      {d?.routes?.length > 0 && (
        <p style={{ margin: '0 0 16px', fontSize: 13, color: 'rgba(255,255,255,.4)' }}>
          Halaman lain masih dapat diakses
        </p>
      )}

      {d?.reason && (
        <p style={{
          margin: '0 0 24px', fontSize: 15, lineHeight: 1.65,
          color: 'rgba(255,255,255,.7)', maxWidth: 440,
        }}>
          {d.reason}
        </p>
      )}

      {d?.timestamp && (
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,.3)' }}>
          Sejak {new Date(d.timestamp).toLocaleString('id-ID')}
        </p>
      )}

      <style>{`
        @keyframes lockPulse {
          0%,100% { opacity: .5; transform: scale(1); }
          50%      { opacity: 1;  transform: scale(1.04); }
        }
      `}</style>
    </div>
  );
}
