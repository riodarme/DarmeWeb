"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import Logo from "@/components/Navbar/Logo";
import NavLinks from "@/components/Navbar/NavLinks";
import MobileMenu from "@/components/Navbar/MobileMenu";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState<boolean | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isScrolled === null) setIsScrolled(false);
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isScrolled]);

  if (isScrolled === null) {
    return (
      <nav suppressHydrationWarning className="sticky top-0 z-50 font-[Times_New_Roman] bg-gradient-to-r from-green-400 via-emerald-500 to-green-600">
        <div className="container mx-auto px-4 flex items-center justify-between h-16">
          <Logo isScrolled={false} />
          <NavLinks isScrolled={false} />
          <button className="md:hidden p-2 rounded-lg text-white">
            <Menu size={24} />
          </button>
        </div>
      </nav>
    );
  }

  return (
    <nav suppressHydrationWarning className={`sticky top-0 z-50 transition-all duration-300 font-[Times_New_Roman] ${isScrolled ? "bg-white/90 shadow-md backdrop-blur-md" : "bg-gradient-to-r from-green-400 via-emerald-500 to-green-600"}`}>
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        <Logo isScrolled={isScrolled} />
        <NavLinks isScrolled={isScrolled} />
        <button onClick={() => setIsOpen((prev) => !prev)} className={`md:hidden p-2 rounded-lg transition ${isScrolled ? "text-gray-700 hover:bg-green-50" : "text-white hover:bg-white/10"}`}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      {isOpen && <MobileMenu />}
    </nav>
  );
}
