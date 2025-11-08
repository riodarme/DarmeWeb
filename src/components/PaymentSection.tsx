"use client";

import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { calculateTotalWithFee } from "@/utils/pricing";

export interface TransactionItem {
  label: string;
  price: number;
  sku: string;
  quantity?: number;
  category?: string;
}

interface PaymentSectionProps {
  items: TransactionItem[];
  paymentMethods?: string[];
  requireName?: boolean;
  buyerName?: string;
  buyerId?: string; // nomor HP untuk Digiflazz
  onConfirm?: (email: string, name: string, paymentMethod: string) => void;
}

interface MidtransTransactionResponse {
  qr_string?: string;
  redirect_url?: string;
  payment_code?: string;
  token?: string;
  error?: string;
}

export default function PaymentSection({
  items,
  paymentMethods = ["qris", "dana", "gopay", "ovo", "shopeepay", "alfamart"],
  requireName = false,
  buyerName,
  buyerId,
  onConfirm,
}: PaymentSectionProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState(paymentMethods[0]);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] =
    useState<MidtransTransactionResponse | null>(null);

  const baseTotal = items.reduce(
    (acc, item) => acc + item.price * (item.quantity || 1),
    0
  );
  const { total, fee_value, fee_label } = calculateTotalWithFee(
    baseTotal,
    paymentMethod
  );

  const handlePay = async () => {
    setErrorMessage("");
    setSuccessMessage("");
    setLoading(true);

    if (!email) {
      setErrorMessage("Masukkan email agar invoice terkirim!");
      setLoading(false);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessage("Format email tidak valid.");
      setLoading(false);
      return;
    }
    if (requireName && !name) {
      setErrorMessage("Nama wajib diisi.");
      setLoading(false);
      return;
    }

    if (onConfirm) {
      onConfirm(email, name || buyerName || "Guest", paymentMethod);
      setLoading(false);
      return;
    }

    const order_id = `ORDER-${Date.now()}`;

    // ganti bagian catch di handlePay
    try {
      const res = await fetch("/api/midtrans/transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id,
          gross_amount: total,
          customer_details: {
            name: name || buyerName || "Guest",
            email,
            phone: buyerId || "",
          },
          item_details: [
            ...items.map((i) => ({
              id: i.sku,
              name: i.label,
              price: i.price,
              quantity: i.quantity || 1,
            })),
            { id: "fee", name: fee_label, price: fee_value, quantity: 1 },
          ],
          payment_method: paymentMethod,
        }),
      });

      const data: MidtransTransactionResponse = await res.json();
      if (!res.ok) throw new Error(data?.error || "Gagal membuat transaksi");

      setModalData(data);
      setShowModal(true);
      setSuccessMessage("Transaksi berhasil dibuat!");
    } catch (err: unknown) {
      console.error("Payment Error:", err);
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Gagal memproses pembayaran.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 space-y-6">
        {/* Detail Pesanan */}
        <ul className="text-sm space-y-1">
          {items.map((c, i) => (
            <li
              key={i}
              className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 flex justify-between font-semibold"
            >
              <span>{c.label}</span>
              <span className="text-emerald-700">
                Rp {(c.price * (c.quantity || 1)).toLocaleString("id-ID")}
              </span>
            </li>
          ))}
        </ul>

        <div className="space-y-1 text-sm border-t pt-3 mt-3">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>Rp {baseTotal.toLocaleString("id-ID")}</span>
          </div>
          <div className="flex justify-between">
            <span>{fee_label}</span>
            <span>Rp {fee_value.toLocaleString("id-ID")}</span>
          </div>
          <div className="flex justify-between font-bold text-emerald-700 text-base border-t pt-2">
            <span>Total Bayar</span>
            <span>Rp {total.toLocaleString("id-ID")}</span>
          </div>
        </div>

        {/* Data Pembeli */}
        {requireName && (
          <input
            type="text"
            placeholder="Nama lengkap"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full mb-3 border border-emerald-200 rounded-lg p-2 text-sm font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        )}
        <input
          type="email"
          placeholder="Email aktif"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-emerald-200 rounded-lg p-2 text-sm font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
        />

        {/* Metode Pembayaran */}
        <div className="mt-3">
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
            {paymentMethods.map((m) => (
              <div
                key={m}
                onClick={() => setPaymentMethod(m)}
                className={`cursor-pointer rounded-xl border px-3 py-3 text-sm shadow-sm transition ${
                  paymentMethod === m
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-gray-200 bg-white hover:border-emerald-300"
                }`}
              >
                <div className="flex flex-col items-center gap-2 group">
                  <Image
                    src={`/icons/${m}.png`}
                    alt={m}
                    width={40}
                    height={40}
                    className="object-contain transition-transform group-hover:scale-110"
                  />
                  <span className="font-semibold text-sm text-gray-700 truncate text-center">
                    {m.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tombol Bayar */}
        <button
          onClick={handlePay}
          disabled={loading}
          className={`w-full py-3 rounded-lg font-bold text-sm transition ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:opacity-90"
          }`}
        >
          {loading ? "Memproses..." : "Bayar Sekarang"}
        </button>

        {errorMessage && (
          <p className="text-red-500 text-sm text-center">{errorMessage}</p>
        )}
        {successMessage && (
          <p className="text-green-600 text-sm text-center">{successMessage}</p>
        )}
      </div>

      {/* Modal Pembayaran */}
      {showModal && modalData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-[90%] max-w-md p-6 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-semibold text-center mb-4">
              Pembayaran {paymentMethod.toUpperCase()}
            </h2>

            <div className="flex flex-col items-center gap-4">
              {/* 🔹 QR Image */}
              {modalData.qr_string?.startsWith("data:image") && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={modalData.qr_string}
                  alt="QR Code"
                  className="mx-auto w-48 h-48 mb-2 rounded-lg border"
                />
              )}

              {/* 🔹 Kode Bayar */}
              {modalData.payment_code && (
                <div className="text-center">
                  <p className="text-sm text-gray-500">Kode Pembayaran</p>
                  <p className="text-2xl font-bold tracking-widest">
                    {modalData.payment_code}
                  </p>
                  <button
                    onClick={() =>
                      navigator.clipboard.writeText(
                        modalData.payment_code || ""
                      )
                    }
                    className="text-xs text-emerald-600 mt-1 hover:underline"
                  >
                    Salin Kode
                  </button>
                  <p className="text-xs text-gray-500 mt-1">
                    Bayar di gerai Alfamart terdekat
                  </p>
                </div>
              )}

              {/* 🔹 Link Pembayaran */}
              {modalData.redirect_url && (
                <a
                  href={modalData.redirect_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-600 text-white px-6 py-2 rounded-lg shadow hover:bg-green-700 transition"
                >
                  Buka Link Pembayaran
                </a>
              )}

              {/* 🔹 Default */}
              {!modalData.qr_string &&
                !modalData.payment_code &&
                !modalData.redirect_url && (
                  <p className="text-gray-600 text-sm">
                    Transaksi berhasil dibuat. Silakan cek status pembayaran.
                  </p>
                )}
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="mt-6 w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-lg transition"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </>
  );
}
