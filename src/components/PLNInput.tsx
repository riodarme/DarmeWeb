"use client";

import { ChangeEvent, useState } from "react";

interface PLNInputProps {
  value: string;
  onChange: (value: string) => void;
  title?: string;
}

export default function PLNInput({
  value,
  onChange,
  title = "Token Listrik PLN",
}: PLNInputProps) {
  const [error, setError] = useState("");

  // --- Handle Input ---
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.replace(/\D/g, ""); // hanya angka
    onChange(inputValue);

    if (!inputValue) {
      setError("");
      return;
    }

    if (inputValue.length < 6 || inputValue.length > 15) {
      setError("ID Pelanggan / No Meter harus 6–15 digit angka");
    } else {
      setError("");
    }
  };

  return (
    <div className="mb-8">
      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-yellow-500 via-amber-400 to-orange-400 bg-clip-text text-transparent drop-shadow-md">
          {title} ⚡
        </h1>
        <p className="text-gray-500 mt-3 text-sm md:text-lg tracking-wide">
          Beli token PLN cepat & terpercaya hanya di{" "}
          <span className="font-semibold text-yellow-600">Darmeweb</span>
        </p>
      </div>

      {/* Input PLN */}
      <label className="block mb-2 text-sm font-semibold text-gray-600">
        Masukkan No Meter / ID Pelanggan
      </label>
      <div className="flex items-center gap-3 border border-gray-200 rounded-2xl px-4 py-3 bg-white shadow-sm hover:shadow-md transition-all focus-within:ring-2 focus-within:ring-yellow-400">
        <input
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          value={value}
          onChange={handleChange}
          placeholder="Contoh: 12345678901"
          className="flex-1 outline-none bg-transparent text-gray-800 text-base placeholder-gray-400"
        />
      </div>

      {/* Error */}
      {error && (
        <p className="mt-2 text-sm text-red-500 font-medium">{error}</p>
      )}
    </div>
  );
}
