"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

import UniversalInput from "@/components/UniversalInput";
import OperatorSection from "@/components/OperatorSection";
import PaymentSection, { TransactionItem } from "@/components/PaymentSection";
import { Operator, DataItem, ApiDataItem } from "@/types";
import {
  operatorPrefixes,
  operatorBrandMap,
  operatorLogos,
} from "@/constants/operator";
import { applyDataMarkup, calculateTotalWithFee } from "@/utils/pricing";

interface TrxModalData {
  visible: boolean;
  message: string;
  token?: string;
  order_id?: string;
}

export default function DataPage() {
  const [phone, setPhone] = useState("");
  const [operator, setOperator] = useState<Operator | "">("");
  const [dataList, setDataList] = useState<DataItem[]>([]);
  const [filteredList, setFilteredList] = useState<DataItem[]>([]);
  const [selectedType, setSelectedType] = useState<string>("all");
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

  // Fetch paket data
  useEffect(() => {
    if (!operator || !hydrated) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/digiflazz/pricelist", { method: "POST" });
        const json: { data?: ApiDataItem[] } = await res.json();
        if (!Array.isArray(json.data)) return setDataList([]);

        const brands = operatorBrandMap[operator];
        const onlyData: DataItem[] = json.data
          .filter(
            (i) =>
              i.category?.toLowerCase().includes("data") &&
              brands.some((b) => i.brand?.toLowerCase().includes(b))
          )
          .map((i) => ({
            nominal: i.product_name,
            harga: applyDataMarkup(Number(i.price ?? 0)),
            buyer_sku_code: i.buyer_sku_code,
          }))
          .sort((a, b) => a.harga - b.harga);

        setDataList(onlyData);
        setFilteredList(onlyData);
      } catch (err) {
        console.error(err);
        setDataList([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [operator, hydrated]);

  // Filter type paket
  const handleFilterChange = (type: string) => {
    setSelectedType(type);
    if (type === "all") setFilteredList(dataList);
    else
      setFilteredList(
        dataList.filter((item) =>
          item.nominal.toLowerCase().includes(type.toLowerCase())
        )
      );
  };

  const handleSelectItem = (item: DataItem) => {
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
    if (!selectedItem || !selectedItem.sku || !phone || !email.includes("@"))
      return;

    const { total, fee_value, fee_label } = calculateTotalWithFee(
      selectedItem.price,
      paymentMethod
    );
    const order_id = `DATA-${Date.now()}`;
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
          customer_details: { name, email, phone },
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
          custom_field2: phone,
          custom_field3: total,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Gagal membuat transaksi");

      setTrxSuccessModal({
        visible: true,
        message: "Transaksi paket data berhasil dibuat!",
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
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-sky-100 py-8 px-4">
      <div className="container mx-auto max-w-2xl">
        <motion.div
          className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-blue-100"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <UniversalInput
            value={phone}
            onChange={detectOperator}
            operator={operator}
            logo={operator ? operatorLogos[operator] : undefined}
            title="Beli Paket Data Internet"
          />

          {operator && (
            <>
              {/* Dropdown filter type paket */}
              <div className="flex items-center gap-3 mt-4 mb-3">
                <label className="text-sm text-gray-600">Filter:</label>
                <select
                  value={selectedType}
                  onChange={(e) => handleFilterChange(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
                >
                  <option value="all">Semua Paket</option>
                  <option value="combo">Combo</option>
                  <option value="flash">Flash</option>
                  <option value="unlimited">Unlimited</option>
                  <option value="lainnya">Lainnya</option>
                </select>
              </div>

              <OperatorSection
                operator={operator}
                logo={operatorLogos[operator]}
                itemsList={filteredList}
                onSelect={handleSelectItem}
                loading={loading}
              />
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

// Modal transaksi
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
        <h2 className="text-xl font-semibold mb-3 text-blue-700">
          {data.message}
        </h2>

        {isQR && data.token && (
          <>
            <Image
              src={data.token}
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

        {isLink && data.token && (
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
