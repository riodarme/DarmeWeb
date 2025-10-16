"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

interface TransactionData {
  order_id: string;
  product_name?: string;
  customer_no?: string;
  price?: number;
  token_pln?: string;
  status?: string;
}

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const order_id = searchParams.get("order_id");

  const [loading, setLoading] = useState(true);
  const [trx, setTrx] = useState<TransactionData | null>(null);

  useEffect(() => {
    if (!order_id) return;

    const fetchData = async () => {
      try {
        const res = await fetch(`/api/transaction/status?order_id=${order_id}`);
        const data = await res.json();
        setTrx(data);
      } catch (err) {
        console.error("❌ Gagal ambil data transaksi:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [order_id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-gray-600">Memuat detail transaksi...</p>
      </div>
    );
  }

  if (!trx) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center">
        <h2 className="text-xl font-semibold text-red-600">
          Transaksi tidak ditemukan
        </h2>
        <p className="text-gray-500 mt-2">
          Periksa kembali kode transaksi kamu.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center bg-gray-50 px-4"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-md text-center">
        <div className="flex flex-col items-center gap-2">
          <div className="text-green-500 text-5xl">✅</div>
          <h1 className="text-2xl font-bold text-gray-800">
            Transaksi Berhasil!
          </h1>
          <p className="text-gray-500 text-sm">Order ID: {trx.order_id}</p>
        </div>

        <div className="border-t mt-4 pt-4 text-left text-gray-700 space-y-2">
          <p>
            <span className="font-semibold">Produk:</span>{" "}
            {trx.product_name || "Produk Digital"}
          </p>
          <p>
            <span className="font-semibold">Nomor Tujuan:</span>{" "}
            {trx.customer_no || "-"}
          </p>
          <p>
            <span className="font-semibold">Total:</span> Rp
            {trx.price?.toLocaleString("id-ID")}
          </p>

          {trx.token_pln && (
            <div className="mt-4 p-3 bg-gray-100 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">Token PLN:</p>
              <p className="font-mono text-lg font-bold text-blue-600">
                {trx.token_pln}
              </p>
            </div>
          )}

          <p className="mt-4 text-sm text-green-600 font-medium">
            Status: {trx.status || "Sukses"}
          </p>
        </div>

        <button
          onClick={() => (window.location.href = "/")}
          className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl transition"
        >
          Kembali ke Beranda
        </button>
      </div>
    </motion.div>
  );
}
