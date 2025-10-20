"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

import UniversalInput from "@/components/UniversalInput";
import OperatorSection from "@/components/OperatorSection";
import PaymentSection, { TransactionItem } from "@/components/PaymentSection";
import { PlnItem, ApiPlnItem } from "@/types";
import { calculateTotalWithFee } from "@/utils/pricing";

interface CustomerPrepaid {
  name: string;
  meter_no: string;
  subscriber_power?: number;
  power?: number;
}

interface CustomerPostpaid extends CustomerPrepaid {
  month: string;
  bill_amount: number;
}

type CustomerInfo = CustomerPrepaid | CustomerPostpaid;

interface PlnInquiryResponse<T = CustomerInfo> {
  status: boolean;
  message?: string;
  data: T;
}

interface TrxModalData {
  visible: boolean;
  message: string;
  token?: string;
  order_id?: string;
}

export default function PLNPage() {
  const [mode, setMode] = useState<"prepaid" | "postpaid">("prepaid");
  const [customerId, setCustomerId] = useState("");
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [listData, setListData] = useState<PlnItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<TransactionItem | null>(
    null
  );
  const [showPayment, setShowPayment] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [trxSuccessModal, setTrxSuccessModal] = useState<TrxModalData | null>(
    null
  );
  const [countdown, setCountdown] = useState(0);

  const paymentRef = useRef<HTMLDivElement>(null);

  useEffect(() => setHydrated(true), []);

  // 🟢 Fetch harga token PLN
  useEffect(() => {
    if (mode !== "prepaid" || !hydrated) return;

    const fetchPln = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/digiflazz/pricelist", { method: "POST" });
        const json: { data?: ApiPlnItem[] } = await res.json();

        if (!Array.isArray(json.data)) return setListData([]);
        const onlyPln = (json.data as ApiPlnItem[]).filter(
          (i: ApiPlnItem) => i.category?.toLowerCase() === "pln"
        );

        setListData(
          onlyPln
            .map((i) => ({
              nominal: i.product_name,
              harga: Number(i.price),
              buyer_sku_code: i.buyer_sku_code,
            }))
            .sort((a, b) => a.harga - b.harga)
        );
      } catch (err) {
        console.error("Fetch PLN Error:", err);
        setListData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPln();
  }, [mode, hydrated]);

  // 🟡 Inquiry data pelanggan PLN
  const handleInquiry = async (item?: PlnItem) => {
    if (!customerId) return alert("Nomor pelanggan tidak boleh kosong.");

    setLoading(true);
    try {
      const endpoint =
        mode === "prepaid" && item
          ? "/api/pln/inquiry-token"
          : "/api/pln/inquiry-postpaid";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_no: customerId,
          buyer_sku_code: item?.buyer_sku_code,
        }),
      });

      const data: PlnInquiryResponse = await res.json();
      if (!res.ok || !data.status)
        throw new Error(data.message || "Gagal melakukan inquiry PLN.");

      setCustomerInfo(data.data);

      if (mode === "prepaid" && item) {
        setSelectedItem({
          label: `${item.nominal} - ${data.data.name}`,
          price: item.harga,
          sku: item.buyer_sku_code,
        });
      } else if (mode === "postpaid") {
        const postpaid = data.data as CustomerPostpaid;
        setSelectedItem({
          label: `Tagihan ${postpaid.month} - ${postpaid.name}`,
          price: postpaid.bill_amount,
          sku: "pln-postpaid",
        });
      }

      setShowPayment(true);
      setTimeout(
        () => paymentRef.current?.scrollIntoView({ behavior: "smooth" }),
        300
      );
    } catch (err) {
      console.error("Inquiry Error:", err);
      alert(
        err instanceof Error ? err.message : "Gagal melakukan inquiry PLN."
      );
    } finally {
      setLoading(false);
    }
  };

  // 🔵 Handle transaksi (via Midtrans)
  const handleConfirm = async (
    email: string,
    name: string,
    paymentMethod = "qris"
  ) => {
    if (!selectedItem) return alert("Pilih nominal/tagihan terlebih dahulu.");
    if (!email.includes("@")) return alert("Masukkan email yang valid.");

    const { total, fee_value, fee_label } = calculateTotalWithFee(
      selectedItem.price,
      paymentMethod
    );
    const order_id = `PLN-${Date.now()}`;

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
              name: selectedItem.label,
              price: selectedItem.price,
              quantity: 1,
            },
            { id: "fee", name: fee_label, price: fee_value, quantity: 1 },
          ],
          payment_method: paymentMethod,
          custom_field1: selectedItem.sku,
          custom_field2: customerId,
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
    } catch (err) {
      console.error("Transaction Error:", err);
      alert(
        err instanceof Error ? err.message : "Gagal membuat transaksi PLN."
      );
    }
  };

  useEffect(() => {
    if (!trxSuccessModal?.visible || countdown <= 0) return;
    const timer = setInterval(() => setCountdown((p) => p - 1), 1000);
    return () => clearInterval(timer);
  }, [trxSuccessModal?.visible, countdown]);

  useEffect(() => {
    if (countdown === 0 && trxSuccessModal?.token?.startsWith("data:image")) {
      setTrxSuccessModal(null);
    }
  }, [countdown, trxSuccessModal?.token]);

  if (!hydrated) return null;

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-extrabold text-center mb-6 bg-gradient-to-r from-emerald-600 via-green-500 to-emerald-400 bg-clip-text text-transparent">
        ⚡ PLN Payment
      </h1>

      {/* Toggle */}
      <div className="flex justify-center mb-4">
        <div className="inline-flex rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          {["prepaid", "postpaid"].map((type) => (
            <button
              key={type}
              onClick={() => {
                setMode(type as "prepaid" | "postpaid");
                setShowPayment(false);
                setCustomerInfo(null);
                setSelectedItem(null);
              }}
              className={`px-4 py-2 text-sm font-medium transition-all ${
                mode === type
                  ? "bg-emerald-500 text-white shadow-inner"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {type === "prepaid" ? "⚡ Prabayar" : "💡 Pascabayar"}
            </button>
          ))}
        </div>
      </div>

      {/* Input pelanggan */}
      <UniversalInput
        value={customerId}
        onChange={(v) => {
          setCustomerId(v);
          setSelectedItem(null);
          setShowPayment(false);
          setCustomerInfo(null);
        }}
        mode="pln"
        title={mode === "prepaid" ? "Token Listrik PLN" : "Tagihan Listrik PLN"}
        logo="/logos/pln.png"
        operator="PLN"
      />

      {/* Info pelanggan */}
      {customerInfo && (
        <div className="mt-4 p-4 rounded-2xl bg-green-50 border border-green-200 shadow-sm">
          <p className="font-semibold text-green-700 mb-2">👤 Data Pelanggan</p>
          <p className="text-sm">Nama: {customerInfo.name}</p>
          <p className="text-sm">Meter: {customerInfo.meter_no}</p>
          <p className="text-sm">
            Daya:{" "}
            {"subscriber_power" in customerInfo
              ? customerInfo.subscriber_power ?? customerInfo.power ?? "-"
              : customerInfo.power ?? "-"}{" "}
            VA
          </p>

          {"month" in customerInfo && (
            <>
              <p className="text-sm">Bulan: {customerInfo.month}</p>
              <p className="text-sm font-bold text-green-700">
                Tagihan: Rp{" "}
                {(customerInfo as CustomerPostpaid).bill_amount.toLocaleString(
                  "id-ID"
                )}
              </p>
            </>
          )}
        </div>
      )}

      {/* Prabayar: pilih token */}
      <AnimatePresence>
        {mode === "prepaid" && customerId.length > 0 && (
          <motion.div
            key="operator-section"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="mt-4"
          >
            <OperatorSection
              operator="PLN Prepaid"
              logo="/logos/pln.png"
              itemsList={listData}
              onSelect={(item) => handleInquiry(item)}
              loading={loading}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pascabayar: tombol cek tagihan */}
      {mode === "postpaid" && !showPayment && (
        <button
          onClick={() => handleInquiry()}
          className="w-full mt-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-green-500 to-emerald-400 text-white font-semibold shadow hover:opacity-90 transition"
        >
          🔍 Cek Tagihan
        </button>
      )}

      {/* Pembayaran */}
      {selectedItem && showPayment && (
        <motion.div
          ref={paymentRef}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-6 scroll-mt-20"
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

      {/* Modal Transaksi */}
      {trxSuccessModal?.visible && (
        <TransactionModal
          data={trxSuccessModal}
          countdown={countdown}
          onClose={() => setTrxSuccessModal(null)}
        />
      )}
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
        <h2 className="text-xl font-semibold mb-3 text-emerald-700">
          {data.message}
        </h2>

        {isQR && (
          <>
            <Image
              src={data.token!}
              alt="QR Code"
              width={192}
              height={192}
              className="mx-auto mb-4 rounded-lg border"
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
            className="block mt-4 bg-emerald-500 text-white py-2 rounded-lg font-medium hover:bg-emerald-600 transition"
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
              className="text-xs text-emerald-600 hover:underline"
            >
              Salin Kode
            </button>
          </div>
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
