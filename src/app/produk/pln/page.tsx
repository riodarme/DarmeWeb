"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

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

  const paymentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHydrated(true);
    const script = document.createElement("script");
    script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
    script.setAttribute(
      "data-client-key",
      process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || ""
    );
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    if (mode !== "prepaid" || !hydrated) return;

    const fetchPln = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/digiflazz/pricelist", { method: "POST" });
        const json: { data?: ApiPlnItem[] } = await res.json();

        if (Array.isArray(json.data)) {
          const onlyPln = json.data.filter(
            (item) => item.category?.toLowerCase() === "pln"
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
        } else {
          setListData([]);
        }
      } catch (err) {
        console.error("Fetch PLN Error:", err);
        setListData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPln();
  }, [mode, hydrated]);

  const handleInquiry = async (item?: PlnItem) => {
    if (!customerId) return alert("Nomor pelanggan tidak boleh kosong.");

    setLoading(true);
    try {
      let res: Response | undefined;
      if (mode === "prepaid" && item) {
        res = await fetch("/api/pln/inquiry-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customer_no: customerId,
            buyer_sku_code: item.buyer_sku_code,
          }),
        });
      } else if (mode === "postpaid") {
        res = await fetch("/api/pln/inquiry-postpaid", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ customer_no: customerId }),
        });
      }

      if (!res) return;
      const data: PlnInquiryResponse = await res.json();

      if (data.status && data.data) {
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
      } else {
        alert(data.message ?? "Gagal mendapatkan data pelanggan.");
      }
    } catch (err) {
      console.error("Inquiry Error:", err);
      alert("Gagal melakukan inquiry PLN.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Versi core API, tanpa Snap
  const handleConfirm = async (
    email: string,
    name: string,
    paymentMethod: string = "qris"
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
          customer_details: {
            name: name || "Guest",
            email,
            phone: customerId,
          },
          item_details: [
            {
              id: selectedItem.sku,
              name:
                selectedItem.label.length > 50
                  ? selectedItem.label.slice(0, 47) + "..."
                  : selectedItem.label,
              price: selectedItem.price,
              quantity: 1,
            },
            {
              id: "FEE",
              name: fee_label,
              price: fee_value,
              quantity: 1,
            },
          ],
        }),
      });

      const data = await res.json();
      if (!data.success) return alert("Gagal membuat transaksi.");

      console.log("✅ Transaksi berhasil:", order_id);
      alert("Transaksi berhasil dibuat. Silakan cek status pembayaran.");
    } catch (err) {
      console.error("Transaction Error:", err);
      alert("Terjadi kesalahan saat membuat transaksi PLN.");
    }
  };

  if (!hydrated) return null;

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-extrabold text-center mb-6 bg-gradient-to-r from-emerald-600 via-green-500 to-emerald-400 bg-clip-text text-transparent">
        ⚡ PLN Payment
      </h1>

      {/* Mode toggle */}
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

      {/* Token PLN */}
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

      {/* Pascabayar → cek tagihan */}
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
    </div>
  );
}
