"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

import UniversalInput from "@/components/UniversalInput";
import OperatorSection from "@/components/OperatorSection";
import PaymentSection, { TransactionItem } from "@/components/PaymentSection";
import { GameItem, ApiGameItem } from "@/types";
import { applyPulsaMarkup, calculateTotalWithFee } from "@/utils/pricing";

interface TrxModalData {
  visible: boolean;
  message: string;
  token?: string;
  order_id?: string;
}

export default function GamePage() {
  const [gameList, setGameList] = useState<GameItem[]>([]);
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

  useEffect(() => {
    if (!hydrated) return;
    const fetchGame = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/digiflazz/pricelist", { method: "POST" });
        const json: { data?: ApiGameItem[] } = await res.json();
        if (!Array.isArray(json.data)) return setGameList([]);

        // daftar brand game populer
        const brands = [
          "mobile legends",
          "free fire",
          "genshin",
          "pubg",
          "valorant",
          "steam",
          "higgs domino",
        ];

        const onlyGame: GameItem[] = json.data
          .filter(
            (i) =>
              i.category?.toLowerCase() === "game" &&
              brands.some((b) => i.brand?.toLowerCase().includes(b))
          )
          .map((i) => ({
            nominal: i.product_name,
            harga: applyPulsaMarkup(Number(i.price ?? 0)),
            buyer_sku_code: i.buyer_sku_code,
          }))
          .sort((a, b) => a.harga - b.harga);

        setGameList(onlyGame);
      } catch (err: unknown) {
        console.error(err);
        setGameList([]);
      } finally {
        setLoading(false);
      }
    };
    fetchGame();
  }, [hydrated]);

  const handleSelectItem = (item: GameItem) => {
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

  const handleConfirm = async (
    email: string,
    name: string,
    paymentMethod = "qris"
  ) => {
    if (!selectedItem || !selectedItem.sku || !email.includes("@")) return;

    const { total, fee_value, fee_label } = calculateTotalWithFee(
      selectedItem.price,
      paymentMethod
    );
    const order_id = `GAME-${Date.now()}`;
    const itemName =
      selectedItem.label.length > 50
        ? selectedItem.label.slice(0, 47) + "..."
        : selectedItem.label;

    try {
      const res = await fetch("/api/midtrans/transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id,
          gross_amount: total,
          payment_method: paymentMethod,
          transaction_details: { order_id, gross_amount: total },
          customer_details: { first_name: name, email },
          item_details: [
            {
              id: selectedItem.sku,
              name: itemName,
              price: selectedItem.price,
              quantity: 1,
            },
            { id: "fee", name: fee_label, price: fee_value, quantity: 1 },
          ],
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Gagal membuat transaksi");

      setTrxSuccessModal({
        visible: true,
        message: "Transaksi berhasil dibuat!",
        token: data.qr_string || data.redirect_url || data.payment_code || "",
        order_id,
      });
      if (data.qr_string) setCountdown(180);
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) alert(err.message);
      else alert("Terjadi kesalahan saat membuat transaksi.");
    }
  };

  useEffect(() => {
    if (!trxSuccessModal?.visible || countdown <= 0) return;
    const timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [trxSuccessModal?.visible, countdown]);

  useEffect(() => {
    if (countdown === 0 && trxSuccessModal?.token?.startsWith("data:image")) {
      setTrxSuccessModal(null);
    }
  }, [countdown, trxSuccessModal?.token]);

  if (!hydrated) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-indigo-100 py-8 px-4">
      <div className="container mx-auto max-w-2xl">
        <motion.div
          className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-indigo-100"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-2xl font-semibold text-indigo-700 mb-4 text-center">
            Top Up Game Online
          </h1>

          <OperatorSection
            operator="Game"
            itemsList={gameList}
            onSelect={handleSelectItem}
            loading={loading}
          />
        </motion.div>

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

function TransactionModal({
  data,
  countdown,
  onClose,
}: {
  data: TrxModalData;
  countdown?: number;
  onClose: () => void;
}) {
  const isQR = data.token ? data.token.startsWith("data:image") : false;
  const isLink = data.token ? data.token.startsWith("http") : false;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white p-6 rounded-2xl max-w-sm w-full shadow-xl text-center"
      >
        <h2 className="text-xl font-semibold mb-3 text-indigo-700">
          {data.message}
        </h2>

        {isQR && data.token && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={data.token}
              alt="QR Code"
              className="mx-auto w-48 h-48 mb-4 rounded-lg border"
            />
            {countdown && countdown > 0 && (
              <p className="text-sm text-gray-500 mt-2">
                QR berlaku {Math.floor(countdown / 60)}:
                {(countdown % 60).toString().padStart(2, "0")}
              </p>
            )}
          </>
        )}

        {isLink && data.token && (
          <a
            href={data.token}
            target="_blank"
            rel="noopener noreferrer"
            className="block mt-4 bg-indigo-500 text-white py-2 rounded-lg font-medium hover:bg-indigo-600 transition"
          >
            Buka Link Pembayaran
          </a>
        )}

        {!isQR && !isLink && data.token && (
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm font-mono bg-gray-100 p-2 rounded">
              {data.token}
            </p>
            <button
              onClick={() => navigator.clipboard.writeText(data.token || "")}
              className="text-xs text-indigo-600 hover:underline"
            >
              Salin Kode
            </button>
          </div>
        )}

        <button
          className="mt-5 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition"
          onClick={onClose}
        >
          Tutup
        </button>
      </motion.div>
    </div>
  );
}
