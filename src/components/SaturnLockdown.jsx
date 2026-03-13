/**
 * Saturn Lockdown Guard for AutoGen (React/Vite)
 *
 * Place this file at: src/components/utils/SaturnLockdown.jsx
 *
 * Usage in App.jsx:
 *   import SaturnLockdown from './components/utils/SaturnLockdown';
 *
 *   function App() {
 *     return (
 *       <SaturnLockdown>
 *         <YourRoutes />
 *       </SaturnLockdown>
 *     );
 *   }
 *
 * How it works:
 * - Reads /lockdown.json from your public folder
 * - If `active: true` and `lockdownAll: true` → shows full lockdown screen
 * - If `active: true` and `routes: ["/cv", "/surat-lamaran"]` → only those routes show lockdown
 * - Navbar stays visible during route lockdown
 * - Polls every 30s for status changes
 */
import { useState, useEffect, useCallback } from "react";

const POLL_INTERVAL = 30000;

function LockdownScreen({ reason, mediaUrl }) {
  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          background:
            "linear-gradient(135deg, rgba(239,68,68,0.15), rgba(168,85,247,0.1))",
          border: "2px solid rgba(239,68,68,0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "1.5rem",
          fontSize: "2rem",
        }}
      >
        🔒
      </div>
      <h2
        style={{
          fontSize: "1.5rem",
          fontWeight: 800,
          marginBottom: "0.5rem",
          background: "linear-gradient(135deg, #ef4444, #a855f7)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        LOCKDOWN MODE
      </h2>
      <p
        style={{
          color: "#94a3b8",
          fontSize: "0.875rem",
          marginBottom: "1rem",
          maxWidth: 400,
        }}
      >
        Halaman ini sedang dalam pemeliharaan dan tidak dapat diakses sementara.
      </p>
      {reason && (
        <div
          style={{
            padding: "0.75rem 1.5rem",
            borderRadius: 12,
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.2)",
            maxWidth: 400,
            marginBottom: "1rem",
          }}
        >
          <p
            style={{
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "#f87171",
              marginBottom: 4,
            }}
          >
            Alasan:
          </p>
          <p style={{ fontSize: "0.875rem", color: "#e2e8f0" }}>{reason}</p>
        </div>
      )}
      {mediaUrl && (
        <div style={{ marginTop: "1rem", maxWidth: 600, width: "100%" }}>
          {mediaUrl.match(/\.(mp4|webm|ogg|mov)$|video\/upload/) ? (
            <video
              src={mediaUrl}
              autoPlay
              muted
              loop
              playsInline
              style={{
                width: "100%",
                borderRadius: 16,
                border: "1px solid rgba(255,255,255,0.1)",
                boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
              }}
            />
          ) : (
            <img
              src={mediaUrl}
              alt="Maintenance"
              style={{
                width: "100%",
                borderRadius: 16,
                border: "1px solid rgba(255,255,255,0.1)",
                boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
              }}
            />
          )}
        </div>
      )}
      <p style={{ color: "#64748b", fontSize: "0.75rem", marginTop: "2rem" }}>
        Silakan coba lagi nanti atau hubungi administrator.
      </p>
    </div>
  );
}

export default function SaturnLockdown({ children }) {
  const [lockdown, setLockdown] = useState(null);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  const fetchLockdown = useCallback(async () => {
    try {
      const res = await fetch(`/lockdown.json?_=${Date.now()}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        setLockdown(data);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    fetchLockdown();
    const iv = setInterval(fetchLockdown, POLL_INTERVAL);
    return () => clearInterval(iv);
  }, [fetchLockdown]);

  // Listen for route changes
  useEffect(() => {
    const update = () => setCurrentPath(window.location.pathname);
    window.addEventListener("popstate", update);
    // Also observe for pushState/replaceState
    const origPush = history.pushState.bind(history);
    const origReplace = history.replaceState.bind(history);
    history.pushState = (...args) => {
      origPush(...args);
      update();
    };
    history.replaceState = (...args) => {
      origReplace(...args);
      update();
    };
    return () => {
      window.removeEventListener("popstate", update);
      history.pushState = origPush;
      history.replaceState = origReplace;
    };
  }, []);

  if (!lockdown || !lockdown.active) return children;

  // Full lockdown
  if (
    lockdown.lockdownAll ||
    !lockdown.routes ||
    lockdown.routes.length === 0
  ) {
    return (
      <LockdownScreen reason={lockdown.reason} mediaUrl={lockdown.mediaUrl} />
    );
  }

  // Route-specific lockdown: check if current path matches any locked route
  const isRouteLocked = lockdown.routes.some((route) => {
    const normalizedRoute = route.startsWith("/") ? route : `/${route}`;
    return (
      currentPath === normalizedRoute ||
      currentPath.startsWith(normalizedRoute + "/")
    );
  });

  if (isRouteLocked) {
    // For route lockdown, we render children (navbar) but replace route content
    // This requires wrapping the route content specifically
    // Since we can't control the router from here, we overlay
    return (
      <>
        {children}
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.85)",
            backdropFilter: "blur(8px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <LockdownScreen
            reason={lockdown.reason}
            mediaUrl={lockdown.mediaUrl}
          />
        </div>
      </>
    );
  }

  return children;
}
