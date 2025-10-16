"use client";

import { ChangeEvent, useState, useEffect } from "react";
import Image from "next/image";

interface UniversalInputProps {
  value: string;
  onChange: (value: string) => void;
  operator?: string;
  logo?: string;
  title?: string;
  mode?: "phone" | "pln" | "game" | "emoney" | "other";
}

export default function UniversalInput({ value: propValue, onChange, operator, logo, title = "Masukkan Data", mode = "phone" }: UniversalInputProps) {
  const [value, setValue] = useState(propValue || "");
  const [error, setError] = useState("");

  // id unik untuk label & input
  const inputId = `input-${mode}`;

  useEffect(() => {
    setValue(propValue || "");
  }, [propValue]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.replace(/\D/g, "");
    setValue(inputValue);
    onChange(inputValue);

    switch (mode) {
      case "phone":
        setError(/^08[0-9]{8,11}$/.test(inputValue) ? "" : "Nomor HP harus diawali 08 dan berisi 10–13 digit angka");
        break;
      case "pln":
        setError(inputValue.length >= 6 && inputValue.length <= 15 ? "" : "ID Pelanggan / No Meter harus 6–15 digit angka");
        break;
      case "game":
        setError(inputValue.length >= 5 ? "" : "User ID Game minimal 5 digit");
        break;
      case "emoney":
        setError(inputValue.length >= 6 ? "" : "Nomor e-Money tidak valid");
        break;
      default:
        setError("");
    }
  };

  return (
    <div className="mb-6 w-full max-w-md mx-auto">
      {/* Title */}
      {title && <h2 className="text-center-xl md:text-2xl font-semibold text-gray-800 mb-2">{title}</h2>}

      {/* Input Label */}
      <label htmlFor={inputId} className="block text-gray-700 text-sm font-medium mb-1">
        {mode === "phone" ? "Masukkan Nomor HP" : mode === "pln" ? "Masukkan No Meter / ID Pelanggan" : mode === "game" ? "Masukkan User ID Game" : mode === "emoney" ? "Masukkan Nomor e-Money" : "Masukkan Data"}
      </label>

      {/* Input Field */}
      <div className="flex items-center gap-2">
        {logo && <Image src={logo} alt={operator || "operator"} width={24} height={24} className="object-contain" />}
        <input
          id={inputId}
          name={inputId}
          type="tel"
          value={value}
          onChange={handleChange}
          placeholder={mode === "phone" ? "08xxxxxxxxxx" : mode === "pln" ? "12345678901" : mode === "game" ? "Masukkan User ID" : "Masukkan Nomor"}
          className="flex-1 border-b border-gray-300 focus:border-emerald-500 focus:outline-none py-1 px-2 text-gray-800 placeholder-gray-400"
        />
      </div>

      {/* Error Message */}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
