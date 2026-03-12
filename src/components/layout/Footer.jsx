import React from "react";
import { motion } from "framer-motion";
import { Heart, Sparkles, Github, Mail, LucidePersonStanding } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: Github, label: "GitHub", href: "https://github.com/dearlyfebrianos" },
    { icon: Mail, label: "Email", href: "mailto:dearlyfebrianoi@gmail.com" },
    { icon: LucidePersonStanding, label: "LinkedIn", href: "https://dearly-personal-portofolio.vercel.app/" },
  ];

  return (
    <footer className="mt-16 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="backdrop-blur-xl bg-white/50 dark:bg-gray-900/50 border-t border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Brand Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-xl shadow-lg">
                  <Sparkles className="text-white" size={20} />
                </div>
                <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600">
                  AutoGen
                </h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Platform generator otomatis yang memudahkan pekerjaan administratif Anda dengan teknologi modern.
              </p>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                Fitur Utama
              </h4>
              <ul className="space-y-2">
                {["Generator Surat", "Kalkulator Usaha", "CV Generator", "Ringkasan Materi"].map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors flex items-center space-x-2 group"
                    >
                      <span className="w-1.5 h-1.5 bg-purple-600 dark:bg-purple-400 rounded-full group-hover:scale-150 transition-transform"></span>
                      <span>{item}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Social Links */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                Hubungi Kami
              </h4>
              <div className="flex flex-wrap gap-3">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <motion.a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-3 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-gray-800 dark:to-gray-700 rounded-xl hover:from-purple-200 hover:to-pink-200 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all shadow-md hover:shadow-xl"
                      title={social.label}
                    >
                      <Icon size={20} className="text-purple-600 dark:text-purple-400" />
                    </motion.a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200/50 dark:border-gray-700/50 mb-8" />

          {/* Bottom Section */}
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <span>© {currentYear} AutoGen</span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <span>Dibuat dengan</span>
                <Heart size={14} className="text-red-500 animate-pulse" fill="currentColor" />
                <span>oleh</span>
                <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                  LuminarxDear
                </span>
              </span>
            </div>

            <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-500">
              <motion.a
                href="#"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                Kebijakan Privasi
              </motion.a>
              <span>•</span>
              <motion.a
                href="#"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                Syarat & Ketentuan
              </motion.a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;