import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Clock, RefreshCcw, X, Sparkles } from "lucide-react";
import { useEffect } from "react";

/**
 * SessionRecoveryModal - Beautiful modal for session recovery
 * @param {boolean} isOpen - Control modal visibility
 * @param {function} onRestore - Callback when user clicks restore
 * @param {function} onDiscard - Callback when user clicks discard
 * @param {string} timestamp - Last save timestamp
 */
const SessionRecoveryModal = ({ isOpen, onRestore, onDiscard, timestamp }) => {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  // Handle ESC key
  useEffect(() => {
    if (!isOpen || isMobile) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onDiscard();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isMobile, onDiscard]);

  if (!isOpen) return null;

  // Format timestamp
  const formatTime = (ts) => {
    if (!ts) return "beberapa saat yang lalu";
    const date = new Date(ts);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000); // in seconds

    if (diff < 60) return "beberapa detik yang lalu";
    if (diff < 3600) return `${Math.floor(diff / 60)} menit yang lalu`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} jam yang lalu`;
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99998] flex items-center justify-center p-4"
            onClick={onDiscard}
          >
            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
                duration: 0.3,
              }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Gradient Header Background */}
              <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 opacity-10 dark:opacity-20"></div>

              {/* Animated Sparkles */}
              <motion.div
                animate={{
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="absolute top-4 right-4 text-purple-400 dark:text-purple-300 opacity-20"
              >
                <Sparkles size={80} />
              </motion.div>

              {/* Close Button */}
              <button
                onClick={onDiscard}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 dark:bg-gray-700/80 hover:bg-white dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg"
                aria-label="Close"
              >
                <X size={20} />
              </button>

              {/* Content */}
              <div className="relative p-6 md:p-8">
                {/* Icon with animation */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 15,
                    delay: 0.1,
                  }}
                  className="flex justify-center mb-6"
                >
                  <div className="relative">
                    {/* Pulsing background */}
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 0.2, 0.5],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full blur-xl"
                    ></motion.div>

                    {/* Icon container */}
                    <div className="relative bg-gradient-to-br from-purple-500 to-blue-500 p-4 rounded-2xl shadow-xl">
                      <RefreshCcw
                        className="text-white"
                        size={40}
                        strokeWidth={2.5}
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Title */}
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl md:text-3xl font-bold text-center mb-3 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent"
                >
                  Pemulihan Sesi Tersedia
                </motion.h2>

                {/* Description */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-3 mb-6"
                >
                  <p className="text-center text-gray-700 dark:text-gray-300 text-base md:text-lg leading-relaxed">
                    Ditemukan data yang{" "}
                    <span className="font-semibold text-purple-600 dark:text-purple-400">
                      belum tersimpan
                    </span>{" "}
                    dari sesi sebelumnya.
                  </p>

                  {/* Timestamp Badge */}
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Clock size={16} className="text-blue-500" />
                    <span>Terakhir diedit {formatTime(timestamp)}</span>
                  </div>

                  {/* Info Box */}
                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded-r-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle
                        className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5"
                        size={20}
                      />
                      <p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">
                        Memulihkan data akan mengembalikan semua perubahan yang
                        Anda buat sebelumnya.
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-col sm:flex-row gap-3"
                >
                  {/* Discard Button */}
                  <button
                    onClick={onDiscard}
                    className="flex-1 px-6 py-3 rounded-xl font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] border border-gray-200 dark:border-gray-600 shadow-sm"
                  >
                    Mulai Baru
                  </button>

                  {/* Restore Button - Primary */}
                  <button
                    onClick={onRestore}
                    className="flex-1 px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    <RefreshCcw size={18} />
                    <span>Pulihkan Data</span>
                  </button>
                </motion.div>

                {/* Footer hint - Only for PC */}
                {!isMobile && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-center text-xs text-gray-500 dark:text-gray-500 mt-4"
                  >
                    Tekan ESC untuk menutup
                  </motion.p>
                )}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SessionRecoveryModal;
