"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { TransactionQR } from "@/components/QrisModal";

import UniversalInput from "@/components/UniversalInput";
import OperatorSection from "@/components/OperatorSection";
import PaymentSection, { TransactionItem } from "@/components/PaymentSection";
import { Operator, PulsaItem, ApiPulsaItem } from "@/types";
import {
  operatorPrefixes,
  operatorBrandMap,
  operatorLogos,
} from "@/constants/operator";
import { applyPulsaMarkup, calculateTotalWithFee } from "@/utils/pricing";

interface TrxModalData {
  visible: boolean;
  message: string;
  token?: string;
  order_id?: string;
}

export default function PulsaPage() {
  const [phone, setPhone] = useState("");
  const [operator, setOperator] = useState<Operator | "">("");
  const [pulsaList, setPulsaList] = useState<PulsaItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<TransactionItem | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [trxSuccessModal, setTrxSuccessModal] = useState<TrxModalData | null>(
    null
  );
  const [countdown, setCountdown] = useState(0);
  const paymentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => setHydrated(true), []);

  // 🔹 Deteksi operator dari prefix
  const detectOperator = (value: string) => {
    setPhone(value);
    if (value.length < 4) return setOperator("");
    const prefix = value.slice(0, 4);
    const found =
      (Object.entries(operatorPrefixes) as [Operator, string[]][]).find(
        ([, list]) => list.includes(prefix)
      )?.[0] ?? "";
    setOperator(found);
  };

  // 🔹 Ambil daftar produk pulsa
  useEffect(() => {
    if (!operator || !hydrated) return;
    const fetchPulsa = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/digiflazz/pricelist", { method: "POST" });
        const json: { data?: ApiPulsaItem[] } = await res.json();
        if (!Array.isArray(json.data)) return setPulsaList([]);

        const brands = operatorBrandMap[operator];
        const onlyPulsa: PulsaItem[] = json.data
          .filter(
            (i) =>
              i.category?.toLowerCase() === "pulsa" &&
              brands.some((b) => i.brand?.toLowerCase().includes(b))
          )
          .map((i) => ({
            nominal: i.product_name,
            harga: applyPulsaMarkup(Number(i.price ?? 0)),
            buyer_sku_code: i.buyer_sku_code,
          }))
          .sort((a, b) => a.harga - b.harga);

        setPulsaList(onlyPulsa);
      } catch (err) {
        console.error("Gagal ambil daftar pulsa:", err);
        setPulsaList([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPulsa();
  }, [operator, hydrated]);

  const handleSelectItem = (item: PulsaItem) => {
    setSelectedItem({
      label: item.nominal,
      price: item.harga,
      sku: item.buyer_sku_code,
    });
  };

  useEffect(() => {
    if (selectedItem && paymentRef.current) {
      paymentRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [selectedItem]);

  // 🔹 Proses transaksi (sinkron dgn Midtrans Core API)
  const handleConfirm = async (
    email: string,
    name: string,
    paymentMethod = "qris"
  ) => {
    if (!selectedItem || !phone || !email.includes("@")) return;

    const { total, fee_value, fee_label } = calculateTotalWithFee(
      selectedItem.price,
      paymentMethod
    );
    const order_id = `PULSA-${Date.now()}`;
    const itemName =
      selectedItem.label.length > 50
        ? selectedItem.label.slice(0, 47) + "..."
        : selectedItem.label;

    try {
      const payload = {
        order_id,
        gross_amount: Number(total),
        payment_method: paymentMethod,
        customer_details: {
          first_name: name,
          email,
          phone,
        },
        item_details: [
          { name: itemName, price: Number(selectedItem.price), quantity: 1 },
          {
            name: fee_label || "Biaya tambahan",
            price: Number(fee_value),
            quantity: 1,
          },
        ],
      };

      const res = await fetch("/api/midtrans/transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Gagal membuat transaksi");

      const token: string =
        data.qr_string || data.redirect_url || data.payment_code || "";

      setTrxSuccessModal({
        visible: true,
        message: "Transaksi berhasil dibuat!",
        token,
        order_id,
      });

      if (data.qr_string) setCountdown(180); // 3 menit QRIS timeout
    } catch (err) {
      console.error("Transaksi gagal:", err);
      alert(
        err instanceof Error ? err.message : "Terjadi kesalahan pada transaksi."
      );
    }
  };

  // 🔹 Timer QR
  useEffect(() => {
    if (!trxSuccessModal?.visible || countdown <= 0) return;
    const timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [trxSuccessModal?.visible, countdown]);

  if (!hydrated) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100 py-8 px-4">
      <div className="container mx-auto max-w-2xl">
        {/* Input nomor HP */}
        <motion.div
          className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-emerald-100"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <UniversalInput
            value={phone}
            onChange={detectOperator}
            operator={operator}
            logo={operator ? operatorLogos[operator] : undefined}
            title="Isi Pulsa Online"
          />

          {operator && (
            <OperatorSection
              operator={operator}
              logo={operatorLogos[operator]}
              itemsList={pulsaList}
              onSelect={handleSelectItem}
              loading={loading}
            />
          )}
        </motion.div>

        {/* Metode pembayaran */}
        {selectedItem && (
          <motion.div
            ref={paymentRef}
            className="mt-6 scroll-mt-20"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <PaymentSection
              items={[selectedItem]}
              onConfirm={handleConfirm}
              paymentMethods={[
                "qris",
                "dana",
                "ovo",
                "gopay",
                "shopeepay",
                "alfamart",
              ]}
            />
          </motion.div>
        )}

        {/* Modal transaksi */}
        {trxSuccessModal?.visible && (
          <TransactionModal
            data={trxSuccessModal}
            countdown={countdown}
            onClose={() => setTrxSuccessModal(null)}
          />
        )}
      </div>
    </div>
  );
}

// 🟩 Modal hasil transaksi
function TransactionModal({
  data,
  countdown,
  onClose,
}: {
  data: TrxModalData;
  countdown?: number;
  onClose: () => void;
}) {
  const token = data.token ?? "";
  const isLink = token.startsWith("http");
  const isQRIS = token.startsWith("000201");
  const isPaymentCode = !isLink && !isQRIS && token.length > 0;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white p-6 rounded-2xl max-w-sm w-full shadow-xl text-center"
      >
        <h2 className="text-xl font-semibold mb-3 text-emerald-700">
          {data.message}
        </h2>

        {isQRIS && <TransactionQR code={token} onClose={onClose} />}

        {isLink && (
          <a
            href={token}
            target="_blank"
            rel="noopener noreferrer"
            className="block mt-4 bg-emerald-500 text-white py-2 rounded-lg font-medium hover:bg-emerald-600 transition"
          >
            Buka Link Pembayaran
          </a>
        )}

        {isPaymentCode && (
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm font-mono bg-gray-100 p-2 rounded">{token}</p>
            <button
              onClick={() => navigator.clipboard.writeText(token)}
              className="text-xs text-emerald-600 hover:underline"
            >
              Salin Kode
            </button>
          </div>
        )}

        {isQRIS && countdown && countdown > 0 && (
          <p className="text-xs text-gray-500 mt-2">
            QR berlaku {countdown}s lagi
          </p>
        )}

        <button
          className="mt-5 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition"
          onClick={onClose}
        >
          Tutup
        </button>
      </motion.div>
    </div>
  );
}
