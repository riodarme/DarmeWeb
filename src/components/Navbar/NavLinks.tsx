"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface NavLinksProps {
  isScrolled: boolean;
}

export default function NavLinks({ isScrolled }: NavLinksProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const textColor = isScrolled ? "text-gray-800" : "text-white";
  const hoverUnderline =
    "absolute left-0 -bottom-1 h-[2px] bg-green-500 rounded-full";

  return (
    <div className="hidden md:flex items-center space-x-8 relative font-[Times_New_Roman]">
      {/* ==== Beranda ==== */}
      <Link href="/" className={`relative group ${textColor}`}>
        Beranda
        <motion.span
          layoutId="underline"
          className={`${hoverUnderline}`}
          initial={{ width: 0 }}
          whileHover={{ width: "100%" }}
          transition={{ duration: 0.25 }}
        />
      </Link>

      {/* ==== Produk Dropdown ==== */}
      <div
        className="relative"
        onMouseEnter={() => setDropdownOpen(true)}
        onMouseLeave={() => setDropdownOpen(false)}
      >
        <button
          type="button"
          className={`flex items-center gap-1 relative group ${textColor}`}
        >
          Produk
          <ChevronDown size={16} />
          <motion.span
            layoutId="underline"
            className={`${hoverUnderline}`}
            initial={{ width: 0 }}
            whileHover={{ width: "100%" }}
            transition={{ duration: 0.25 }}
          />
        </button>

        <AnimatePresence>
          {dropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="absolute left-0 mt-3 w-48 bg-white/90 backdrop-blur-md shadow-lg border border-green-100 rounded-2xl py-2 z-50"
            >
              {[
                { href: "/produk/pulsa", label: "Pulsa" },
                { href: "/produk/data", label: "Data" },
                { href: "/produk/pln", label: "PLN" },
                { href: "/produk/emoney", label: "E-Money" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block px-5 py-2 text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-lg transition"
                >
                  {item.label}
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ==== Tentang ==== */}
      <Link href="#tentang" className={`relative group ${textColor}`}>
        Tentang
        <motion.span
          layoutId="underline"
          className={`${hoverUnderline}`}
          initial={{ width: 0 }}
          whileHover={{ width: "100%" }}
          transition={{ duration: 0.25 }}
        />
      </Link>

      {/* ==== Kontak ==== */}
      <Link href="#kontak" className={`relative group ${textColor}`}>
        Kontak
        <motion.span
          layoutId="underline"
          className={`${hoverUnderline}`}
          initial={{ width: 0 }}
          whileHover={{ width: "100%" }}
          transition={{ duration: 0.25 }}
        />
      </Link>
    </div>
  );
}
