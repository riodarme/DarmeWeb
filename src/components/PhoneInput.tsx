"use client";

import { ChangeEvent, useState } from "react";
import Image from "next/image";

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  operator: string;
  logo?: string;
  title?: string;
  mode?: "phone" | "pln"; // ✅ fleksibel: pulsa / PLN
}

export default function PhoneInput({
  value,
  onChange,
  operator,
  logo,
  title = "Isi Pulsa Online",
  mode = "phone",
}: PhoneInputProps) {
  const [error, setError] = useState("");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.replace(/\D/g, ""); // hanya angka
    onChange(inputValue);

    // --- Validasi berdasarkan mode ---
    if (mode === "phone") {
      if (!/^08[0-9]{8,11}$/.test(inputValue)) {
        setError("Nomor HP harus diawali 08 dan berisi 10–13 digit angka");
      } else {
        setError("");
      }
    }

    if (mode === "pln") {
      if (inputValue.length < 6 || inputValue.length > 15) {
        setError("ID Pelanggan / No Meter harus 6–15 digit angka");
      } else {
        setError("");
      }
    }
  };

  return (
    <div className="mb-8">
      {/* Title & Subtitle */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-emerald-600 via-green-500 to-emerald-400 bg-clip-text text-transparent drop-shadow-md">
          {title} <span className="animate-pulse">⚡</span>
        </h1>
        <p className="text-gray-500 mt-3 text-sm md:text-lg tracking-wide">
          Cepat, mudah, & terpercaya hanya di{" "}
          <span className="font-semibold text-emerald-600">Darmeweb</span>
        </p>
      </div>

      {/* Input Section */}
      <label className="block mb-2 text-sm font-semibold text-gray-600">
        {mode === "phone"
          ? "Masukkan Nomor HP"
          : "Masukkan No Meter / ID Pelanggan"}
      </label>
      <div className="flex items-center gap-3 border border-gray-200 rounded-2xl px-4 py-3 bg-white shadow-sm hover:shadow-md transition-all focus-within:ring-2 focus-within:ring-emerald-400">
        {logo && (
          <div className="flex items-center justify-center w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-xl">
            <Image
              src={logo}
              alt={operator || "operator"}
              width={28}
              height={28}
              className="object-contain w-7 h-7"
            />
          </div>
        )}
        <input
          type="tel"
          value={value}
          onChange={handleChange}
          placeholder={
            mode === "phone" ? "08xxxxxxxxxx" : "Contoh: 12345678901"
          }
          className="flex-1 outline-none bg-transparent text-gray-800 text-base placeholder-gray-400"
        />
      </div>

      {/* Error Message */}
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
}
