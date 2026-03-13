import { useState, useEffect, useCallback } from "react";

const POLL_INTERVAL = 30000;

function LockdownScreen({ reason, mediaUrl }) {
  return (
    <div style={{
      minHeight: "100vh",
      width: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem",
      textAlign: "center",
      background: "#0f172a",
      color: "#f1f5f9",
      fontFamily: "Inter, system-ui, sans-serif"
    }}>
      <div style={{
        width: 80,
        height: 80,
        borderRadius: "50%",
        background: "linear-gradient(135deg, rgba(239,68,68,0.15), rgba(168,85,247,0.1))",
        border: "2px solid rgba(239,68,68,0.3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: "1.5rem",
        fontSize: "2rem"
      }}>
        🔒
      </div>
      <h2 style={{
        fontSize: "1.5rem",
        fontWeight: 800,
        marginBottom: "0.5rem",
        background: "linear-gradient(135deg, #ef4444, #a855f7)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        letterSpacing: "1px"
      }}>
        LOCKDOWN MODE
      </h2>
      <p style={{ color: "#94a3b8", fontSize: "0.875rem", marginBottom: "1.5rem", maxWidth: 400 }}>
        Halaman ini sedang dalam pemeliharaan dan tidak dapat diakses sementara.
      </p>
      {reason && (
        <div style={{
          padding: "1rem 1.5rem",
          borderRadius: 16,
          background: "rgba(239,68,68,0.08)",
          border: "1px solid rgba(239,68,68,0.2)",
          maxWidth: 400,
          marginBottom: "1.5rem"
        }}>
          <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "#f87171", marginBottom: 4 }}>
            Alasan:
          </p>
          <p style={{ fontSize: "0.875rem", color: "#e2e8f0" }}>{reason}</p>
        </div>
      )}
      {mediaUrl && (
        <img src={mediaUrl} alt="Maintenance" style={{
          maxWidth: 400,
          width: "100%",
          borderRadius: 16,
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.4)"
        }} />
      )}
      <p style={{ color: "#64748b", fontSize: "0.75rem", marginTop: "2.5rem" }}>
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
      const res = await fetch(`/lockdown.json?_=${Date.now()}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setLockdown(data);
      }
    } catch (e) { /* ignore */ }
  }, []);

  useEffect(() => {
    fetchLockdown();
    const iv = setInterval(fetchLockdown, POLL_INTERVAL);
    return () => clearInterval(iv);
  }, [fetchLockdown]);

  // Listen for route changes in SPA
  useEffect(() => {
    const update = () => setCurrentPath(window.location.pathname);
    window.addEventListener("popstate", update);
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

  const isLockAll = lockdown.lockdownAll || !lockdown.routes || lockdown.routes.length === 0;

  if (isLockAll) {
    return <LockdownScreen reason={lockdown.reason} mediaUrl={lockdown.mediaUrl} />;
  }

  const isRouteLocked = lockdown.routes.some((route) => {
    const normalizedRoute = route.startsWith("/") ? route : `/${route}`;
    return currentPath === normalizedRoute || currentPath.startsWith(normalizedRoute + "/");
  });

  if (isRouteLocked) {
    return (
      <>
        {children}
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(15, 23, 42, 0.9)",
          backdropFilter: "blur(12px)",
          zIndex: 99999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem"
        }}>
          <div style={{
            background: "#1e293b",
            borderRadius: 24,
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
            maxWidth: 500,
            width: "100%",
            overflow: "hidden"
          }}>
            <LockdownScreen reason={lockdown.reason} mediaUrl={lockdown.mediaUrl} />
          </div>
        </div>
      </>
    );
  }

  return children;
}
