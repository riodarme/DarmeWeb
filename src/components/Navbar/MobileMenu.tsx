"use client";

import { ChevronDown } from "lucide-react";
import Link from "next/link";

export default function MobileMenu() {
  const menuItems = [
    { label: "Beranda", href: "/" },
    {
      label: "Produk",
      children: [
        { label: "Pulsa", href: "/produk/pulsa" },
        { label: "Data", href: "/produk/data" },
        { label: "PLN", href: "/produk/pln" },
        { label: "E-Money", href: "/produk/emoney" },
      ],
    },
    { label: "Tentang", href: "#tentang" },
    { label: "Kontak", href: "#kontak" },
  ];

  return (
    <div className="md:hidden bg-white border-t border-gray-100 shadow-lg animate-slideDown rounded-b-lg">
      <div className="flex flex-col space-y-1 p-4 font-[Times_New_Roman]">
        {menuItems.map((item) =>
          item.children ? (
            <details key={item.label} className="group">
              <summary className="flex items-center justify-between px-3 py-2 cursor-pointer text-gray-800 hover:bg-green-50 rounded-md">
                {item.label}
                <ChevronDown
                  size={18}
                  className="transition-transform group-open:rotate-180"
                />
              </summary>
              <div className="pl-4 mt-2 flex flex-col space-y-1">
                {item.children.map((child) => (
                  <Link
                    key={child.label}
                    href={child.href}
                    className="px-3 py-2 rounded-md text-gray-600 hover:bg-green-50 hover:text-green-600 transition-colors"
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            </details>
          ) : (
            <Link
              key={item.label}
              href={item.href}
              className="px-3 py-2 rounded-md text-gray-800 hover:bg-green-50 transition-colors"
            >
              {item.label}
            </Link>
          )
        )}
      </div>

      {/* Animasi */}
      <style jsx>{`
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
