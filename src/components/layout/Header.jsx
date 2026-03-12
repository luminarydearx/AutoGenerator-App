import React, { useState, useEffect } from "react";
import {
  Home,
  FileText,
  Calculator,
  Briefcase,
  BookOpen,
  Settings,
  Sun,
  Moon,
  Monitor,
  Menu,
  X,
  Bug,
  Sparkles,
  Download,
  Smartphone,
  Apple,
  CheckCircle,
  Circle,
  PackageOpen,
  AlertTriangle,
  ArrowRight,
  FolderDown,
  Info,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// ─────────────────────────────────────────────
// 🔍 PLATFORM DETECTION
// ─────────────────────────────────────────────

export const detectPlatform = () => {
  if (typeof window === "undefined") return "desktop";
  const ua = navigator.userAgent;
  if (/iphone|ipad|ipod/i.test(ua)) return "ios";
  if (/android/i.test(ua)) return "android";
  return "desktop";
};

export const isRunningInMedianApp = () => {
  if (typeof window === "undefined") return false;
  // ✅ Injected via --inject flag saat build Nativefier (paling reliable)
  if (window.__AUTOGEN_DESKTOP__ === true) return true;
  // Median / Gonative
  if (window.gonative || window.median) return true;
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("gonative") || ua.includes("median")) return true;
  // Electron / Nativefier via UA
  if (ua.includes("electron")) return true;
  if (ua.includes("autogen-desktop")) return true;
  if (window.process?.type === "renderer") return true;
  // PWA / standalone
  if (window.matchMedia("(display-mode: standalone)").matches) return true;
  if (window.navigator.standalone === true) return true;
  return false;
};

const DOWNLOAD_CONFIG = {
  android: {
    label: "Download APK",
    file: "/apk/autogen.apk",
    filename: "autogen.apk",
    icon: Smartphone,
    platformName: "Android",
    color: "from-green-500 to-emerald-600",
    importNote: "Buka app → CV Generator → Kelola Draft → Impor dari File",
  },
  ios: {
    label: "Download iOS",
    file: "/ipa/autogen.ipa",
    filename: "autogen.ipa",
    icon: Apple,
    platformName: "iOS",
    color: "from-gray-700 to-gray-900",
    importNote: "Buka app → CV Generator → Kelola Draft → Impor dari File",
  },
  desktop: {
    label: "Download .ZIP",
    file: "/desktop/AutoGen.zip",
    filename: "AutoGen.zip",
    icon: Monitor,
    platformName: "Windows",
    color: "from-blue-500 to-indigo-600",
    importNote: "Extract file ZIP → buka folder → jalankan 'AutoGen - App.exe' → CV Generator → Kelola Draft → Impor dari File",
  },
};

// ─────────────────────────────────────────────
// 💾 INLINE DRAFT HELPERS
// Tidak import draftManager agar tidak ada dependency issue.
// Langsung baca localStorage dengan key yang sama.
// ─────────────────────────────────────────────

const DRAFT_STORAGE_KEY = "autogen_cv_drafts";

const getDraftCount = () => {
  try {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return 0;
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.drafts)) return parsed.drafts.length;
    return 0;
  } catch {
    return 0;
  }
};

const exportDraftsInline = () => {
  try {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return { success: false, count: 0, error: "Tidak ada draft." };

    const parsed = JSON.parse(raw);
    const drafts = parsed?.drafts ?? [];
    if (drafts.length === 0) return { success: false, count: 0, error: "Tidak ada draft." };

    const payload = {
      __format: "autogen_export_v1",
      exportedAt: Date.now(),
      exportedAtReadable: new Date().toLocaleString("id-ID"),
      appVersion: parsed.version ?? "1.0.0",
      count: drafts.length,
      drafts,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const dateStr = new Date()
      .toLocaleDateString("id-ID", { year: "numeric", month: "2-digit", day: "2-digit" })
      .replace(/\//g, "-");

    const link = document.createElement("a");
    link.href = url;
    link.download = `autogen_drafts_backup_${dateStr}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);

    return { success: true, count: drafts.length };
  } catch (e) {
    return { success: false, count: 0, error: e.message };
  }
};

// ─────────────────────────────────────────────
// 🧪 CONSOLE TEST HELPER
// ─────────────────────────────────────────────
if (typeof window !== "undefined") {
  window.__AutoGenTest = {
    runAll() {
      const platforms = ["android", "ios", "desktop"];
      console.group("🧪 AutoGen Download Button — Platform Test");
      platforms.forEach((p) => {
        const c = DOWNLOAD_CONFIG[p];
        console.log(`%c[${p.toUpperCase()}]%c "${c.label}" → ${c.file}`, "font-weight:bold;color:#6366f1;", "color:inherit;");
      });
      console.log("%c\nSimulasi:", "font-weight:bold;color:#f59e0b;");
      console.log("  window.__AutoGenTest.simulate('android'|'ios'|'desktop'|'native')\n  window.__AutoGenTest.reset()");
      console.groupEnd();
      const cur = detectPlatform();
      const nat = isRunningInMedianApp();
      console.log(`%c✅ Platform: %c${cur.toUpperCase()}${nat ? " (NATIVE)" : ""}`, "color:#10b981;font-weight:bold;", "color:#3b82f6;font-weight:bold;");
    },
    simulate(platform) {
      if (platform === "native") {
        window.__autogenSimulateNative = true;
        window.__autogenSimulatePlatform = null;
      } else if (DOWNLOAD_CONFIG[platform]) {
        window.__autogenSimulatePlatform = platform;
        window.__autogenSimulateNative = false;
      } else {
        console.error(`❌ Pilih: android | ios | desktop | native`);
        return;
      }
      console.log(`%c🔄 Simulasi: ${platform.toUpperCase()}`, "color:#6366f1;font-weight:bold;");
      window.dispatchEvent(new CustomEvent("autogen-platform-change"));
    },
    reset() {
      window.__autogenSimulatePlatform = null;
      window.__autogenSimulateNative = null;
      console.log("%c✅ Reset ke deteksi asli.", "color:#10b981;font-weight:bold;");
      window.dispatchEvent(new CustomEvent("autogen-platform-change"));
    },
  };
}

// ─────────────────────────────────────────────
// 📋 DOWNLOAD GUIDE MODAL
// ─────────────────────────────────────────────

const DownloadGuideModal = ({ isOpen, onClose, dlConfig, platform }) => {
  const [step, setStep] = useState(1);
  const [draftCount, setDraftCount] = useState(0);
  const [exported, setExported] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [skipExport, setSkipExport] = useState(false);
  const DlIcon = dlConfig?.icon ?? Download;

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setExported(false);
      setSkipExport(false);
      setExporting(false);
      setDraftCount(getDraftCount());
    }
  }, [isOpen]);

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => {
      const result = exportDraftsInline();
      setExporting(false);
      if (result.success) {
        setExported(true);
      } else {
        alert(result.error || "Gagal mengekspor draft.");
      }
    }, 600);
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = dlConfig.file;
    link.download = dlConfig.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onClose();
  };

  const canProceed = exported || skipExport || draftCount === 0;

  const steps = [
    { id: 1, label: "Panduan" },
    { id: 2, label: "Backup" },
    { id: 3, label: "Download" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[101] flex items-center justify-center px-4 py-6 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 24 }}
              transition={{ type: "spring", stiffness: 280, damping: 26 }}
              onClick={(e) => e.stopPropagation()}
              className="pointer-events-auto w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden border border-gray-200/60 dark:border-gray-700/60"
            >
              {/* Modal header */}
              <div className={`bg-gradient-to-r ${dlConfig?.color ?? "from-blue-500 to-indigo-600"} p-5`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-white/20 p-2 rounded-xl">
                      <DlIcon size={22} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-white font-bold text-lg leading-tight">{dlConfig?.label}</h2>
                      <p className="text-white/75 text-xs mt-0.5">Ikuti panduan sebelum mengunduh</p>
                    </div>
                  </div>
                  <button onClick={onClose} className="bg-white/20 hover:bg-white/30 p-1.5 rounded-lg transition-colors">
                    <X size={18} className="text-white" />
                  </button>
                </div>

                {/* Step indicator */}
                <div className="flex items-center space-x-2">
                  {steps.map((s, i) => (
                    <React.Fragment key={s.id}>
                      <div className="flex items-center space-x-1.5">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= s.id ? "bg-white text-blue-600" : "bg-white/30 text-white"}`}>
                          {step > s.id ? "✓" : s.id}
                        </div>
                        <span className={`text-xs font-medium hidden sm:inline ${step >= s.id ? "text-white" : "text-white/60"}`}>{s.label}</span>
                      </div>
                      {i < steps.length - 1 && (
                        <div className={`flex-1 h-0.5 rounded-full transition-all ${step > s.id ? "bg-white" : "bg-white/30"}`} />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Modal body */}
              <div className="p-5">

                {/* STEP 1 */}
                {step === 1 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    <h3 className="font-bold text-gray-800 dark:text-white text-base mb-3">⚠️ Penting Sebelum Download</h3>
                    <div className="space-y-2.5 mb-4">
                      {[
                        { icon: "🗂️", title: "Draft tidak otomatis terbawa", desc: "Draft CV di browser tersimpan di browser, bukan di dalam app. Setelah install, draft akan kosong.", highlight: true },
                        { icon: "💾", title: "Backup draft dulu", desc: "Ekspor semua draft jadi file .json di langkah berikutnya sebelum download.", highlight: false },
                        { icon: "📥", title: "Impor setelah install", desc: dlConfig?.importNote ?? "CV Generator → Kelola Draft → Impor dari File", highlight: false },
                      ].map((item, i) => (
                        <div key={i} className={`flex items-start space-x-3 p-3 rounded-xl border ${item.highlight ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700/40" : "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700/40"}`}>
                          <span className="text-lg flex-shrink-0">{item.icon}</span>
                          <div>
                            <p className={`text-sm font-bold ${item.highlight ? "text-amber-700 dark:text-amber-400" : "text-gray-800 dark:text-gray-200"}`}>{item.title}</p>
                            <p className={`text-xs mt-0.5 leading-relaxed ${item.highlight ? "text-amber-600 dark:text-amber-500" : "text-gray-500 dark:text-gray-400"}`}>{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => setStep(2)}
                      className={`w-full py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r ${dlConfig?.color ?? "from-blue-500 to-indigo-600"} hover:opacity-90 transition-all flex items-center justify-center space-x-2 shadow-lg`}
                    >
                      <span>Lanjut ke Backup Draft</span>
                      <ArrowRight size={16} />
                    </button>
                  </motion.div>
                )}

                {/* STEP 2 */}
                {step === 2 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    <h3 className="font-bold text-gray-800 dark:text-white text-base mb-1">💾 Backup Draft CV</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">File .json ini bisa diimpor di dalam app setelah install.</p>

                    {/* Status draft */}
                    <div className={`p-4 rounded-2xl mb-4 ${draftCount === 0 ? "bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700" : "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/40"}`}>
                      <div className="flex items-center space-x-3">
                        <div className={`p-2.5 rounded-xl ${draftCount === 0 ? "bg-gray-200 dark:bg-gray-700" : "bg-blue-100 dark:bg-blue-800/50"}`}>
                          <PackageOpen size={20} className={draftCount === 0 ? "text-gray-400" : "text-blue-600 dark:text-blue-400"} />
                        </div>
                        <div>
                          <p className={`font-bold text-sm ${draftCount === 0 ? "text-gray-500" : "text-blue-700 dark:text-blue-300"}`}>
                            {draftCount === 0 ? "Tidak ada draft tersimpan" : `${draftCount} Draft Tersimpan`}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                            {draftCount === 0 ? "Kamu belum punya draft CV — aman untuk lanjut" : "Klik Ekspor untuk membuat file backup"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {draftCount > 0 && (
                      <>
                        <motion.button
                          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                          onClick={handleExport}
                          disabled={exporting || exported}
                          className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 transition-all mb-3 ${
                            exported
                              ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-2 border-emerald-400"
                              : exporting
                              ? "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                              : "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 shadow-lg"
                          }`}
                        >
                          {exporting ? (
                            <><div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" /><span>Mengekspor...</span></>
                          ) : exported ? (
                            <><CheckCircle size={16} /><span>Draft Berhasil Diekspor!</span></>
                          ) : (
                            <><FolderDown size={16} /><span>Ekspor {draftCount} Draft Sekarang</span></>
                          )}
                        </motion.button>

                        {exported && (
                          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                            className="flex items-start space-x-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-700/40 mb-3"
                          >
                            <Info size={13} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-emerald-700 dark:text-emerald-400 leading-relaxed">
                              File <strong>autogen_drafts_backup_*.json</strong> sudah terdownload. Simpan baik-baik untuk diimpor nanti di app.
                            </p>
                          </motion.div>
                        )}

                        {!exported && !skipExport && (
                          <button onClick={() => setSkipExport(true)} className="w-full text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 py-1 transition-colors underline underline-offset-2">
                            Lewati (draft tidak akan terbawa ke app)
                          </button>
                        )}

                        {skipExport && !exported && (
                          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                            className="flex items-start space-x-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-700/40 mt-2"
                          >
                            <AlertTriangle size={13} className="text-red-500 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-red-600 dark:text-red-400 leading-relaxed">
                              Draft kamu <strong>tidak akan ada</strong> di app setelah install. Yakin lanjut?
                            </p>
                          </motion.div>
                        )}
                      </>
                    )}

                    <div className="flex space-x-2 mt-4">
                      <button onClick={() => setStep(1)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        ← Kembali
                      </button>
                      <button
                        onClick={() => setStep(3)}
                        disabled={draftCount > 0 && !canProceed}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center space-x-2 transition-all ${
                          draftCount > 0 && !canProceed
                            ? "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                            : `bg-gradient-to-r ${dlConfig?.color ?? "from-blue-500 to-indigo-600"} text-white hover:opacity-90 shadow-md`
                        }`}
                      >
                        <span>Lanjut</span><ArrowRight size={15} />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 3 */}
                {step === 3 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    <div className="text-center mb-5">
                      <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${dlConfig?.color ?? "from-blue-500 to-indigo-600"} mb-3 shadow-lg`}>
                        <DlIcon size={32} className="text-white" />
                      </div>
                      <h3 className="font-bold text-gray-800 dark:text-white text-lg">Siap Download!</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{dlConfig?.platformName} — {dlConfig?.filename}</p>
                    </div>

                    <div className="space-y-2 mb-5">
                      {[
                        { done: true, text: "Sudah baca panduan", warn: false, info: false },
                        {
                          done: exported || draftCount === 0 || skipExport,
                          text: draftCount === 0 ? "Tidak ada draft (aman)" : exported ? "Draft sudah di-backup ✅" : "Draft dilewati (tidak di-backup)",
                          warn: skipExport && !exported && draftCount > 0,
                          info: false,
                        },
                        { done: false, text: `Setelah install: ${dlConfig?.importNote}`, warn: false, info: true },
                      ].map((item, i) => (
                        <div key={i} className={`flex items-start space-x-2.5 p-2.5 rounded-xl ${item.warn ? "bg-amber-50 dark:bg-amber-900/20" : item.info ? "bg-blue-50 dark:bg-blue-900/20" : "bg-gray-50 dark:bg-gray-800/50"}`}>
                          {item.info ? <Info size={14} className="text-blue-500 flex-shrink-0 mt-0.5" />
                            : item.done ? <CheckCircle size={14} className={`flex-shrink-0 mt-0.5 ${item.warn ? "text-amber-500" : "text-emerald-500"}`} />
                            : <Circle size={14} className="text-gray-300 flex-shrink-0 mt-0.5" />}
                          <p className={`text-xs leading-relaxed ${item.warn ? "text-amber-700 dark:text-amber-400" : item.info ? "text-blue-700 dark:text-blue-400" : "text-gray-600 dark:text-gray-400"}`}>
                            {item.text}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="flex space-x-2">
                      <button onClick={() => setStep(2)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        ← Kembali
                      </button>
                      <motion.button
                        whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                        onClick={handleDownload}
                        className={`flex-1 py-2.5 rounded-xl text-white text-sm font-bold bg-gradient-to-r ${dlConfig?.color ?? "from-blue-500 to-indigo-600"} hover:opacity-90 shadow-lg flex items-center justify-center space-x-2 relative overflow-hidden`}
                      >
                        <motion.span
                          className="absolute inset-0 pointer-events-none"
                          style={{ background: "linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.2) 50%, transparent 70%)", backgroundSize: "200% 100%" }}
                          animate={{ backgroundPosition: ["200% 0", "-200% 0"] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        />
                        <Download size={16} className="relative z-10" />
                        <span className="relative z-10">{dlConfig?.label}</span>
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

// ─────────────────────────────────────────────
// 🧩 HEADER COMPONENT
// ─────────────────────────────────────────────

const Header = ({ theme, setTheme, onBugReportClick }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [isNativeApp, setIsNativeApp] = useState(false);
  const [platform, setPlatform] = useState("desktop");
  const [showDownloadGuide, setShowDownloadGuide] = useState(false);
  const location = useLocation();

  const refreshPlatformState = () => {
    if (window.__autogenSimulateNative === true) { setIsNativeApp(true); return; }
    if (window.__autogenSimulatePlatform) { setPlatform(window.__autogenSimulatePlatform); setIsNativeApp(false); return; }
    setIsNativeApp(isRunningInMedianApp());
    setPlatform(detectPlatform());
  };

  useEffect(() => {
    refreshPlatformState();
    const timer = setTimeout(refreshPlatformState, 500);
    window.addEventListener("autogen-platform-change", refreshPlatformState);
    return () => { clearTimeout(timer); window.removeEventListener("autogen-platform-change", refreshPlatformState); };
  }, []);

  const handleThemeChange = (newTheme) => { setTheme(newTheme); setShowThemeMenu(false); };

  const menuItems = [
    { id: "/", label: "Beranda", icon: Home },
    { id: "/surat", label: "Generator Surat", icon: FileText },
    { id: "/keuangan", label: "Kalkulator Usaha", icon: Calculator },
    { id: "/cv", label: "CV Generator", icon: Briefcase },
    { id: "/materi", label: "Ringkasan Materi", icon: BookOpen },
  ];

  const themeOptions = [
    { value: "light", label: "Terang", icon: Sun },
    { value: "dark", label: "Gelap", icon: Moon },
    { value: "auto", label: "Otomatis", icon: Monitor },
  ];

  const dlConfig = DOWNLOAD_CONFIG[platform] ?? DOWNLOAD_CONFIG.desktop;
  const DlIcon = dlConfig.icon;

  const DownloadButton = ({ fullWidth = false, iconSize = 18 }) => (
    <motion.button
      whileHover={{ scale: 1.07 }} whileTap={{ scale: 0.95 }}
      onClick={() => { setIsMobileMenuOpen(false); setShowDownloadGuide(true); }}
      className={`relative flex items-center space-x-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white overflow-hidden ${fullWidth ? "w-full justify-center" : ""}`}
      style={{
        background: "linear-gradient(135deg, rgba(59,130,246,0.85) 0%, rgba(37,99,235,0.95) 50%, rgba(29,78,216,0.9) 100%)",
        boxShadow: "0 0 16px 3px rgba(59,130,246,0.55), 0 0 40px 6px rgba(37,99,235,0.25), inset 0 1px 1px rgba(255,255,255,0.25)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(147,197,253,0.4)",
      }}
    >
      <motion.span className="absolute inset-0 rounded-xl pointer-events-none"
        style={{ background: "linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.18) 50%, transparent 70%)", backgroundSize: "200% 100%" }}
        animate={{ backgroundPosition: ["200% 0", "-200% 0"] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: "linear" }}
      />
      <motion.span className="absolute inset-0 rounded-xl pointer-events-none"
        animate={{ opacity: [0.4, 0.85, 0.4] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        style={{ boxShadow: "0 0 18px 4px rgba(96,165,250,0.5)" }}
      />
      <DlIcon size={iconSize} className="relative z-10 flex-shrink-0" />
      <span className="relative z-10 whitespace-nowrap">{dlConfig.label}</span>
    </motion.button>
  );

  return (
    <>
      <DownloadGuideModal isOpen={showDownloadGuide} onClose={() => setShowDownloadGuide(false)} dlConfig={dlConfig} platform={platform} />

      <motion.header
        initial={{ y: -100 }} animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-b border-gray-200/50 dark:border-gray-700/50 shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <motion.div whileHover={{ scale: 1.1, rotate: 5 }} whileTap={{ scale: 0.95 }} className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-xl blur-md opacity-75 group-hover:opacity-100 transition-opacity" />
                <div className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 p-2 rounded-xl">
                  <FileText className="text-white" size={24} />
                </div>
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600">AutoGen</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <Sparkles size={10} />Platform Generator Otomatis
                </p>
              </div>
            </Link>

            {/* Desktop: Settings */}
            <div className="hidden md:flex items-center space-x-2">
              <div className="relative">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => setShowThemeMenu(!showThemeMenu)}
                  className="p-2.5 rounded-xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-gray-800 dark:hover:to-gray-700 transition-all"
                >
                  <Settings className="text-gray-600 dark:text-gray-300" size={20} />
                </motion.button>
                <AnimatePresence>
                  {showThemeMenu && (
                    <>
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40" onClick={() => setShowThemeMenu(false)} />
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="absolute right-0 mt-2 w-52 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 py-2 z-50 overflow-hidden"
                      >
                        {themeOptions.map((option, index) => {
                          const Icon = option.icon;
                          return (
                            <motion.button key={option.value} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}
                              onClick={() => handleThemeChange(option.value)}
                              className={`w-full flex items-center space-x-3 px-4 py-3 transition-all ${theme === option.value ? "bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 text-purple-700 dark:text-purple-300" : "text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-gray-700 dark:hover:to-gray-600"}`}
                            >
                              <Icon size={18} />
                              <span className="text-sm font-semibold">{option.label}</span>
                              {theme === option.value && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-auto text-purple-600 dark:text-purple-300 font-bold">✓</motion.span>}
                            </motion.button>
                          );
                        })}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Mobile: Settings + Hamburger */}
            <div className="flex md:hidden items-center space-x-2">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowThemeMenu(!showThemeMenu)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
                <Settings className="text-gray-600 dark:text-gray-300" size={20} />
              </motion.button>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
                {isMobileMenuOpen ? <X className="dark:text-gray-300" size={24} /> : <Menu className="dark:text-gray-300" size={24} />}
              </motion.button>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex space-x-2 pb-4 items-center flex-wrap gap-y-2">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.id;
              return (
                <motion.div key={item.id} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                  <Link to={item.id} className="relative group">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all ${isActive ? "bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white shadow-xl" : "text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-gray-800 dark:hover:to-gray-700"}`}
                    >
                      <Icon size={18} /><span className="text-sm font-semibold">{item.label}</span>
                    </motion.div>
                    {isActive && <motion.div layoutId="activeTab" className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-xl -z-10 blur-md opacity-50" transition={{ type: "spring", stiffness: 300, damping: 30 }} />}
                  </Link>
                </motion.div>
              );
            })}
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onBugReportClick}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
            >
              <Bug size={18} /><span className="text-sm font-semibold">Laporkan Bug</span>
            </motion.button>
            <AnimatePresence>
              {!isNativeApp && (
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.3 }}>
                  <DownloadButton />
                </motion.div>
              )}
            </AnimatePresence>
          </nav>

          {/* Mobile Nav */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.nav initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} className="md:hidden pb-4 space-y-1.5 overflow-hidden">
                {menuItems.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.id;
                  return (
                    <motion.div key={item.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ delay: index * 0.04 }}>
                      <Link to={item.id} onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${isActive ? "bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white shadow-xl" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
                      >
                        <Icon size={20} /><span className="text-sm font-semibold">{item.label}</span>
                      </Link>
                    </motion.div>
                  );
                })}
                <motion.button initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ delay: menuItems.length * 0.04 }}
                  onClick={() => { setIsMobileMenuOpen(false); onBugReportClick(); }}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                >
                  <Bug size={20} /><span className="text-sm font-semibold">Laporkan Bug</span>
                </motion.button>
                <AnimatePresence>
                  {!isNativeApp && (
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ delay: (menuItems.length + 1) * 0.04 }}>
                      <DownloadButton fullWidth iconSize={20} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.nav>
            )}
          </AnimatePresence>
        </div>
      </motion.header>
    </>
  );
};

export default Header;