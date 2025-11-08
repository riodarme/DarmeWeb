"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import UniversalInput from "@/components/UniversalInput";
import OperatorSection from "@/components/OperatorSection";
import PaymentSection, { TransactionItem } from "@/components/PaymentSection";
import { calculateTotalWithFee } from "@/utils/pricing";

// ── Types ──
export interface GameItem {
  nominal: string;
  harga: number;
  buyer_sku_code: string;
}

export interface ApiGameItem {
  category: string;
  brand: string;
  product_name: string;
  price: number;
  buyer_sku_code: string;
}

interface TrxModalData {
  visible: boolean;
  message: string;
  token?: string;
  order_id?: string;
}

// ── Daftar game ──
const GAME_LIST = [
  "Mobile Legends",
  "Free Fire",
  "PUBG Mobile",
  "Valorant",
  "Genshin Impact",
  "Higgs Domino",
  "Call of Duty",
  "Point Blank",
  "Steam",
  "Other",
];

export default function GamePage() {
  const [customerId, setCustomerId] = useState("");
  const [listData, setListData] = useState<Record<string, GameItem[]>>({});
  const [activeTab, setActiveTab] = useState(GAME_LIST[0]);
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

  // === Fetch data dari API Digiflazz ===
  useEffect(() => {
    if (!hydrated) return;
    const fetchGames = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/digiflazz/pricelist", { method: "POST" });
        const json: { data?: ApiGameItem[] } = await res.json();

        const grouped: Record<string, GameItem[]> = {};
        GAME_LIST.forEach((g) => (grouped[g] = []));

        if (Array.isArray(json.data)) {
          const onlyGames = json.data.filter((i) =>
            i.category?.toLowerCase().includes("game")
          );

          onlyGames.forEach((i) => {
            const brandMatch =
              GAME_LIST.find((g) =>
                (i.brand || "").toLowerCase().includes(g.toLowerCase())
              ) ||
              GAME_LIST.find((g) =>
                (i.product_name || "").toLowerCase().includes(g.toLowerCase())
              );

            const key = brandMatch ?? "Other";
            grouped[key].push({
              nominal: i.product_name,
              harga: Number(i.price || 0),
              buyer_sku_code: i.buyer_sku_code,
            });
          });

          Object.keys(grouped).forEach((g) =>
            grouped[g].sort((a, b) => a.harga - b.harga)
          );
        }

        setListData(grouped);
      } catch (err) {
        console.error("Fetch Game Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, [hydrated]);

  // === Saat user pilih item game ===
  const handleSelectItem = (item: GameItem) => {
    if (!customerId) return alert("Masukkan ID pemain dulu.");
    setSelectedItem({
      label: `${item.nominal} - ${customerId}`,
      price: item.harga,
      sku: item.buyer_sku_code,
    });
    setTimeout(
      () => paymentRef.current?.scrollIntoView({ behavior: "smooth" }),
      300
    );
  };

  // === Buat transaksi Midtrans ===
  const handleConfirm = async (
    email: string,
    name: string,
    paymentMethod = "qris"
  ) => {
    if (!selectedItem) return alert("Pilih nominal terlebih dahulu.");
    if (!email.includes("@")) return alert("Masukkan email yang valid.");

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
          customer_details: { name, email, phone: customerId },
          item_details: [
            {
              id: selectedItem.sku,
              name: itemName,
              price: selectedItem.price,
              quantity: 1,
            },
            { id: "fee", name: fee_label, price: fee_value, quantity: 1 },
          ],
          payment_method: paymentMethod,
          custom_field1: selectedItem.sku,
          custom_field2: customerId,
          custom_field3: total,
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

      if (data.qr_string) setCountdown(180); // aktifkan timer QR 3 menit
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) alert(err.message);
      else alert("Terjadi kesalahan saat membuat transaksi.");
    }
  };

  // === Countdown QR ===
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
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-indigo-50 to-blue-100 py-8 px-4">
      <div className="container mx-auto max-w-2xl">
        <motion.div
          className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-indigo-100"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-2xl md:text-3xl font-extrabold text-center mb-6 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500 bg-clip-text text-transparent">
            🎮 Top-Up Game
          </h1>

          <UniversalInput
            value={customerId}
            onChange={setCustomerId}
            operator={activeTab}
            logo={`/logos/${activeTab.toLowerCase().replace(/\s+/g, "")}.png`}
            title={`ID ${activeTab}`}
            mode="game"
          />

          {customerId && (
            <>
              <div className="flex flex-wrap justify-center gap-2 my-4">
                {GAME_LIST.map((g) => (
                  <button
                    key={g}
                    onClick={() => setActiveTab(g)}
                    className={`px-4 py-2 rounded-full border text-sm font-medium transition ${
                      activeTab === g
                        ? "bg-indigo-500 text-white border-indigo-500"
                        : "bg-white text-indigo-600 border-indigo-200 hover:bg-indigo-100"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>

              {loading ? (
                <p className="text-center text-gray-500">Memuat produk...</p>
              ) : listData[activeTab]?.length ? (
                <OperatorSection
                  operator={activeTab}
                  logo={`/logos/${activeTab
                    .toLowerCase()
                    .replace(/\s+/g, "")}.png`}
                  itemsList={listData[activeTab]}
                  onSelect={handleSelectItem}
                  loading={loading}
                />
              ) : (
                <p className="text-center text-gray-500">
                  Belum ada produk untuk {activeTab}.
                </p>
              )}
            </>
          )}
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

// === Komponen Modal Transaksi ===
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
            <div className="relative mx-auto w-48 h-48 mb-4">
              <Image
                src={data.token}
                alt="QR Code"
                fill
                className="object-contain rounded-lg border"
                unoptimized
              />
            </div>
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
