import React, { useState, useEffect, useCallback } from "react";

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
        color: "#f1f5f9",
        fontFamily: "sans-serif",
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
        <div style={{ marginTop: "1.5rem", maxWidth: 600, width: "100%", margin: "1.5rem auto 0" }}>
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
                background: "#000",
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
  const [currentPath, setCurrentPath] = useState(
    typeof window !== "undefined" ? window.location.pathname : "/",
  );

  const fetchLockdown = useCallback(async () => {
    try {
      const res = await fetch(`/lockdown.json?_=${Date.now()}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        setLockdown(data);
      }
    } catch (e) {
      console.error("Saturn: Failed to fetch lockdown status");
    }
  }, []);

  useEffect(() => {
    fetchLockdown();
    const iv = setInterval(fetchLockdown, POLL_INTERVAL);

    // Polling rute sebagai ganti monkeypatching history agar aman dari blank screen
    const pathIv = setInterval(() => {
      if (
        typeof window !== "undefined" &&
        window.location.pathname !== currentPath
      ) {
        setCurrentPath(window.location.pathname);
      }
    }, 1000);

    return () => {
      clearInterval(iv);
      clearInterval(pathIv);
    };
  }, [fetchLockdown, currentPath]);

  // Jika tidak ada data lockdown atau tidak aktif, render aplikasi normal
  if (!lockdown || !lockdown.active) return <>{children}</>;

  // 1. Full lockdown
  if (
    lockdown.lockdownAll ||
    !lockdown.routes ||
    lockdown.routes.length === 0
  ) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "#0f172a",
          zIndex: 99999,
          overflow: "auto",
        }}
      >
        <LockdownScreen reason={lockdown.reason} mediaUrl={lockdown.mediaUrl} />
      </div>
    );
  }

  // 2. Route-specific lockdown
  const isRouteLocked =
    Array.isArray(lockdown.routes) &&
    lockdown.routes.some((route) => {
      if (!route) return false;
      const normalizedRoute = route.startsWith("/") ? route : `/${route}`;
      return (
        currentPath === normalizedRoute ||
        currentPath.startsWith(normalizedRoute + "/")
      );
    });

  if (isRouteLocked) {
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
            background: "rgba(15, 23, 42, 0.9)",
            backdropFilter: "blur(12px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            fontFamily: "sans-serif",
          }}
        >
          <div
            style={{
              background: "#1e293b",
              borderRadius: 24,
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
              maxWidth: 500,
              width: "100%",
            }}
          >
            <LockdownScreen
              reason={lockdown.reason}
              mediaUrl={lockdown.mediaUrl}
            />
          </div>
        </div>
      </>
    );
  }

  return <>{children}</>;
}
