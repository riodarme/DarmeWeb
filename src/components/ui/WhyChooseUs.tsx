"use client";

import { motion } from "framer-motion";
import { Zap, ShieldCheck, Headphones } from "lucide-react";

export default function WhyChooseUs() {
  return (
    <section
      id="why-choose-us"
      className="relative w-full py-20 bg-gradient-to-br from-green-50 via-white to-green-50"
    >
      <div className="container mx-auto px-6 max-w-6xl">
        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-3xl md:text-5xl font-extrabold text-center text-gray-900"
        >
          Kenapa Beli Produk Digital di{" "}
          <span className="bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 bg-clip-text text-transparent">
            DarmeWeb
          </span>
          ?
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          viewport={{ once: true }}
          className="mt-4 text-center max-w-2xl mx-auto text-lg text-gray-600"
        >
          <strong>DarmeWeb</strong> adalah platform terpercaya untuk membeli{" "}
          <strong>
            pulsa, paket data, token PLN, e-money, dan voucher game
          </strong>
          . Kami menghadirkan layanan cepat, aman, dan harga bersaing untuk
          semua kebutuhan digital Anda.
        </motion.p>

        {/* Cards */}
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          {/* 1 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-white border border-green-100 rounded-2xl p-8 text-center shadow-sm hover:shadow-lg transition group"
          >
            <div className="w-16 h-16 mx-auto flex items-center justify-center rounded-full bg-green-100 text-green-600 group-hover:bg-green-600 group-hover:text-white transition mb-4">
              <Zap size={32} aria-label="Transaksi Instan" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Transaksi Instan
            </h3>
            <p className="mt-3 text-gray-600 text-sm leading-relaxed">
              Pulsa, paket data, hingga token PLN langsung masuk dalam hitungan
              detik, 24/7 tanpa ribet.
            </p>
          </motion.div>

          {/* 2 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-white border border-green-100 rounded-2xl p-8 text-center shadow-sm hover:shadow-lg transition group"
          >
            <div className="w-16 h-16 mx-auto flex items-center justify-center rounded-full bg-green-100 text-green-600 group-hover:bg-green-600 group-hover:text-white transition mb-4">
              <ShieldCheck size={32} aria-label="Aman & Terpercaya" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Aman & Terpercaya
            </h3>
            <p className="mt-3 text-gray-600 text-sm leading-relaxed">
              Sistem pembayaran terjamin aman dengan harga yang selalu bersaing
              dan transparan.
            </p>
          </motion.div>

          {/* 3 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-white border border-green-100 rounded-2xl p-8 text-center shadow-sm hover:shadow-lg transition group"
          >
            <div className="w-16 h-16 mx-auto flex items-center justify-center rounded-full bg-green-100 text-green-600 group-hover:bg-green-600 group-hover:text-white transition mb-4">
              <Headphones size={32} aria-label="Support 24/7" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Support 24/7
            </h3>
            <p className="mt-3 text-gray-600 text-sm leading-relaxed">
              Tim kami siap membantu kapan saja agar setiap transaksi Anda
              berjalan lancar.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
