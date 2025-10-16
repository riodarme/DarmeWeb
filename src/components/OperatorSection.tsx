import { motion } from "framer-motion";
import { useState } from "react";
import Image from "next/image";

// --- fungsi markup standar ---
const applyMarkup = (price: number) => {
  let markup: number;
  if (price <= 25000) markup = 1500;
  else if (price <= 50000) markup = 2000;
  else markup = 5000;

  const newPrice = price + markup;
  return Math.ceil(newPrice / 500) * 500;
};

interface OperatorItem {
  nominal: string;
  harga: number;
  buyer_sku_code: string;
}

interface OperatorSectionProps {
  operator: string;
  logo?: string; // opsional
  itemsList: OperatorItem[];
  onSelect: (item: OperatorItem) => void;
  loading: boolean;
}

export default function OperatorSection({
  operator,
  logo,
  itemsList,
  onSelect,
  loading,
}: OperatorSectionProps) {
  const [selectedNominal, setSelectedNominal] = useState<string | null>(null);

  return (
    <div>
      {/* Header Operator */}
      <div className="flex items-center gap-4 mb-6">
        {logo ? (
          <div className="w-14 h-14 relative rounded-full overflow-hidden">
            <Image
              src={logo}
              alt={operator}
              className="object-cover w-full h-full"
              width={56} // w-14 = 56px
              height={56} // h-14 = 56px
              priority
            />
          </div>
        ) : (
          <div
            className="w-14 h-14 flex items-center justify-center rounded-full 
              bg-gradient-to-br from-emerald-400 to-green-700 text-white font-bold text-lg shadow-md"
          >
            {operator
              .split(" ")
              .map((word) => word.charAt(0))
              .join("")
              .toUpperCase()}
          </div>
        )}

        <div>
          <h3 className="font-bold text-gray-800 text-lg">{operator}</h3>
          <p className="text-sm text-gray-500">Nomor terdeteksi {operator}</p>
        </div>
      </div>

      {/* Loading / Empty */}
      {loading ? (
        <p className="text-gray-500">⏳ Memuat daftar Produk</p>
      ) : itemsList.length === 0 ? (
        <p className="text-gray-500">Tidak ada data pulsa untuk {operator}</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {itemsList.map((item) => {
            const baseNominal = parseInt(item.nominal.replace(/\D/g, ""), 10);
            const standardPrice = applyMarkup(baseNominal);
            const isDiscount = item.harga < standardPrice;
            const discountPercent = isDiscount
              ? Math.round(((standardPrice - item.harga) / standardPrice) * 100)
              : 0;

            const isActive = selectedNominal === item.nominal;

            return (
              <motion.div
                whileHover={{ y: -5, scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
                key={item.buyer_sku_code}
                onClick={() => {
                  setSelectedNominal(item.nominal);
                  onSelect(item);
                }}
                role="button"
                aria-pressed={isActive}
                tabIndex={0}
                className={`relative p-4 rounded-2xl border cursor-pointer text-center shadow-md hover:shadow-emerald-300/40 transition-all overflow-hidden group
                ${
                  isActive
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-white/90 border-emerald-200"
                }`}
              >
                {/* Badge Diskon */}
                {isDiscount && (
                  <span
                    className="absolute top-2 right-2 -rotate-6
                    bg-gradient-to-r from-orange-500 to-red-500
                    text-white text-[11px] px-2 py-1
                    rounded-full font-bold shadow-md animate-slow-blink"
                  >
                    -{discountPercent}%
                  </span>
                )}

                {/* Nominal */}
                <h4
                  className={`font-bold text-lg mt-2 ${
                    isActive ? "text-white" : "text-emerald-700"
                  }`}
                >
                  {item.nominal}
                </h4>

                {/* Harga */}
                {isDiscount ? (
                  <div className="mt-2">
                    <p
                      className={`text-xs line-through ${
                        isActive ? "text-white/70" : "text-gray-400"
                      }`}
                    >
                      Rp {standardPrice.toLocaleString("id-ID")}
                    </p>
                    <p
                      className={`font-bold text-base mt-1 ${
                        isActive ? "text-white" : "text-emerald-600"
                      }`}
                    >
                      Rp {item.harga.toLocaleString("id-ID")}
                    </p>
                  </div>
                ) : (
                  <p
                    className={`text-sm mt-2 ${
                      isActive ? "text-white" : "text-gray-600"
                    }`}
                  >
                    Rp {item.harga.toLocaleString("id-ID")}
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
