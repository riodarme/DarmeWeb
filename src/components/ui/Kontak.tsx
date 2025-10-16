"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send } from "lucide-react";

export default function Contact() {
  // State untuk controlled input
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  // Hydration-safe wrapper
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  if (!hydrated) return null; // sementara tidak render di server

  return (
    <section id="kontak" className="relative py-20 bg-white">
      <div className="container mx-auto px-6 max-w-6xl">
        {/* Heading */}
        <motion.h2 initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="text-3xl md:text-5xl font-extrabold text-center text-gray-900">
          Hubungi <span className="bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 bg-clip-text text-transparent">DarmeWeb</span>
        </motion.h2>

        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.8 }} viewport={{ once: true }} className="mt-4 text-center max-w-2xl mx-auto text-lg text-gray-600">
          Punya pertanyaan atau butuh bantuan seputar <strong>pulsa, paket data, token PLN, e-money, atau voucher game?</strong> Tim support kami siap membantu 24/7.
        </motion.p>

        <div className="mt-16 grid md:grid-cols-2 gap-10">
          {/* Info Kontak */}
          <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="space-y-6">
            <div className="flex items-start bg-gray-50 p-5 rounded-xl shadow hover:shadow-md transition">
              <Phone className="w-7 h-7 text-green-600 mr-4" />
              <div>
                <h4 className="font-semibold text-gray-900">WhatsApp</h4>
                <a href="https://wa.me/6281234567890" className="text-green-600 hover:underline">
                  +62 812-3456-7890
                </a>
              </div>
            </div>

            <div className="flex items-start bg-gray-50 p-5 rounded-xl shadow hover:shadow-md transition">
              <Mail className="w-7 h-7 text-green-600 mr-4" />
              <div>
                <h4 className="font-semibold text-gray-900">Email</h4>
                <a href="mailto:support@darmeweb.com" className="text-green-600 hover:underline">
                  support@darmeweb.com
                </a>
              </div>
            </div>

            <div className="flex items-start bg-gray-50 p-5 rounded-xl shadow hover:shadow-md transition">
              <MapPin className="w-7 h-7 text-green-600 mr-4" />
              <div>
                <h4 className="font-semibold text-gray-900">Alamat</h4>
                <p className="text-gray-600">Jl. Contoh Raya No. 123, Bekasi, Indonesia</p>
              </div>
            </div>
          </motion.div>

          {/* Form Kontak */}
          <motion.form initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }} className="bg-gray-50 shadow-lg rounded-2xl p-8 space-y-5">
            <div>
              <label htmlFor="contact-name" className="block text-gray-700 font-medium mb-1">
                Nama
              </label>
              <input
                id="contact-name"
                type="text"
                placeholder="Masukkan nama Anda"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="contact-email" className="block text-gray-700 font-medium mb-1">
                Email
              </label>
              <input
                id="contact-email"
                type="email"
                placeholder="Masukkan email Anda"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="contact-message" className="block text-gray-700 font-medium mb-1">
                Pesan
              </label>
              <textarea
                id="contact-message"
                placeholder="Tulis pesan Anda..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                rows={4}
              />
            </div>
            <button type="submit" className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 text-white font-semibold px-6 py-3 rounded-lg shadow hover:opacity-90 transition">
              <Send size={18} /> Kirim Pesan
            </button>
          </motion.form>
        </div>
      </div>
    </section>
  );
}
