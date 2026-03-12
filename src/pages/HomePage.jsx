import React from "react";
import { FileText, Calculator, Briefcase, BookOpen, Sparkles, Zap, Target, Gift, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const HomePage = () => {
  const navigate = useNavigate();

  const features = [
    {
      id: "surat",
      icon: FileText,
      title: "Generator Surat",
      description:
        "Buat surat resmi seperti surat izin, lamaran, dan pernyataan secara otomatis",
      gradient: "from-blue-500 via-blue-600 to-cyan-600",
      lightBg: "from-blue-50 to-cyan-50",
      darkBg: "from-blue-900/20 to-cyan-900/20",
    },
    {
      id: "keuangan",
      icon: Calculator,
      title: "Kalkulator Usaha",
      description: "Hitung modal, laba rugi, dan proyeksi keuangan usaha Anda",
      gradient: "from-emerald-500 via-green-600 to-teal-600",
      lightBg: "from-emerald-50 to-teal-50",
      darkBg: "from-emerald-900/20 to-teal-900/20",
    },
    {
      id: "cv",
      icon: Briefcase,
      title: "CV Generator",
      description: "Buat CV profesional dengan template yang menarik",
      gradient: "from-purple-500 via-pink-600 to-purple-600",
      lightBg: "from-purple-50 to-pink-50",
      darkBg: "from-purple-900/20 to-pink-900/20",
    },
    {
      id: "materi",
      icon: BookOpen,
      title: "Ringkasan Materi",
      description: "Generate ringkasan materi pelajaran dengan cepat",
      gradient: "from-orange-500 via-amber-600 to-yellow-600",
      lightBg: "from-orange-50 to-yellow-50",
      darkBg: "from-orange-900/20 to-yellow-900/20",
    },
  ];

  const benefits = [
    {
      icon: Zap,
      title: "Cepat & Efisien",
      description: "Generate dokumen dalam hitungan detik",
      gradient: "from-yellow-500 to-orange-500",
    },
    {
      icon: Target,
      title: "Mudah Digunakan",
      description: "Interface intuitif untuk semua kalangan",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: Gift,
      title: "100% Gratis",
      description: "Semua fitur dapat diakses secara gratis",
      gradient: "from-purple-500 to-pink-500",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
      },
    },
  };

  return (
    <div className="space-y-12 pb-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-3xl"
      >
        {/* Decorative Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-400/20 dark:bg-purple-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-3xl"></div>

        <div className="relative backdrop-blur-xl bg-white/50 dark:bg-gray-900/50 border border-gray-200/50 dark:border-gray-700/50 rounded-3xl p-8 md:p-12 text-center space-y-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 rounded-full"
          >
            <Sparkles size={18} className="text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">
              Platform Generator Otomatis
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-4xl md:text-6xl font-bold"
          >
            <span className="text-gray-800 dark:text-white">Selamat Datang di </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600">
              AutoGen
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed"
          >
            Platform generator otomatis yang memudahkan pekerjaan administratif Anda. 
            Buat dokumen profesional dalam hitungan detik dengan teknologi modern.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <button
              onClick={() => navigate('/surat')}
              className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white rounded-xl font-bold shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <span className="relative flex items-center space-x-2">
                <span>Mulai Sekarang</span>
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          </motion.div>
        </div>
      </motion.div>

      {/* Features Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <motion.div variants={itemVariants} className="text-center space-y-2">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">
            Fitur Unggulan
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Pilih fitur yang Anda butuhkan untuk memulai
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.id}
                variants={itemVariants}
                whileHover={{ scale: 1.03, y: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(`/${feature.id}`)}
                className="group relative cursor-pointer overflow-hidden rounded-2xl"
              >
                {/* Decorative Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.lightBg} dark:${feature.darkBg}`}></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/40 to-transparent dark:from-white/5 rounded-full blur-2xl"></div>

                <div className="relative backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all">
                  {/* Icon */}
                  <motion.div
                    whileHover={{ rotate: 5, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    className={`inline-flex p-4 bg-gradient-to-r ${feature.gradient} rounded-2xl shadow-lg mb-4 group-hover:shadow-xl transition-shadow`}
                  >
                    <Icon className="text-white" size={32} />
                  </motion.div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 transition-all">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Arrow indicator */}
                  <div className="mt-4 flex items-center text-purple-600 dark:text-purple-400 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-sm">Mulai →</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Benefits Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-3xl"
      >
        {/* Decorative Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utb3BhY2l0eT0iLjEiLz48L2c+PC9zdmc+')] opacity-10"></div>

        <div className="relative backdrop-blur-xl bg-white/10 p-8 md:p-12">
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-3xl md:text-4xl font-bold text-white mb-8 text-center"
          >
            Kenapa Menggunakan AutoGen?
          </motion.h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * index, duration: 0.5 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-white/20 backdrop-blur-xl rounded-2xl blur-sm group-hover:bg-white/30 transition-all"></div>
                  <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:border-white/40 transition-all">
                    <div className={`inline-flex p-3 bg-gradient-to-r ${benefit.gradient} rounded-xl mb-4 shadow-lg`}>
                      <Icon className="text-white" size={24} />
                    </div>
                    <h4 className="font-bold text-xl text-white mb-2">
                      {benefit.title}
                    </h4>
                    <p className="text-blue-100 text-sm leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-3xl"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900"></div>
        <div className="absolute top-0 left-0 w-64 h-64 bg-purple-400/20 dark:bg-purple-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-pink-400/20 dark:bg-pink-600/10 rounded-full blur-3xl"></div>

        <div className="relative backdrop-blur-xl bg-white/50 dark:bg-gray-900/50 border border-gray-200/50 dark:border-gray-700/50 rounded-3xl p-8 md:p-12 text-center space-y-6">
          <div className="inline-flex p-4 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-2xl shadow-xl mb-4">
            <Sparkles className="text-white" size={32} />
          </div>
          
          <h3 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">
            Siap Memulai?
          </h3>
          
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Bergabunglah dengan ribuan pengguna yang sudah merasakan kemudahan AutoGen
          </p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/surat')}
            className="group relative inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white rounded-xl font-bold shadow-xl hover:shadow-2xl transition-all"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
            <span className="relative">Coba Gratis Sekarang</span>
            <ArrowRight size={20} className="relative group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default HomePage;