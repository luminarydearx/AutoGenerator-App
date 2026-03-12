import React, { useEffect, useRef, useState } from "react";

function ParticleField() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const resize = () => { 
      canvas.width = window.innerWidth; 
      canvas.height = window.innerHeight; 
    };
    resize();
    window.addEventListener("resize", resize);
    
    const particles = Array.from({ length: 120 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.5 + 0.3,
      a: Math.random(),
      da: (Math.random() - 0.5) * 0.008,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15,
      color: ["#f97316", "#fbbf24", "#fb923c", "#fed7aa"][Math.floor(Math.random() * 4)],
    }));
    
    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.a += p.da; 
        if (p.a <= 0 || p.a >= 1) p.da *= -1;
        p.x += p.vx; 
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width; 
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height; 
        if (p.y > canvas.height) p.y = 0;
        ctx.globalAlpha = p.a; 
        ctx.fillStyle = p.color;
        ctx.beginPath(); 
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); 
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { 
      cancelAnimationFrame(raf); 
      window.removeEventListener("resize", resize); 
    };
  }, []);
  return <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, pointerEvents: "none" }} />;
}

function GearRings() {
  return (
    <div style={{ position: "relative", width: 120, height: 120, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1px solid rgba(251,191,36,0.2)", animation: "ping 3s infinite" }} />
      <div style={{ position: "absolute", width: 120, height: 120, borderRadius: "50%", border: "2px solid rgba(251,191,36,0.3)", animation: "spin 10s linear infinite" }} />
      <div style={{ position: "absolute", width: 88, height: 88, borderRadius: "50%", border: "1px solid rgba(249,115,22,0.25)", animation: "spin 7s linear infinite reverse" }} />
      <div style={{ position: "absolute", width: 60, height: 60, borderRadius: "50%", border: "1px solid rgba(251,191,36,0.3)", animation: "spin 5s linear infinite" }} />
      <div style={{ position: "relative", width: 42, height: 42, borderRadius: "50%", background: "linear-gradient(135deg, rgba(249,115,22,0.3), rgba(251,191,36,0.2))", border: "2px solid rgba(251,191,36,0.5)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 30px rgba(251,191,36,0.4)" }}>
        <svg viewBox="0 0 24 24" style={{ width: 20, height: 20, fill: "#fbbf24" }}>
          <path d="M12 15.5A3.5 3.5 0 0 1 8.5 12A3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5 3.5 3.5 0 0 1-3.5 3.5m7.43-2.92c.04-.34.07-.68.07-1.08s-.03-.74-.07-1.08l2.32-1.81c.21-.16.27-.44.13-.67l-2.2-3.81c-.13-.23-.43-.3-.65-.22l-2.74 1.1c-.57-.44-1.18-.8-1.86-1.07L14.05 3H9.95L9.59 5.44C8.9 5.71 8.29 6.07 7.72 6.51L4.98 5.41c-.23-.08-.52 0-.65.22L2.13 9.44c-.14.24-.08.52.13.68l2.32 1.81c-.04.34-.07.69-.07 1.07s.03.74.07 1.08l-2.32 1.81c-.21.16-.27.44-.13.67l2.2 3.81c.13.23.42.3.65.22l2.74-1.1c.57.44 1.18.8 1.86 1.07L9.95 21h4.1l.36-2.44c.68-.27 1.29-.63 1.86-1.07l2.74 1.1c.23.08.52 0 .65-.22l2.2-3.81c.14-.23.08-.52-.13-.67l-2.32-1.81z"/>
        </svg>
      </div>
      <style>{`@keyframes ping{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.3;transform:scale(1.2)}} @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

// ── Helper: Cek apakah URL adalah video ───────────────────────────────
const isVideoUrl = (url) => {
  return /\.(mp4|webm|mov|avi|ogg|mkv)(\?|$)/i.test(url);
};

// ── Media Component: Render image/video dengan error handling ─────────
function LockdownMedia({ url }) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  
  if (!url || error) return null;
  
  const isVideo = isVideoUrl(url);
  
  return (
    <div style={{ 
      width: "100%", 
      maxWidth: 400, 
      margin: "0 auto",
      borderRadius: 12, 
      overflow: "hidden",
      border: "1px solid rgba(251,191,36,0.2)",
      background: "rgba(30,12,0,0.6)",
      boxShadow: "0 0 40px rgba(249,115,22,0.1)",
      position: "relative",
    }}>
      {/* Loading indicator */}
      {!loaded && (
        <div style={{ 
          padding: 20, 
          textAlign: "center", 
          color: "rgba(251,191,36,0.5)",
          fontSize: 11,
          fontFamily: "monospace",
        }}>
          Loading media...
        </div>
      )}
      
      {isVideo ? (
        <video
          src={url}
          controls
          autoPlay
          loop
          muted
          playsInline
          onLoadStart={() => setLoaded(false)}
          onLoadedData={() => setLoaded(true)}
          onError={() => { setError(true); console.error("Video failed to load:", url); }}
          style={{ 
            width: "100%", 
            display: loaded ? "block" : "none",
            background: "#000",
          }}
        />
      ) : (
        <img
          src={url}
          alt="Lockdown media"
          onLoad={() => setLoaded(true)}
          onError={(e) => { 
            setError(true); 
            console.error("Image failed to load:", url);
            e.target.style.display = "none";
          }}
          style={{ 
            width: "100%", 
            height: "auto",
            display: loaded ? "block" : "none",
            objectFit: "contain",
            background: "rgba(0,0,0,0.3)",
          }}
        />
      )}
      
      {/* Cloudinary badge */}
      {loaded && url.includes("cloudinary.com") && (
        <div style={{
          position: "absolute",
          top: 8,
          right: 8,
          padding: "4px 8px",
          borderRadius: 6,
          background: "rgba(0,0,0,0.7)",
          border: "1px solid rgba(251,191,36,0.3)",
          color: "rgba(251,191,36,0.7)",
          fontSize: 9,
          fontFamily: "monospace",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
        }}>
          Cloudinary
        </div>
      )}
    </div>
  );
}

// ── Main LockdownScreen Component ─────────────────────────────────────
export default function LockdownScreen({ reason, mediaUrl }) {
  const [glitch, setGlitch] = useState(false);
  
  useEffect(() => {
    const t = setInterval(() => { 
      setGlitch(true); 
      setTimeout(() => setGlitch(false), 120); 
    }, 4000 + Math.random() * 3000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 99999,
      background: "radial-gradient(ellipse at center, #1a0a00 0%, #0d0500 50%, #000 100%)",
      display: "flex", alignItems: "flex-start", justifyContent: "center",
      overflowY: "auto", fontFamily: "'Segoe UI', sans-serif",
    }}>
      <ParticleField />
      
      {/* Nebula blobs */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "20%", left: "20%", width: 400, height: 400, borderRadius: "50%", background: "rgba(249,115,22,0.06)", filter: "blur(80px)", animation: "pulse 5s ease-in-out infinite" }} />
        <div style={{ position: "absolute", bottom: "20%", right: "20%", width: 300, height: 300, borderRadius: "50%", background: "rgba(251,191,36,0.05)", filter: "blur(60px)", animation: "pulse 7s ease-in-out infinite", animationDelay: "2s" }} />
      </div>
      
      {/* Scanlines */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.2,
        backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,140,0,0.015) 2px, rgba(255,140,0,0.015) 4px)" }} />

      <div style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: 480, margin: "0 auto", padding: "40px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
        <GearRings />

        <div style={{ textAlign: "center" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 8 }}>
            <div style={{ height: 1, flex: 1, background: "linear-gradient(to right, transparent, rgba(251,191,36,0.5))" }} />
            <span style={{ color: "rgba(251,191,36,0.5)", fontSize: 10, fontFamily: "monospace", letterSpacing: "0.4em", textTransform: "uppercase" }}>System Notice</span>
            <div style={{ height: 1, flex: 1, background: "linear-gradient(to left, transparent, rgba(251,191,36,0.5))" }} />
          </div>
          <h1 style={{
            fontSize: "clamp(28px, 8vw, 52px)", fontWeight: 900, textTransform: "uppercase",
            letterSpacing: "0.2em", fontFamily: "monospace", color: "#fbbf24",
            textShadow: "0 0 40px rgba(251,191,36,0.7), 0 0 80px rgba(251,191,36,0.4)",
            transition: "all 0.05s",
            filter: glitch ? "blur(1px)" : "none",
            opacity: glitch ? 0.85 : 1,
            margin: 0,
          }}>
            LOCKDOWN MODE
          </h1>
          <p style={{ color: "rgba(251,191,36,0.5)", fontFamily: "monospace", fontSize: 11, letterSpacing: "0.35em", marginTop: 6, textTransform: "uppercase" }}>
            TEMPORARILY UNAVAILABLE
          </p>
        </div>

        {/* ── MEDIA SECTION (BARU) ───────────────────────────────────── */}
        {mediaUrl && <LockdownMedia url={mediaUrl} />}
        {/* ───────────────────────────────────────────────────────────── */}

        {/* Info card */}
        <div style={{
          width: "100%", borderRadius: 16, overflow: "hidden",
          background: "rgba(30,12,0,0.8)", border: "1px solid rgba(251,191,36,0.2)",
          backdropFilter: "blur(16px)",
        }}>
          <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(251,191,36,0.1)", background: "rgba(249,115,22,0.05)", display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fbbf24", animation: "ping 2s infinite" }} />
            <span style={{ color: "rgba(251,191,36,0.8)", fontSize: 11, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.2em", fontWeight: 700 }}>Status</span>
          </div>
          <div style={{ padding: "16px" }}>
            <p style={{ color: "rgba(200,150,80,0.7)", fontSize: 12, marginBottom: 12 }}>This service is currently in lockdown mode and not accepting connections.</p>
            {reason && (
              <div style={{ padding: "12px", borderRadius: 10, background: "rgba(249,115,22,0.06)", border: "1px solid rgba(249,115,22,0.15)", marginBottom: 12 }}>
                <p style={{ color: "rgba(251,191,36,0.5)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.3em", fontFamily: "monospace", marginBottom: 6 }}>Reason</p>
                <p style={{ color: "rgba(251,191,36,0.85)", fontSize: 13, fontFamily: "monospace", lineHeight: 1.6 }}>{reason}</p>
              </div>
            )}
            <p style={{ color: "rgba(150,100,50,0.6)", fontSize: 11, fontFamily: "monospace" }}>
              Please try again later or contact the administrator.
            </p>
          </div>
        </div>

        <p style={{ color: "rgba(80,60,30,0.6)", fontSize: 10, fontFamily: "monospace", letterSpacing: "0.1em", paddingBottom: 8 }}>
          AutoGen · Lockdown Control System
        </p>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
    </div>
  );
}