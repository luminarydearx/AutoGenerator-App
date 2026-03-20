import { useState, useEffect, useRef, useCallback } from "react";

const KEY = "autogen_announce_seen";
const SECS = 15;

const CFG = {
  info: {
    bg: "rgba(59,130,246,.12)",
    border: "rgba(59,130,246,.4)",
    text: "#93c5fd",
    icon: "💡",
  },
  success: {
    bg: "rgba(34,197,94,.1)",
    border: "rgba(34,197,94,.4)",
    text: "#86efac",
    icon: "✅",
  },
  warning: {
    bg: "rgba(245,158,11,.1)",
    border: "rgba(245,158,11,.4)",
    text: "#fcd34d",
    icon: "⚠️",
  },
  error: {
    bg: "rgba(220,38,38,.1)",
    border: "rgba(220,38,38,.4)",
    text: "#fca5a5",
    icon: "🚨",
  },
};

export default function AnnounceModal() {
  const [ann, setAnn] = useState(null);
  const [open, setOpen] = useState(false);
  const [timer, setTimer] = useState(SECS);
  const ivRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const r = await fetch("/announce.json?_=" + Date.now(), {
          cache: "no-store",
        });
        if (!r.ok) return;
        const d = await r.json();
        if (!mounted || !d?.active || !d?.message) return;
        if (localStorage.getItem(KEY) === d.updatedAt) return;
        setAnn(d);
        setOpen(true);
        setTimer(SECS);
      } catch (err) {
        console.error("Error loading announcement:", err);
      }
    };
    load();
    const id = setInterval(load, 60_000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  const close_ = useCallback(() => {
    setOpen(false);
    clearInterval(ivRef.current);
    if (ann?.updatedAt) localStorage.setItem(KEY, ann.updatedAt);
  }, [ann]);

  useEffect(() => {
    if (!open) return;

    ivRef.current = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          close_();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(ivRef.current);
  }, [open, close_]);

  if (!open || !ann) return null;
  const c = CFG[ann.type] || CFG.info;
  const pct = (timer / SECS) * 100;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={close_}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 99998,
          background: "rgba(0,0,0,.65)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
          animation: "__ann_fi .2s ease",
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          zIndex: 99999,
          width: "min(420px,calc(100vw - 32px))",
          borderRadius: 20,
          overflow: "hidden",
          background: "rgba(13,13,22,.97)",
          border: `1px solid ${c.border}`,
          boxShadow: `0 24px 80px rgba(0,0,0,.65)`,
          animation: "__ann_mi .28s cubic-bezier(.34,1.56,.64,1)",
          fontFamily: "'Segoe UI',system-ui,-apple-system,sans-serif",
        }}
      >
        {/* Progress */}
        <div style={{ height: 3, background: "rgba(255,255,255,.06)" }}>
          <div
            style={{
              height: "100%",
              width: `${pct}%`,
              background: c.text,
              transition: "width 1s linear",
              borderRadius: "0 2px 2px 0",
            }}
          />
        </div>

        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "16px 20px 12px",
            borderBottom: "1px solid rgba(255,255,255,.07)",
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              flexShrink: 0,
              background: c.bg,
              border: `1px solid ${c.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
            }}
          >
            {c.icon}
          </div>
          <div style={{ flex: 1 }}>
            <p
              style={{
                margin: 0,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: ".08em",
                textTransform: "uppercase",
                color: c.text,
                opacity: 0.7,
              }}
            >
              Pengumuman
            </p>
            <p
              style={{
                margin: "2px 0 0",
                fontSize: 13,
                fontWeight: 600,
                color: c.text,
                textTransform: "capitalize",
              }}
            >
              {ann.type}
            </p>
          </div>
          <button
            onClick={close_}
            aria-label="Close"
            style={{
              background: "rgba(255,255,255,.07)",
              border: "1px solid rgba(255,255,255,.12)",
              borderRadius: 8,
              width: 32,
              height: 32,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "rgba(255,255,255,.5)",
              fontSize: 20,
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "16px 20px" }}>
          <p
            style={{
              margin: 0,
              fontSize: 15,
              lineHeight: 1.65,
              color: "rgba(255,255,255,.88)",
            }}
          >
            {ann.message}
          </p>
          {ann.link && ann.linkText && (
            <a
              href={ann.link}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                marginTop: 12,
                padding: "8px 14px",
                borderRadius: 10,
                background: c.bg,
                border: `1px solid ${c.border}`,
                color: c.text,
                fontSize: 13,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              {ann.linkText} →
            </a>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 20px 14px",
            borderTop: "1px solid rgba(255,255,255,.07)",
          }}
        >
          <span style={{ fontSize: 11, color: "rgba(255,255,255,.3)" }}>
            Menutup dalam {timer}s
          </span>
          <button
            onClick={close_}
            style={{
              padding: "7px 18px",
              borderRadius: 10,
              cursor: "pointer",
              background: c.bg,
              border: `1px solid ${c.border}`,
              color: c.text,
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Mengerti
          </button>
        </div>
      </div>

      <style>{`
        @keyframes __ann_fi { from{opacity:0} to{opacity:1} }
        @keyframes __ann_mi { from{opacity:0;transform:translate(-50%,-50%) scale(.88)} to{opacity:1;transform:translate(-50%,-50%) scale(1)} }
      `}</style>
    </>
  );
}
