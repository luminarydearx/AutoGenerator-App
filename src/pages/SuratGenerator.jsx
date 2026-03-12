import React, { useState, useRef } from "react";
import { FileText, Download, Trash2, X } from "lucide-react";
import SignatureCanvas from "react-signature-canvas";
import { Document, Paragraph, TextRun, AlignmentType, Packer } from "docx";
import { motion } from "framer-motion";

const SuratGenerator = () => {
  const [formData, setFormData] = useState({
    nama: "",
    alamat: "",
    tujuan: "",
    keperluan: "",
    tempatLahir: "",
    tanggalLahir: "",
    pendidikan: "SMA",
  });
  const [generatedSurat, setGeneratedSurat] = useState("");
  const [signature, setSignature] = useState(null);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const sigCanvas = useRef(null);
  const suratRef = useRef(null);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  const getFormattedDate = () => {
    const today = new Date();
    return today.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const handleGenerate = () => {
    const tanggalFormatted = getFormattedDate();
    const kota = formData.alamat.split(",")[0].trim() || "Surabaya";

    const surat = `${kota}, ${tanggalFormatted}

Hal     : Lamaran Pekerjaan
Lampiran   : Tiga berkas
Yth. ${formData.tujuan}
${formData.alamat}

Dengan hormat,
Berdasarkan postingan akun instagram @lokerserang.top pada 15 Januari 2026 bahwa PT. Rahadhyan Integrasi Nusantara memerlukan karyawan ${formData.keperluan}. Oleh karena itu, saya bermaksud mengajukan permohonan untuk mengisi lowongan kerja tersebut.

Adapun identitas saya sebagai berikut
nama        : ${formData.nama}
tempat, tanggal lahir   : ${formData.tempatLahir}, ${formData.tanggalLahir}
alamat      : ${formData.alamat}
Pendidikan Terakhir   : ${formData.pendidikan}

Sebagai bahan pertimbangan Bapak/Ibu, saya sertakan lampiran sebagai berikut:
1. pasfoto,
2. fotokopi kartu pelajar,
3. fotokopi lowongan kerja, dan
4. fotokopi riwayat hidup

Demikian surat lamaran kerja ini saya buat. Besar harapan saya agar bisa diterima bekerja di perusahaan yang Bapak/Ibu pimpin. Atas perhatian Bapak/Ibu saya ucapkan terima kasih.

Hormat saya,
          ${formData.nama}`;

    setGeneratedSurat(surat);
  };

  const clearSignature = () => {
    sigCanvas.current.clear();
  };

  const saveSignature = () => {
    if (sigCanvas.current.isEmpty()) {
      alert("Silakan tanda tangan terlebih dahulu!");
      return;
    }

    const tempCanvas = sigCanvas.current.getCanvas();
    const ctx = tempCanvas.getContext("2d");
    const imageData = ctx.getImageData(
      0,
      0,
      tempCanvas.width,
      tempCanvas.height,
    );

    const whiteBgCanvas = document.createElement("canvas");
    whiteBgCanvas.width = tempCanvas.width;
    whiteBgCanvas.height = tempCanvas.height;
    const whiteCtx = whiteBgCanvas.getContext("2d");

    whiteCtx.fillStyle = "#ffffff";
    whiteCtx.fillRect(0, 0, whiteBgCanvas.width, whiteBgCanvas.height);
    whiteCtx.putImageData(imageData, 0, 0);

    setSignature(whiteBgCanvas.toDataURL("image/png"));
    setShowSignatureModal(false);
  };

  const handleDownloadDOCX = async () => {
    if (!generatedSurat || !formData.nama) return;

    const lines = generatedSurat.split("\n");
    const children = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes("Hormat saya,")) {
        children.push(
          new Paragraph({
            text: line,
            alignment: AlignmentType.LEFT,
          }),
        );

        if (i + 1 < lines.length && lines[i + 1].trim()) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: lines[i + 1].trim(),
                  bold: true,
                }),
              ],
              alignment: AlignmentType.RIGHT,
              indent: { left: 4000 },
            }),
          );
        }
        break;
      } else {
        children.push(
          new Paragraph({
            text: line,
            alignment: AlignmentType.LEFT,
          }),
        );
      }
    }

    const doc = new Document({
      sections: [{ properties: {}, children }],
    });

    try {
      const blob = await Packer.toBlob(doc);
      const link = document.createElement("a");
      const fileName = `SURAT LAMARAN PEKERJAAN (${formData.nama}).docx`;
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      link.click();
    } catch (err) {
      console.error("Error generating DOCX:", err);
      alert("Gagal membuat file DOCX. Coba lagi.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-indigo-900 dark:to-gray-900 space-y-6 p-4 md:p-8">
      {/* Glamorphism Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-300/20 dark:bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-300/20 dark:bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-purple-300/20 dark:bg-purple-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      </div>

      <motion.div
        className="backdrop-blur-xl bg-white/40 dark:bg-gray-800/40 rounded-3xl shadow-2xl p-8 border border-white/20 dark:border-gray-700/30"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.h2
          className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent mb-8 flex items-center"
          variants={itemVariants}
        >
          <FileText
            className="mr-3 text-blue-600 dark:text-blue-400"
            size={32}
          />
          Generator Surat Lamaran Kerja
        </motion.h2>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="space-y-4">
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Nama Lengkap
              </label>
              <input
                type="text"
                value={formData.nama}
                onChange={(e) =>
                  setFormData({ ...formData, nama: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl border border-white/30 dark:border-gray-600/30 bg-white/50 dark:bg-gray-700/50 backdrop-blur-md text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:bg-white/60 dark:hover:bg-gray-700/60"
                placeholder="Contoh: Dearly Febriano Irwansyah"
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Alamat
              </label>
              <textarea
                value={formData.alamat}
                onChange={(e) =>
                  setFormData({ ...formData, alamat: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl border border-white/30 dark:border-gray-600/30 bg-white/50 dark:bg-gray-700/50 backdrop-blur-md text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:bg-white/60 dark:hover:bg-gray-700/60"
                rows="3"
                placeholder="Contoh: Surabaya, Jalan Kejawan Putih Tambak No. 123"
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Tempat, Tanggal Lahir
              </label>
              <input
                type="text"
                value={formData.tempatLahir}
                onChange={(e) =>
                  setFormData({ ...formData, tempatLahir: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl border border-white/30 dark:border-gray-600/30 bg-white/50 dark:bg-gray-700/50 backdrop-blur-md text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:bg-white/60 dark:hover:bg-gray-700/60"
                placeholder="Contoh: Sidoarjo, 9 Februari 2008"
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Pendidikan Terakhir
              </label>
              <input
                type="text"
                value={formData.pendidikan}
                onChange={(e) =>
                  setFormData({ ...formData, pendidikan: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl border border-white/30 dark:border-gray-600/30 bg-white/50 dark:bg-gray-700/50 backdrop-blur-md text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:bg-white/60 dark:hover:bg-gray-700/60"
                placeholder="Contoh: SMA"
              />
            </motion.div>
          </div>

          <div className="space-y-4">
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Ditujukan Kepada
              </label>
              <textarea
                value={formData.tujuan}
                onChange={(e) =>
                  setFormData({ ...formData, tujuan: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl border border-white/30 dark:border-gray-600/30 bg-white/50 dark:bg-gray-700/50 backdrop-blur-md text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:bg-white/60 dark:hover:bg-gray-700/60"
                rows="3"
                placeholder="Contoh: HRD PT. Rahadyan Integrasi Nusantara"
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Posisi yang Dilamar
              </label>
              <input
                type="text"
                value={formData.keperluan}
                onChange={(e) =>
                  setFormData({ ...formData, keperluan: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl border border-white/30 dark:border-gray-600/30 bg-white/50 dark:bg-gray-700/50 backdrop-blur-md text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:bg-white/60 dark:hover:bg-gray-700/60"
                placeholder="Contoh: Staff Pendataan"
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Tanda Tangan Digital
              </label>
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setShowSignatureModal(true)}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 dark:from-blue-600/30 dark:to-indigo-600/30 border-2 border-blue-300/50 dark:border-blue-500/50 text-blue-700 dark:text-blue-200 rounded-xl hover:from-blue-500/30 hover:to-indigo-500/30 transition-all font-medium backdrop-blur-md"
                >
                  {signature ? "✓ Tanda Tangan Tersimpan" : "Buat Tanda Tangan"}
                </button>
                {signature && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSignature(null)}
                    className="px-4 py-3 bg-gradient-to-r from-red-500/20 to-pink-500/20 dark:from-red-600/30 dark:to-pink-600/30 border-2 border-red-300/50 dark:border-red-500/50 text-red-700 dark:text-red-200 rounded-xl hover:from-red-500/30 hover:to-pink-500/30 transition-all backdrop-blur-md"
                  >
                    <Trash2 size={20} />
                  </motion.button>
                )}
              </div>
              {signature && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-3 p-3 bg-white/20 dark:bg-gray-700/20 rounded-xl border border-white/30 dark:border-gray-600/30 backdrop-blur-md"
                >
                  <img
                    src={signature}
                    alt="Tanda tangan"
                    className="h-20 mx-auto"
                  />
                </motion.div>
              )}
            </motion.div>
          </div>
        </motion.div>

        <motion.button
          onClick={handleGenerate}
          disabled={!formData.nama || !formData.alamat}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          variants={itemVariants}
          className="mt-8 w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-semibold hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Generate Surat
        </motion.button>
      </motion.div>

      {showSignatureModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="backdrop-blur-xl bg-white/95 dark:bg-gray-800/95 rounded-3xl shadow-2xl max-w-2xl w-full p-6 border border-white/20 dark:border-gray-700/30"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                Buat Tanda Tangan
              </h3>
              <motion.button
                whileHover={{ rotate: 90 }}
                onClick={() => setShowSignatureModal(false)}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              >
                <X size={24} />
              </motion.button>
            </div>
            <div className="border-2 border-blue-300/50 dark:border-blue-500/50 rounded-2xl bg-white/50 dark:bg-gray-700/50 backdrop-blur-md">
              <SignatureCanvas
                ref={sigCanvas}
                canvasProps={{
                  className: "w-full h-64",
                  style: { touchAction: "none" },
                }}
                backgroundColor="transparent"
                penColor="#000000"
                penWidth={2}
              />
            </div>
            <div className="flex space-x-3 mt-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={clearSignature}
                className="flex-1 px-6 py-3 bg-gray-100/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-200/50 dark:hover:bg-gray-600/50 transition-all font-medium backdrop-blur-md border border-white/20 dark:border-gray-600/30"
              >
                Hapus
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={saveSignature}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-xl transition-all font-medium"
              >
                Simpan Tanda Tangan
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {generatedSurat && (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="backdrop-blur-xl bg-white/40 dark:bg-gray-800/40 rounded-3xl shadow-2xl p-8 border border-white/20 dark:border-gray-700/30"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
              Hasil Surat
            </h3>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDownloadDOCX}
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:shadow-xl transition-all font-medium"
            >
              <Download size={20} />
              <span>Download Word</span>
            </motion.button>
          </div>

          <motion.div
            ref={suratRef}
            className="p-8 bg-white/60 dark:bg-gray-700/60 rounded-2xl border border-white/30 dark:border-gray-600/30 backdrop-blur-md"
            style={{
              fontFamily: "'Arial', sans-serif",
              fontSize: "12pt",
              lineHeight: 1.5,
              maxWidth: "210mm",
              minHeight: "297mm",
              margin: "0 auto",
              padding: "20mm",
              boxSizing: "border-box",
            }}
          >
            {generatedSurat.split("\n").map((line, index) => {
              if (line.includes("Hormat saya,")) {
                return (
                  <React.Fragment key={index}>
                    <div style={{ marginBottom: "24pt" }}>{line}</div>
                    {index + 1 < generatedSurat.split("\n").length && (
                      <div
                        style={{
                          marginTop: "36pt",
                          textAlign: "right",
                          fontWeight: "bold",
                          marginLeft: "auto",
                          width: "100%",
                        }}
                      >
                        {generatedSurat.split("\n")[index + 1].trim()}
                      </div>
                    )}
                  </React.Fragment>
                );
              }
              return (
                <div key={index} style={{ marginBottom: "12pt" }}>
                  {line}
                </div>
              );
            })}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default SuratGenerator;
