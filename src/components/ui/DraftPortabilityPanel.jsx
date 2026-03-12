import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Download,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
} from "lucide-react";
import { exportDrafts, importDrafts } from "../../utils/draftManager";
import { toast } from "react-hot-toast";

const DraftPortabilityPanel = ({ onImportComplete, draftCount = 0 }) => {
  const fileInputRef = useRef(null);
  const [importMode, setImportMode] = useState("merge");
  const [isImporting, setIsImporting] = useState(false);
  const [showConfirmReplace, setShowConfirmReplace] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);

  const handleExport = () => {
    if (draftCount === 0) {
      toast.error("Tidak ada draft untuk diekspor.");
      return;
    }
    const result = exportDrafts();
    if (result.success) {
      toast.success(`${result.count} draft berhasil diekspor!`);
    } else {
      toast.error(result.error || "Gagal mengekspor draft.");
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    if (importMode === "replace" && draftCount > 0) {
      setPendingFile(file);
      setShowConfirmReplace(true);
    } else {
      runImport(file, importMode);
    }
  };

  const runImport = async (file, mode) => {
    setIsImporting(true);
    setShowConfirmReplace(false);
    setPendingFile(null);
    try {
      const result = await importDrafts(file, mode);
      if (!result.success) {
        toast.error(result.error || "Gagal mengimpor draft.");
        return;
      }
      toast.success("Import berhasil!");
      onImportComplete?.();
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
      <div className="flex items-center space-x-2 mb-3">
        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
          Pindahkan Draft ke Device Lain
        </span>
      </div>

      <div className="flex items-start space-x-2 p-3 mb-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-700/40">
        <Info size={14} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <p className="text-[11px] md:text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
          Gunakan <strong>Ekspor</strong> untuk backup, lalu <strong>Impor</strong> di device lain.
        </p>
      </div>

      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={handleExport}
        disabled={draftCount === 0}
        className={`w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl font-semibold text-sm mb-4 transition-all ${
          draftCount === 0
            ? "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
            : "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md"
        }`}
      >
        <Download size={16} />
        <span className="truncate">Ekspor {draftCount > 0 ? `(${draftCount} Draft)` : ""}</span>
      </motion.button>

      <div className="mb-4">
        <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
          Mode Import:
        </p>
        {/* Responsive Grid: 1 kolom di HP kecil, 2 kolom di tablet/PC */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[
            { id: "merge", label: "Gabungkan", desc: "Tambah baru, skip nama sama", activeClass: "border-blue-500 bg-blue-50 dark:bg-blue-900/30", textClass: "text-blue-700 dark:text-blue-400" },
            { id: "replace", label: "Timpa Semua", desc: "Hapus lama, ganti file", activeClass: "border-red-500 bg-red-50 dark:bg-red-900/30", textClass: "text-red-700 dark:text-red-400" }
          ].map((opt) => (
            <button
              key={opt.id}
              onClick={() => setImportMode(opt.id)}
              className={`p-3 rounded-xl border-2 text-left transition-all ${
                importMode === opt.id ? opt.activeClass : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              <p className={`text-xs font-bold ${importMode === opt.id ? opt.textClass : "text-gray-700 dark:text-gray-300"}`}>
                {opt.label}
              </p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 leading-tight">{opt.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileSelect} className="hidden" />
      
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={() => fileInputRef.current?.click()}
        disabled={isImporting}
        className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl font-bold text-sm shadow-md transition-all ${
          isImporting ? "bg-gray-300 dark:bg-gray-700 cursor-not-allowed" : 
          importMode === "replace" ? "bg-gradient-to-r from-red-500 to-pink-500 text-white" : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
        }`}
      >
        {isImporting ? <span className="animate-pulse">Memproses...</span> : <><Upload size={16} /> <span>Impor Sekarang</span></>}
      </motion.button>

      <AnimatePresence>
        {showConfirmReplace && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 overflow-hidden"
          >
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl">
              <div className="flex items-start space-x-3 mb-3">
                <AlertTriangle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-red-700 dark:text-red-300 leading-relaxed">
                  <strong>Peringatan:</strong> {draftCount} draft akan dihapus permanen.
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => runImport(pendingFile, "replace")} className="flex-1 py-2 bg-red-600 text-white rounded-lg text-[11px] font-bold">Ya, Timpa</button>
                <button onClick={() => { setShowConfirmReplace(false); setPendingFile(null); }} className="flex-1 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-[11px] font-bold">Batal</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DraftPortabilityPanel;