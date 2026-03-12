import React, { useState, useEffect, lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { LazyMotion, domAnimation } from "framer-motion";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import LoadingSplash from "./components/layout/LoadingSplash";
import LockdownScreen from "./components/LockdownScreen";
import InstallPrompt from "./components/ui/InstallPrompt";
import GlobalAnnounce from "./components/ui/GlobalAnnounce";
import BugReportModal from "./components/models/BugReportModal";
import useSeo from "./hooks/useSeo";

// ✅ Lazy load semua halaman
const HomePage = lazy(() => import("./pages/HomePage"));
const SuratGenerator = lazy(() => import("./pages/SuratGenerator"));
const KalkulatorUsaha = lazy(() => import("./pages/KalkulatorUsaha"));
const CVGenerator = lazy(() => import("./pages/CVGenerator"));
const RingkasanMateri = lazy(() => import("./pages/RingkasanMateri"));
const NotFound = lazy(() => import("./pages/404"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));

// ── FIX: Hapus spasi di akhir URL ──────────────────────────────────────
const DISCORD_WEBHOOK_URL =
  "https://discord.com/api/webhooks/1464921346596405370/g_AFnbarh11cmDJ2V3UDeHSI_v5S3pSACzMG6vz5U9s8wgVwH9Md2zRv34jpDFl3_2DY";

const seoData = {
  title: "AutoGen - Generator Surat Otomatis",
  description: "Buat surat resmi dengan mudah dan cepat menggunakan AutoGen",
  og: {
    title: "AutoGen - Generator Surat Otomatis",
    description: "Buat surat resmi dengan mudah dan cepat",
    image: "/images/og-image.jpg",
    // ── FIX: Hapus spasi di akhir URL ────────────────────────────────
    url: "https://auto-generator-app.vercel.app",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AutoGen - Generator Surat Otomatis",
    description: "Buat surat resmi dengan mudah dan cepat",
    image: "/images/og-image.jpg",
  },
  // ── FIX: Hapus spasi di akhir URL ─────────────────────────────────
  canonicalUrl: "https://auto-generator-app.vercel.app",
};

// ── Lockdown state ────────────────────────────────────────────────────
// ✅ FIX: Tambahkan mediaUrl ke interface dan state
const useLockdown = () => {
  const [lockdown, setLockdown] = React.useState({ 
    active: false, 
    reason: "",
    mediaUrl: undefined  // ← TAMBAHKAN INI
  });
  
  React.useEffect(() => {
    fetch("/lockdown.json", { cache: "no-store" })
      .then(r => r.json())
      .then((data) => { 
        if (data?.active) {
          setLockdown({ 
            active: true, 
            reason: data.reason || "", 
            mediaUrl: data.mediaUrl  // ← SIMPAN mediaUrl
          }); 
        }
      })
      .catch(() => {}); // file might not exist
  }, []);
  
  return lockdown;
};

const useTheme = () => {
  const [theme, setTheme] = useState(() => {
    return typeof window !== "undefined"
      ? localStorage.getItem("theme") || "auto"
      : "auto";
  });

  useEffect(() => {
    const applyTheme = () => {
      let effectiveTheme = theme;
      if (theme === "auto") {
        effectiveTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
      }
      if (effectiveTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      localStorage.setItem("theme", theme);
    };

    applyTheme();
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => theme === "auto" && applyTheme();
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  return [theme, setTheme];
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const isAuth = localStorage.getItem("adminAuth");
  return isAuth ? children : <Navigate to="/admin" replace />;
};

// ✅ Loading fallback ringan
const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin" />
      <p className="text-sm text-gray-500 dark:text-gray-400">Memuat halaman...</p>
    </div>
  </div>
);

const AppContent = () => {
  const [theme, setTheme] = useTheme();
  const [showSplash, setShowSplash] = useState(false);
  const [isBugModalOpen, setIsBugModalOpen] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  // ✅ FIX: lockdown sekarang termasuk mediaUrl
  const lockdown = useLockdown();

  useEffect(() => {
    const handleUnhandledRejection = (event) => {
      console.error(`Unhandled promise rejected: ${event.reason}`);
      setHasError(true);
    };
    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    return () => {
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, []);

  useEffect(() => {
    const hasVisited = sessionStorage.getItem("hasVisited");
    if (!hasVisited) {
      setShowSplash(true);
      const timer = setTimeout(() => {
        setShowSplash(false);
        sessionStorage.setItem("hasVisited", "true");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  useSeo(seoData);

  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Aplikasi Diperbarui</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Silakan refresh halaman untuk melihat versi terbaru.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh Sekarang
          </button>
        </div>
      </div>
    );
  }

  if (showSplash) {
    return <LoadingSplash onDismiss={() => setShowSplash(false)} />;
  }

  // ✅ FIX: Pass mediaUrl ke LockdownScreen
  if (lockdown.active) {
    return (
      <LockdownScreen 
        reason={lockdown.reason} 
        mediaUrl={lockdown.mediaUrl}  // ← TAMBAHKAN PROP INI
      />
    );
  }

  return (
    <LazyMotion features={domAnimation} strict>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
        <Header
          theme={theme}
          setTheme={setTheme}
          onBugReportClick={() => setIsBugModalOpen(true)}
        />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/surat" element={<SuratGenerator />} />
              <Route path="/keuangan" element={<KalkulatorUsaha />} />
              <Route path="/cv" element={<CVGenerator />} />
              <Route path="/materi" element={<RingkasanMateri />} />
              <Route path="/admin" element={<AdminLogin />} />
              <Route
                path="/admin/announce"
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
        <InstallPrompt />
        <GlobalAnnounce />
        <BugReportModal
          isOpen={isBugModalOpen}
          onClose={() => setIsBugModalOpen(false)}
          webhookUrl={DISCORD_WEBHOOK_URL}
        />
      </div>
    </LazyMotion>
  );
};

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;