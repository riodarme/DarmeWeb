"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

interface NavLinksProps {
  isScrolled: boolean;
}

export default function NavLinks({ isScrolled }: NavLinksProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div className="hidden md:flex items-center space-x-6 relative font-[Times_New_Roman]">
      {/* Beranda */}
      <Link
        href="/"
        className={`relative group ${
          isScrolled ? "text-gray-700" : "text-white"
        }`}
      >
        Beranda
        <span className="absolute left-0 -bottom-1 w-0 group-hover:w-full transition-all h-[2px] bg-green-500"></span>
      </Link>

      {/* Produk Dropdown */}
      <div
        className="relative"
        onMouseEnter={() => setDropdownOpen(true)}
        onMouseLeave={() => setDropdownOpen(false)}
      >
        <button
          type="button"
          className={`flex items-center gap-1 relative group ${
            isScrolled ? "text-gray-700" : "text-white"
          }`}
        >
          Produk
          <ChevronDown size={16} />
          <span className="absolute left-0 -bottom-1 w-0 group-hover:w-full transition-all h-[2px] bg-green-500"></span>
        </button>

        {dropdownOpen && (
          <div className="absolute left-0 mt-2 w-44 bg-white shadow-lg rounded-lg py-2 animate-fadeSlide z-50">
            <Link
              href="/produk/pulsa"
              className="block px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-green-600"
            >
              Pulsa
            </Link>
            <Link
              href="/produk/data"
              className="block px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-green-600"
            >
              Data
            </Link>
            <Link
              href="/produk/pln"
              className="block px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-green-600"
            >
              PLN
            </Link>
            <Link
              href="/produk/emoney"
              className="block px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-green-600"
            >
              E-Money
            </Link>
          </div>
        )}
      </div>
      {/* Tentang */}
      <Link
        href="#tentang"
        className={`relative group ${
          isScrolled ? "text-gray-700" : "text-white"
        }`}
      >
        Tentang
        <span className="absolute left-0 -bottom-1 w-0 group-hover:w-full transition-all h-[2px] bg-green-500"></span>
      </Link>

      {/* Kontak */}
      <Link
        href="#kontak"
        className={`relative group ${
          isScrolled ? "text-gray-700" : "text-white"
        }`}
      >
        Kontak
        <span className="absolute left-0 -bottom-1 w-0 group-hover:w-full transition-all h-[2px] bg-green-500"></span>
      </Link>
    </div>
  );
}
