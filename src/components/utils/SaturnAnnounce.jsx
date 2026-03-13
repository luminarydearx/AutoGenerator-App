import React, { useState, useEffect, useCallback, useRef } from "react";

const STORAGE_KEY = "saturn_announce_dismissed";
const AUTO_CLOSE_MS = 15000;

const TYPE_STYLES = {
  info: {
    bg: "rgba(59,130,246,0.12)",
    border: "1px solid rgba(59,130,246,0.3)",
    icon: "ℹ️",
    color: "#60a5fa",
  },
  success: {
    bg: "rgba(34,197,94,0.12)",
    border: "1px solid rgba(34,197,94,0.3)",
    icon: "✅",
    color: "#4ade80",
  },
  warning: {
    bg: "rgba(245,158,11,0.12)",
    border: "1px solid rgba(245,158,11,0.3)",
    icon: "⚠️",
    color: "#fbbf24",
  },
  error: {
    bg: "rgba(239,68,68,0.12)",
    border: "1px solid rgba(239,68,68,0.3)",
    icon: "🚨",
    color: "#f87171",
  },
};

export default function SaturnAnnounce() {
  const [announce, setAnnounce] = useState(null);
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(100);
  const timerRef = useRef(null);
  const startRef = useRef(null);

  const fetchAnnounce = useCallback(async () => {
    try {
      const res = await fetch(`/announce.json?_=${Date.now()}`, {
        cache: "no-store",
      });
      if (!res.ok) return;
      const data = await res.json();

      if (!data.active) {
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch (e) {}
        setVisible(false);
        return;
      }

      // Safety check for localStorage
      let dismissed = null;
      try {
        dismissed = localStorage.getItem(STORAGE_KEY);
      } catch (e) {}

      if (dismissed) {
        try {
          const parsed = JSON.parse(dismissed);
          if (
            parsed.message === data.message &&
            parsed.updatedAt === data.updatedAt
          )
            return;
        } catch {
          /* ignore */
        }
      }

      setAnnounce(data);
      setVisible(true);
    } catch (e) {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    fetchAnnounce();
  }, [fetchAnnounce]);

  useEffect(() => {
    if (!visible) return;
    startRef.current = Date.now();
    const frame = () => {
      if (!startRef.current) return;
      const elapsed = Date.now() - startRef.current;
      const remaining = Math.max(0, 100 - (elapsed / AUTO_CLOSE_MS) * 100);
      setProgress(remaining);
      if (remaining <= 0) {
        handleClose();
        return;
      }
      timerRef.current = requestAnimationFrame(frame);
    };
    timerRef.current = requestAnimationFrame(frame);
    return () => {
      if (timerRef.current) cancelAnimationFrame(timerRef.current);
    };
  }, [visible]);

  const handleClose = () => {
    if (timerRef.current) cancelAnimationFrame(timerRef.current);
    setVisible(false);
    if (announce) {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            message: announce.message,
            updatedAt: announce.updatedAt,
          }),
        );
      } catch (e) {}
    }
  };

  if (!visible || !announce) return null;

  const style = TYPE_STYLES[announce.type] || TYPE_STYLES.info;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(6px)",
        padding: "1rem",
        fontFamily: "sans-serif",
      }}
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 440,
          borderRadius: 20,
          background: "#1a1a2e",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
          overflow: "hidden",
          position: "relative",
          color: "#f1f5f9",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: "rgba(255,255,255,0.05)",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progress}%`,
              background: style.color,
              transition: "width 0.1s linear",
            }}
          />
        </div>

        <button
          onClick={handleClose}
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            width: 28,
            height: 28,
            borderRadius: 8,
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#94a3b8",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "14px",
          }}
        >
          ✕
        </button>

        <div style={{ padding: "2rem", textAlign: "center" }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: style.bg,
              border: style.border,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1rem",
              fontSize: "1.5rem",
            }}
          >
            {style.icon}
          </div>

          <h3
            style={{
              fontSize: "1.125rem",
              fontWeight: 700,
              color: "#f1f5f9",
              marginBottom: "0.75rem",
            }}
          >
            Pengumuman
          </h3>

          <p
            style={{
              color: "#cbd5e1",
              fontSize: "0.9rem",
              lineHeight: 1.6,
              marginBottom: announce.link ? "1rem" : 0,
            }}
          >
            {announce.message}
          </p>

          {announce.link && (
            <a
              href={announce.link}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "0.5rem 1.25rem",
                borderRadius: 10,
                background: style.bg,
                border: style.border,
                color: style.color,
                fontSize: "0.8rem",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              {announce.linkText || "Pelajari selengkapnya"} →
            </a>
          )}
        </div>

        <div
          style={{
            padding: "0.75rem",
            textAlign: "center",
            background: "rgba(0,0,0,0.2)",
            borderTop: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <p style={{ color: "#64748b", fontSize: "0.7rem" }}>
            Otomatis tertutup dalam {Math.ceil((progress / 100) * 15)} detik
          </p>
        </div>
      </div>
    </div>
  );
}
