"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { Smartphone, Gamepad2, Zap, Sparkles, Star, Circle } from "lucide-react";

// Slide Data
const slides = [
  {
    icon: Smartphone,
    deco: Sparkles,
    title: "Beli Pulsa & Data Termurah 🚀",
    desc: "Proses cepat, harga bersaing, dan 24/7 full otomatis",
    cta: "Belanja Sekarang",
    href: "/produk/pulsa",
    bgGradient: "bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500",
  },
  {
    icon: Gamepad2,
    deco: Star,
    title: "Top Up E-Money & Game Instan 🎮",
    desc: "Saldo langsung masuk, aman dan terpercaya",
    cta: "Top Up Sekarang",
    href: "/produk/games",
    bgGradient: "bg-gradient-to-r from-indigo-500 via-blue-500 to-sky-500",
  },
  {
    icon: Zap,
    deco: Circle,
    title: "Bayar Tagihan Lebih Mudah 💡",
    desc: "PLN, PDAM, BPJS semua ada dalam 1 aplikasi",
    cta: "Bayar Tagihan",
    href: "/produk/pln",
    bgGradient: "bg-gradient-to-r from-pink-500 via-rose-500 to-red-500",
  },
];

export default function HeroBanner() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  if (!hydrated) return null;

  return (
    <Swiper modules={[Autoplay, Pagination]} autoplay={{ delay: 4000 }} pagination={{ clickable: true }} loop className="h-[220px] md:h-[340px] lg:h-[400px]">
      {slides.map((s, i) => (
        <SwiperSlide key={i}>
          <div className={`relative flex flex-col items-center justify-center h-full text-center text-white px-4 md:px-6 ${s.bgGradient}`}>
            <motion.div
              initial={false}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="relative z-10 w-12 h-12 md:w-16 md:h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-3 md:mb-4 shadow-lg">
              <s.icon className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </motion.div>

            <h1 className="relative z-10 text-lg md:text-4xl font-extrabold drop-shadow-lg">{s.title}</h1>
            <p className="relative z-10 mt-2 md:mt-3 text-xs md:text-lg max-w-xl opacity-90">{s.desc}</p>

            <motion.a
              href={s.href}
              initial={false}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative z-10 mt-4 md:mt-6 mb-4 md:mb-8 px-4 md:px-8 py-2 md:py-3 rounded-lg md:rounded-xl font-semibold 
                bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-500
                text-gray-900 shadow-lg shadow-black/20 
                hover:shadow-yellow-400/40 hover:brightness-110
                transition-all duration-300 text-xs md:text-base inline-block">
              {s.cta}
            </motion.a>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
