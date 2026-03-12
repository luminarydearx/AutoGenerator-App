import { useState, useEffect } from "react";
import { X, Send, Image, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

const BugReportModal = ({ isOpen, onClose, webhookUrl }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Judul bug wajib diisi!");
      return;
    }
    if (!description.trim()) {
      toast.error("Deskripsi bug wajib diisi!");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();

      const payload = {
        embeds: [
          {
            title: `🐛 ${title.trim()}`,
            description: description.trim(),
            color: 15548997,
            fields: [
              { name: "URL", value: window.location.href, inline: true },
              {
                name: "Waktu",
                value: new Date().toLocaleString("id-ID"),
                inline: true,
              },
            ],
            footer: { text: "AutoGen Bug Report" },
            timestamp: new Date().toISOString(),
          },
        ],
      };

      formData.append("payload_json", JSON.stringify(payload));

      if (file) {
        formData.append("file", file);
      }

      const response = await fetch(webhookUrl, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Gagal mengirim laporan");

      toast.custom(
        (t) => (
          <div
            className={`${t.visible ? "animate-enter" : "animate-leave"} max-w-md w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-2xl rounded-2xl pointer-events-auto flex p-4`}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-white/20 p-2 rounded-lg">
                <CheckCircle size={24} />
              </div>
              <div className="ml-3">
                <p className="text-sm font-bold">Laporan berhasil dikirim!</p>
                <p className="text-xs opacity-90 mt-0.5">
                  Terima kasih atas laporannya 🙏
                </p>
              </div>
            </div>
          </div>
        ),
        { duration: 5000 },
      );

      setTitle("");
      setDescription("");
      setFile(null);
      setPreviewUrl(null);
      onClose();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Gagal mengirim laporan. Coba lagi nanti.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error("Ukuran file maksimal 10MB!");
        return;
      }
      const validTypes = ["image/jpeg", "image/png", "video/mp4", "video/webm"];
      if (!validTypes.includes(selectedFile.type)) {
        toast.error("Hanya JPEG, PNG, MP4, atau WebM yang diizinkan!");
        return;
      }
      setFile(selectedFile);

      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    }
  };

  const removeFile = () => {
    setFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (document.getElementById("bug-file-input")) {
      document.getElementById("bug-file-input").value = "";
    }
  };

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="relative z-50 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-red-500 via-pink-500 to-orange-500 px-4 sm:px-6 py-5 sticky top-0">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                    <AlertCircle className="text-white" size={24} />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white">
                    Laporkan Bug
                  </h3>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="text-white/80 hover:text-white transition-colors flex-shrink-0"
                >
                  <X size={24} />
                </motion.button>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 px-4 sm:px-6 pt-6 pb-4">
              {/* Info Box */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 border-2 border-blue-200 dark:border-blue-700 rounded-2xl p-4 sm:p-5 mb-6">
                <h4 className="font-bold text-blue-800 dark:text-blue-200 mb-3 flex items-center space-x-2 text-sm sm:text-base">
                  <span>📝</span>
                  <span>Cara Melaporkan Bug:</span>
                </h4>
                <ul className="text-xs sm:text-sm text-blue-700 dark:text-blue-300 space-y-2">
                  <li className="flex items-start space-x-2">
                    <span className="font-bold mt-0.5 flex-shrink-0">•</span>
                    <span>
                      <strong>Judul Bug</strong>: Jelaskan masalah secara
                      singkat (contoh: "Tombol download tidak berfungsi")
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="font-bold mt-0.5 flex-shrink-0">•</span>
                    <span>
                      <strong>Deskripsi</strong>: Tulis langkah-langkah untuk
                      mereproduksi bug
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="font-bold mt-0.5 flex-shrink-0">•</span>
                    <span>
                      <strong>Lampiran</strong>: Upload screenshot/video jika
                      memungkinkan
                    </span>
                  </li>
                </ul>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="space-y-5">
                  {/* Title Input */}
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      Judul Bug <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-sm"
                      placeholder="Contoh: Tombol download tidak berfungsi"
                      maxLength={100}
                      required
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                      {title.length}/100 karakter
                    </p>
                  </div>

                  {/* Description Input */}
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      Deskripsi <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows="5"
                      className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all resize-none text-sm"
                      placeholder="Jelaskan langkah-langkah untuk mereproduksi bug..."
                      maxLength={1000}
                      required
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                      {description.length}/1000 karakter
                    </p>
                  </div>

                  {/* File Upload */}
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      Lampiran (Opsional)
                    </label>

                    {previewUrl && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative mb-3 rounded-xl overflow-hidden border-2 border-gray-300 dark:border-gray-600"
                      >
                        {file.type.startsWith("image/") ? (
                          <img
                            src={previewUrl}
                            alt="Preview"
                            className="max-h-64 w-full object-contain bg-gray-50 dark:bg-gray-900"
                          />
                        ) : (
                          <video
                            src={previewUrl}
                            controls
                            className="max-h-64 w-full bg-gray-50 dark:bg-gray-900"
                          />
                        )}
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          type="button"
                          onClick={removeFile}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 shadow-lg hover:bg-red-600 transition-colors"
                          aria-label="Hapus lampiran"
                        >
                          <X size={18} />
                        </motion.button>
                      </motion.div>
                    )}

                    <label className="flex flex-col items-center justify-center px-4 sm:px-6 py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer group">
                      <Image
                        className="text-gray-400 group-hover:text-purple-500 transition-colors mb-3"
                        size={40}
                      />
                      <span className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors text-center">
                        {previewUrl
                          ? "Ganti file"
                          : "Klik untuk upload gambar/video"}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-500 mt-1 text-center">
                        JPG, PNG, MP4, WebM (Max: 10MB)
                      </span>
                      <input
                        id="bug-file-input"
                        type="file"
                        accept="image/*,video/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 flex flex-col sm:flex-row justify-end gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={onClose}
                    className="px-6 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all font-semibold text-sm"
                  >
                    Batal
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-600 via-pink-600 to-orange-600 text-white rounded-xl hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold text-sm"
                  >
                    {isSubmitting ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        <span>Mengirim...</span>
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        <span>Kirim Laporan</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default BugReportModal;
