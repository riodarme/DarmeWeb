"use client";

import Image from "next/image";

interface LogoProps {
  isScrolled: boolean;
}

export default function Logo({ isScrolled }: LogoProps) {
  return (
    <div className={`flex items-center text-2xl font-bold transition-colors duration-300 ${isScrolled ? "text-green-700" : "text-white"}`}>
      {/* Logo Icon (SVG atau PNG) */}
      <Image
        src="/logos/logo.png"
        alt="Darmeweb Logo"
        width={90} // lebih besar
        height={90}
        className="mr-2 drop-shadow-lg rounded-lg p-1"
        priority
      />
    </div>
  );
}
