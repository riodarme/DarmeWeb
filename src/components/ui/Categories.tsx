"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Smartphone,
  Wifi,
  Gamepad2,
  Gift,
  CreditCard,
  Zap,
  Tv,
  Droplets,
  HeartPulse,
} from "lucide-react";

const categories = [
  { name: "Pulsa", icon: Smartphone, href: "/produk/pulsa" },
  { name: "Data", icon: Wifi, href: "/produk/data" },
  { name: "PLN", icon: Zap, href: "/produk/pln" },
  { name: "E-Money", icon: CreditCard, href: "/produk/emoney" },
  { name: "Games", icon: Gamepad2, href: "/produk/games" },
  { name: "Voucher", icon: Gift, href: "/produk/voucher" },
  { name: "Streaming", icon: Tv, href: "/produk/streaming" },
  { name: "PDAM", icon: Droplets, href: "/produk/pdam" },
  { name: "BPJS", icon: HeartPulse, href: "/produk/bpjs" },
];

export default function Categories() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop grid */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="hidden md:grid grid-cols-5 lg:grid-cols-9 gap-6"
      >
        {categories.map(({ name, icon: Icon, href }) => {
          const active = pathname.startsWith(href);
          return (
            <Link key={name} href={href} aria-label={name}>
              <motion.div
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.95 }}
                className={`flex flex-col items-center p-4 rounded-xl shadow-sm transition cursor-pointer
                  ${
                    active
                      ? "bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-md"
                      : "bg-white/80 backdrop-blur-md hover:shadow-md"
                  }
                `}
              >
                <div
                  className={`w-12 h-12 flex items-center justify-center rounded-full ${
                    active ? "bg-white/20" : "bg-green-100"
                  }`}
                >
                  <Icon
                    className={`w-6 h-6 ${
                      active ? "text-white" : "text-green-600"
                    }`}
                  />
                </div>
                <p
                  className={`text-xs mt-2 font-medium text-center ${
                    active ? "text-white" : "text-gray-700"
                  }`}
                >
                  {name}
                </p>
              </motion.div>
            </Link>
          );
        })}
      </motion.div>

      {/* Mobile scroll */}
      <div className="flex md:hidden overflow-x-auto space-x-4 pb-4 pt-2 scrollbar-hide">
        {categories.map(({ name, icon: Icon, href }) => {
          const active = pathname.startsWith(href);
          return (
            <Link key={name} href={href} aria-label={name}>
              <div
                className={`flex flex-col items-center min-w-[90px] p-3 rounded-xl shadow-sm transition cursor-pointer
                  ${
                    active
                      ? "bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-md"
                      : "bg-white/80 backdrop-blur-md hover:shadow-md"
                  }
                `}
              >
                <div
                  className={`w-10 h-10 flex items-center justify-center rounded-full ${
                    active ? "bg-white/20" : "bg-green-100"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${
                      active ? "text-white" : "text-green-600"
                    }`}
                  />
                </div>
                <p
                  className={`text-xs mt-2 font-medium text-center ${
                    active ? "text-white" : "text-gray-700"
                  }`}
                >
                  {name}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}
