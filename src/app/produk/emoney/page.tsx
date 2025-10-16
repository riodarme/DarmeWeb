"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import UniversalInput from "@/components/UniversalInput";
import OperatorSection from "@/components/OperatorSection";
import PaymentSection, { TransactionItem } from "@/components/PaymentSection";
import { ApiEmoneyItem, EmoneyItem } from "@/types";
import { calculateTotalWithFee } from "@/utils/pricing";

interface TrxModalData {
  visible: boolean;
  message: string;
  token?: string;
  order_id?: string;
}

const EMONEY_TYPES = ["OVO", "DANA", "GoPay", "ShopeePay", "LinkAja", "Other"];

export default function EmoneyPage() {
  const [customerId, setCustomerId] = useState("");
  const [listData, setListData] = useState<Record<string, EmoneyItem[]>>({});
  const [activeTab, setActiveTab] = useState<string>(EMONEY_TYPES[0]);
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

  useEffect(() => {
    setHydrated(true);
  }, []);

  // ===== Fetch product list =====
  useEffect(() => {
    if (!hydrated) return;

    const fetchEmoney = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/digiflazz/pricelist", { method: "POST" });
        const json: { data?: ApiEmoneyItem[] } = await res.json();

        const grouped: Record<string, EmoneyItem[]> = initializeEmptyGroups();

        if (Array.isArray(json.data)) {
          const onlyEmoney = json.data.filter((item) =>
            item.category?.toLowerCase().includes("e-money")
          );

          onlyEmoney.forEach((i) => {
            const brandMatch =
              EMONEY_TYPES.find((t) =>
                (i.brand || "").toLowerCase().includes(t.toLowerCase())
              ) ||
              EMONEY_TYPES.find((t) =>
                (i.product_name || "").toLowerCase().includes(t.toLowerCase())
              );
            const groupKey = brandMatch ?? "Other";

            grouped[groupKey].push({
              nominal: i.product_name,
              harga: Number(i.price ?? 0),
              buyer_sku_code: i.buyer_sku_code,
            });
          });

          Object.keys(grouped).forEach((k) =>
            grouped[k].sort((a, b) => a.harga - b.harga)
          );
        }

        setListData(grouped);
        if (!grouped[activeTab]?.length) {
          const firstNonEmpty = Object.keys(grouped).find(
            (k) => grouped[k].length > 0
          );
          if (firstNonEmpty) setActiveTab(firstNonEmpty);
        }
      } catch (error) {
        console.error("Fetch e-money Error:", error);
        setListData(initializeEmptyGroups());
      } finally {
        setLoading(false);
      }
    };

    fetchEmoney();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  function initializeEmptyGroups(): Record<string, EmoneyItem[]> {
    const obj: Record<string, EmoneyItem[]> = {};
    EMONEY_TYPES.forEach((t) => (obj[t] = []));
    return obj;
  }

  const handleCustomerIdChange = (value: string) => {
    setCustomerId(value);
    setSelectedItem(null);
  };

  // ====== PILIH NOMINAL ======
  const handleSelectItem = (item: EmoneyItem) => {
    if (!customerId) return alert("Nomor pelanggan tidak boleh kosong.");
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

  // ====== KONFIRMASI MIDTRANS ======
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
    const order_id = `EMONEY-${Date.now()}`;
    const itemName = selectedItem.label.slice(0, 50);

    try {
      const res = await fetch("/api/midtrans/transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id,
          gross_amount: total,
          customer_details: { name: name || "Guest", email, phone: customerId },
          item_details: [
            {
              id: selectedItem.sku,
              name: itemName,
              price: selectedItem.price,
              quantity: 1,
            },
            { id: "FEE", name: fee_label, price: fee_value, quantity: 1 },
          ],
          payment_method: paymentMethod,
          custom_field1: selectedItem.sku,
          custom_field2: customerId,
          custom_field3: total,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success)
        throw new Error(data?.error || "Gagal membuat transaksi e-money.");

      setTrxSuccessModal({
        visible: true,
        message: "Transaksi e-money berhasil dibuat!",
        token: data.qr_string || data.redirect_url || data.payment_code || "",
        order_id,
      });

      if (data.qr_string) setCountdown(180);
    } catch (error) {
      alert("Terjadi kesalahan saat membuat transaksi e-money.");
      console.error(error);
    }
  };

  // ===== Countdown Timer =====
  useEffect(() => {
    if (!trxSuccessModal?.visible || countdown <= 0) return;
    const timer = setInterval(() => setCountdown((p) => p - 1), 1000);
    return () => clearInterval(timer);
  }, [trxSuccessModal?.visible, countdown]);

  useEffect(() => {
    if (countdown === 0 && trxSuccessModal?.token?.startsWith("data:image"))
      setTrxSuccessModal(null);
  }, [countdown, trxSuccessModal?.token]);

  if (!hydrated) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-sky-50 to-blue-100 py-8 px-4">
      <div className="container mx-auto max-w-2xl">
        <motion.div
          className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-blue-100"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-2xl font-semibold text-center text-blue-700 mb-6">
            💳 Top Up E-Money
          </h1>

          <UniversalInput
            value={customerId}
            onChange={handleCustomerIdChange}
            operator="E-Money"
            logo={`/logos/${activeTab.toLowerCase()}.png`}
            title={`Nomor Akun ${activeTab}`}
            mode="emoney"
          />

          {customerId && (
            <>
              <div className="flex flex-wrap justify-center gap-2 my-4">
                {EMONEY_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => setActiveTab(type)}
                    className={`px-4 py-2 rounded-full border text-sm font-medium transition ${
                      activeTab === type
                        ? "bg-blue-500 text-white border-blue-500"
                        : "bg-white text-blue-600 border-blue-200 hover:bg-blue-100"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {loading ? (
                <p className="text-center text-sm text-gray-500">
                  Memuat daftar produk...
                </p>
              ) : listData[activeTab]?.length ? (
                <OperatorSection
                  operator={activeTab}
                  logo={`/logos/${activeTab.toLowerCase()}.png`}
                  itemsList={listData[activeTab]}
                  onSelect={handleSelectItem}
                  loading={loading}
                />
              ) : (
                <p className="text-center text-sm text-gray-500">
                  Tidak ada produk untuk {activeTab}.
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

// ===== Modal transaksi =====
function TransactionModal({
  data,
  countdown,
  onClose,
}: {
  data: TrxModalData;
  countdown?: number;
  onClose: () => void;
}) {
  const isQR = data.token?.startsWith("data:image");
  const isLink = data.token?.startsWith("http");

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white p-6 rounded-2xl max-w-sm w-full shadow-xl text-center"
      >
        <h2 className="text-xl font-semibold mb-3 text-blue-700">
          {data.message}
        </h2>

        {isQR && (
          <>
            <Image
              src={data.token || ""}
              alt="QR Code"
              width={192}
              height={192}
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

        {isLink && (
          <a
            href={data.token}
            target="_blank"
            rel="noopener noreferrer"
            className="block mt-4 bg-blue-500 text-white py-2 rounded-lg font-medium hover:bg-blue-600 transition"
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
              className="text-xs text-blue-600 hover:underline"
            >
              Salin Kode
            </button>
          </div>
        )}

        <button
          className="mt-5 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          onClick={onClose}
        >
          Tutup
        </button>
      </motion.div>
    </div>
  );
}
