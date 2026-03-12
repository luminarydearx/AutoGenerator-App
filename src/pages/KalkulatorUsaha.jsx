import React, { useState } from "react";
import { Calculator, TrendingUp, DollarSign, PieChart, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const KalkulatorUsaha = () => {
  const [modalAwal, setModalAwal] = useState("");
  const [biayaOperasional, setBiayaOperasional] = useState("");
  const [pendapatan, setPendapatan] = useState("");
  const [periode, setPeriode] = useState("bulan");
  const [hasil, setHasil] = useState(null);

  const handleHitung = () => {
    const modal = parseFloat(modalAwal) || 0;
    const biaya = parseFloat(biayaOperasional) || 0;
    const revenue = parseFloat(pendapatan) || 0;
    const labaKotor = revenue - biaya;
    const labaBersih = labaKotor;
    const roi = modal > 0 ? (labaBersih / modal) * 100 : 0;
    const breakEven = biaya > 0 ? modal / biaya : 0;

    setHasil({
      labaKotor,
      labaBersih,
      roi,
      breakEven,
      modal,
      biaya,
      revenue,
    });
  };

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(angka);
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
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-gray-900 dark:via-emerald-900/20 dark:to-teal-900/20"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/20 dark:bg-emerald-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-400/20 dark:bg-teal-600/10 rounded-full blur-3xl"></div>

        <div className="relative backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 border border-gray-200/50 dark:border-gray-700/50 rounded-3xl shadow-2xl p-8">
          {/* Header */}
          <div className="flex items-center space-x-3 mb-8">
            <div className="p-3 bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 rounded-2xl shadow-lg">
              <Calculator className="text-white" size={32} />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600">
                Kalkulator Usaha
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center space-x-1 mt-1">
                <Sparkles size={14} />
                <span>Hitung proyeksi keuangan bisnis Anda</span>
              </p>
            </div>
          </div>

          {/* Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center space-x-2">
                  <DollarSign size={16} className="text-emerald-600" />
                  <span>Modal Awal (Rp)</span>
                </label>
                <input
                  type="number"
                  value={modalAwal}
                  onChange={(e) => setModalAwal(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder="10000000"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center space-x-2">
                  <TrendingUp size={16} className="text-orange-600" />
                  <span>Biaya Operasional per {periode} (Rp)</span>
                </label>
                <input
                  type="number"
                  value={biayaOperasional}
                  onChange={(e) => setBiayaOperasional(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder="5000000"
                />
              </div>
            </div>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center space-x-2">
                  <PieChart size={16} className="text-purple-600" />
                  <span>Pendapatan per {periode} (Rp)</span>
                </label>
                <input
                  type="number"
                  value={pendapatan}
                  onChange={(e) => setPendapatan(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder="8000000"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Periode Perhitungan
                </label>
                <select
                  value={periode}
                  onChange={(e) => setPeriode(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                >
                  <option value="hari">Per Hari</option>
                  <option value="minggu">Per Minggu</option>
                  <option value="bulan">Per Bulan</option>
                  <option value="tahun">Per Tahun</option>
                </select>
              </div>
            </div>
          </div>

          {/* Calculate Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleHitung}
            className="mt-8 w-full bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 text-white py-4 rounded-xl font-bold hover:shadow-2xl transition-all flex items-center justify-center space-x-2"
          >
            <Calculator size={20} />
            <span>Hitung Proyeksi</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Results */}
      <AnimatePresence>
        {hasil && (
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
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center space-x-2">
                <TrendingUp className="text-emerald-600" size={28} />
                <span>Hasil Perhitungan</span>
              </h3>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[
                  { label: "💰 Modal Awal", value: formatRupiah(hasil.modal), color: "blue" },
                  { label: "📊 Biaya Operasional", value: formatRupiah(hasil.biaya), color: "orange" },
                  { label: "💵 Pendapatan", value: formatRupiah(hasil.revenue), color: "purple" },
                  { label: "📈 Laba Kotor", value: formatRupiah(hasil.labaKotor), color: "green" },
                  { label: "💎 Laba Bersih", value: formatRupiah(hasil.labaBersih), color: "emerald" },
                  { label: "🎯 ROI", value: `${hasil.roi.toFixed(2)}%`, color: "indigo" },
                ].map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    className={`bg-gradient-to-br from-${item.color}-50 to-${item.color}-100 dark:from-${item.color}-900/30 dark:to-${item.color}-800/30 p-6 rounded-2xl border-2 border-${item.color}-200 dark:border-${item.color}-700 hover:shadow-xl transition-shadow`}
                  >
                    <p className={`text-sm font-bold text-${item.color}-600 dark:text-${item.color}-300 mb-2`}>
                      {item.label}
                    </p>
                    <p className={`text-2xl font-bold text-${item.color}-900 dark:text-${item.color}-100`}>
                      {item.value}
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* Break Even Point */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-6 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-800/20 p-6 rounded-2xl border-2 border-yellow-200 dark:border-yellow-700"
              >
                <p className="text-sm font-bold text-yellow-800 dark:text-yellow-200 mb-2 flex items-center space-x-2">
                  <span>⏱️</span>
                  <span>Estimasi Break Even Point</span>
                </p>
                <p className="text-lg text-yellow-900 dark:text-yellow-100">
                  Usaha Anda akan balik modal dalam waktu sekitar{" "}
                  <span className="font-bold text-2xl text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-orange-600">
                    {hasil.breakEven.toFixed(1)}
                  </span>{" "}
                  {periode}
                </p>
              </motion.div>

              {/* Status Alert */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
              >
                {hasil.labaBersih > 0 ? (
                  <div className="mt-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-l-4 border-green-600 dark:border-green-500 p-5 rounded-xl">
                    <p className="text-green-800 dark:text-green-200 font-bold flex items-center space-x-2">
                      <span className="text-2xl">✅</span>
                      <span>Usaha Anda menguntungkan!</span>
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                      Pertahankan kinerja yang baik dan terus kembangkan bisnis Anda.
                    </p>
                  </div>
                ) : (
                  <div className="mt-4 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-l-4 border-red-600 dark:border-red-500 p-5 rounded-xl">
                    <p className="text-red-800 dark:text-red-200 font-bold flex items-center space-x-2">
                      <span className="text-2xl">⚠️</span>
                      <span>Usaha Anda masih merugi</span>
                    </p>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                      Pertimbangkan untuk mengurangi biaya atau meningkatkan pendapatan.
                    </p>
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default KalkulatorUsaha;