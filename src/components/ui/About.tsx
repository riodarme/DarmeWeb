"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Zap, Smartphone, Gamepad2 } from "lucide-react";

export default function About() {
  return (
    <section id="about" className="py-24 bg-white">
      <div className="container mx-auto px-6 max-w-6xl">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900">
            Tentang{" "}
            <span className="bg-gradient-to-r from-green-400 via-emerald-500 to-green-600 text-transparent bg-clip-text">
              DarmeWeb
            </span>
          </h2>
          <p className="mt-3 text-lg text-gray-700 max-w-2xl mx-auto">
            <strong>DarmeWeb</strong> adalah penyedia{" "}
            <strong>
              pulsa online murah, paket data semua operator, token PLN, e-money,
              dan voucher game
            </strong>{" "}
            terpercaya di Bekasi. Nikmati transaksi cepat, aman, instan 24/7,
            dengan harga terbaik dan layanan pelanggan yang ramah.
          </p>
        </motion.div>

        {/* 2 Column Content */}
        <div className="grid md:grid-cols-2 gap-12 mt-16">
          {/* Komitmen Kami */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="w-2 h-6 bg-gradient-to-b from-green-400 to-emerald-600 mr-3 rounded"></span>
              Komitmen Kami
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Kami berkomitmen memberikan pengalaman transaksi{" "}
              <strong>mudah, aman, dan instan</strong>. Semua produk selalu
              diperbarui dengan harga terbaik, sehingga pelanggan tidak perlu
              khawatir soal biaya maupun kecepatan layanan.
            </p>
            <p className="mt-3 text-gray-600 leading-relaxed">
              Lebih dari sekadar menjual produk digital, kami juga memberikan{" "}
              <strong>dukungan penuh 24/7</strong> agar setiap transaksi
              berjalan lancar dari awal hingga akhir.
            </p>
          </motion.div>

          {/* Layanan Unggulan */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="w-2 h-6 bg-gradient-to-b from-green-400 to-emerald-600 mr-3 rounded"></span>
              Layanan Unggulan
            </h3>
            <ul className="space-y-4 text-gray-700">
              <li className="flex items-start">
                <Smartphone className="w-5 h-5 text-emerald-500 mr-2 mt-1" />
                Pulsa & Paket Data Semua Operator
              </li>
              <li className="flex items-start">
                <Zap className="w-5 h-5 text-emerald-500 mr-2 mt-1" />
                Token PLN & Pembayaran Digital Instan
              </li>
              <li className="flex items-start">
                <Gamepad2 className="w-5 h-5 text-emerald-500 mr-2 mt-1" />
                Voucher Game & Top Up E-Wallet
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 mr-2 mt-1" />
                Harga Murah, Layanan Cepat, Support 24/7
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20"
        >
          {[
            { value: "10K+", label: "Transaksi Sukses" },
            { value: "100%", label: "Kepuasan Pelanggan" },
            { value: "24/7", label: "Support Online" },
            { value: "5.0", label: "Rating Pengguna" },
          ].map((stat, i) => (
            <div
              key={i}
              className="p-6 bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl shadow hover:shadow-lg transition text-center"
            >
              <p className="text-3xl font-bold text-emerald-600">
                {stat.value}
              </p>
              <p className="text-gray-700 mt-2">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
