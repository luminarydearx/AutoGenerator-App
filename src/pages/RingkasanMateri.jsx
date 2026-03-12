import React, { useState } from "react";
import { BookOpen, Download, Sparkles, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const RingkasanMateri = () => {
  const [judulMateri, setJudulMateri] = useState("");
  const [isiMateri, setIsiMateri] = useState("");
  const [jumlahPoin, setJumlahPoin] = useState("5");
  const [ringkasan, setRingkasan] = useState("");

  const handleGenerate = () => {
    const poin = parseInt(jumlahPoin) || 5;
    const kata = isiMateri.trim() ? isiMateri.split(/\s+/) : [];
    if (kata.length === 0) return;

    const kataPerPoin = Math.ceil(kata.length / poin);
    let hasil = `RINGKASAN MATERI: ${judulMateri}\n`;
    hasil += `${"=".repeat(70)}\n`;

    for (let i = 0; i < poin && i * kataPerPoin < kata.length; i++) {
      const bagian = kata
        .slice(i * kataPerPoin, (i + 1) * kataPerPoin)
        .join(" ");
      hasil += `${i + 1}. ${bagian.substring(0, 100)}${bagian.length > 100 ? "..." : ""}\n`;
    }

    hasil += `\nKesimpulan:\n`;
    hasil += `Materi "${judulMateri}" membahas tentang konsep-konsep penting yang telah dirangkum dalam ${poin} poin utama di atas.\n`;
    hasil += `Total kata dalam materi: ${kata.length} kata\n`;
    hasil += `Diringkas menjadi: ${poin} poin utama\n`;

    setRingkasan(hasil);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([ringkasan], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `ringkasan_${judulMateri.replace(/\s+/g, "_")}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const wordCount = isiMateri.trim()
    ? isiMateri.split(/\s+/).filter(Boolean).length
    : 0;
  const efficiency = isiMateri.trim()
    ? Math.round((parseInt(jumlahPoin) / wordCount) * 100)
    : 0;

  const colorMap = {
    blue: {
      bg: "bg-blue-50",
      bgDark: "dark:bg-blue-900/30",
      text: "text-blue-600",
      textDark: "dark:text-blue-300",
    },
    purple: {
      bg: "bg-purple-50",
      bgDark: "dark:bg-purple-900/30",
      text: "text-purple-600",
      textDark: "dark:text-purple-300",
    },
    emerald: {
      bg: "bg-emerald-50",
      bgDark: "dark:bg-emerald-900/30",
      text: "text-emerald-600",
      textDark: "dark:text-emerald-300",
    },
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Input Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl"
      >
        {/* Decorative Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-gray-900 dark:via-orange-900/20 dark:to-yellow-900/20"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-400/20 dark:bg-orange-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-400/20 dark:bg-yellow-600/10 rounded-full blur-3xl"></div>

        <div className="relative backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 border border-gray-200/50 dark:border-gray-700/50 rounded-3xl shadow-2xl p-8">
          {/* Header */}
          <div className="flex items-center space-x-3 mb-8">
            <div className="p-3 bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 rounded-2xl shadow-lg">
              <BookOpen className="text-white" size={32} />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600">
                Generator Ringkasan Materi
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center space-x-1 mt-1">
                <Sparkles size={14} />
                <span>Ringkas materi pelajaran dengan mudah</span>
              </p>
            </div>
          </div>

          {/* Form Grid */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center space-x-2">
                <BookOpen size={16} className="text-orange-600" />
                <span>Judul Materi</span>
              </label>
              <input
                type="text"
                value={judulMateri}
                onChange={(e) => setJudulMateri(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all placeholder-gray-400 dark:placeholder-gray-500"
                placeholder="Mis. Fotosintesis pada Tumbuhan"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center space-x-2">
                <TrendingUp size={16} className="text-amber-600" />
                <span>Isi Materi Lengkap</span>
              </label>
              <textarea
                value={isiMateri}
                onChange={(e) => setIsiMateri(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all placeholder-gray-400 dark:placeholder-gray-500"
                rows="12"
                placeholder="Paste atau ketik materi yang ingin diringkas di sini..."
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 font-medium">
                📊 Jumlah kata:{" "}
                <span className="text-orange-600 dark:text-orange-400 font-bold">
                  {wordCount}
                </span>
              </p>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center space-x-2">
                <span>✨</span>
                <span>Jumlah Poin Ringkasan</span>
              </label>
              <select
                value={jumlahPoin}
                onChange={(e) => setJumlahPoin(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
              >
                <option value="3">3 Poin</option>
                <option value="5">5 Poin</option>
                <option value="7">7 Poin</option>
                <option value="10">10 Poin</option>
              </select>
            </div>

            {/* Generate Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGenerate}
              disabled={!judulMateri || !isiMateri.trim()}
              className="w-full bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 text-white py-4 rounded-xl font-bold hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <Sparkles size={20} />
              <span>Generate Ringkasan</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Results */}
      <AnimatePresence>
        {ringkasan && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-3xl"
          >
            {/* Decorative Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20"></div>

            <div className="relative backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 border border-gray-200/50 dark:border-gray-700/50 rounded-3xl shadow-2xl p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center space-x-2">
                  <TrendingUp className="text-orange-600" size={28} />
                  <span>Hasil Ringkasan</span>
                </h3>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDownload}
                  className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-xl transition-all"
                >
                  <Download size={20} />
                  <span>Download</span>
                </motion.button>
              </div>

              {/* Summary Display */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-800/20 p-6 rounded-2xl border-2 border-orange-200 dark:border-orange-700 mb-6"
              >
                <pre className="whitespace-pre-wrap font-sans text-gray-800 dark:text-gray-200 leading-relaxed text-sm">
                  {ringkasan}
                </pre>
              </motion.div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {[
                  { label: "📝 Kata Asli", value: wordCount, color: "blue" },
                  {
                    label: "✨ Poin Ringkasan",
                    value: jumlahPoin,
                    color: "purple",
                  },
                  {
                    label: "⚡ Efisiensi",
                    value: `${efficiency}%`,
                    color: "emerald",
                  },
                ].map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    className={`${colorMap[item.color].bg} ${colorMap[item.color].bgDark} p-6 rounded-2xl border-2 border-${item.color}-200 dark:border-${item.color}-700 hover:shadow-xl transition-shadow`}
                  >
                    <p
                      className={`text-sm font-bold text-${item.color}-600 dark:text-${item.color}-300 mb-2`}
                    >
                      {item.label}
                    </p>
                    <p
                      className={`text-3xl font-bold text-${item.color}-900 dark:text-${item.color}-100`}
                    >
                      {item.value}
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* Summary Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="mt-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-800/20 p-6 rounded-2xl border-2 border-amber-200 dark:border-amber-700"
              >
                <p className="text-sm font-bold text-amber-800 dark:text-amber-200 mb-3 flex items-center space-x-2">
                  <span>📊</span>
                  <span>Ringkasan Berhasil Dibuat</span>
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="text-center">
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                      Total Kata
                    </p>
                    <p className="text-xl font-bold text-amber-900 dark:text-amber-100">
                      {wordCount}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                      Diringkas ke
                    </p>
                    <p className="text-xl font-bold text-amber-900 dark:text-amber-100">
                      {jumlahPoin}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                      Reduksi
                    </p>
                    <p className="text-xl font-bold text-amber-900 dark:text-amber-100">
                      {100 - efficiency}%
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                      Efisiensi
                    </p>
                    <p className="text-xl font-bold text-amber-900 dark:text-amber-100">
                      {efficiency}%
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RingkasanMateri;
