"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import UniversalInput from "@/components/UniversalInput";
import OperatorSection from "@/components/OperatorSection";
import PaymentSection, { TransactionItem } from "@/components/PaymentSection";
import { Operator, DataItem, ApiDataItem } from "@/types";
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

interface MidtransTransactionResponse {
  qr_string?: string;
  redirect_url?: string;
  payment_code?: string;
  token?: string;
  error?: string;
}

export default function DataPage() {
  const [phone, setPhone] = useState("");
  const [operator, setOperator] = useState<Operator | "">("");
  const [dataList, setDataList] = useState<DataItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<TransactionItem | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [trxSuccessModal, setTrxSuccessModal] = useState<TrxModalData | null>(
    null
  );
  const [countdown, setCountdown] = useState(0);

  const paymentRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (!operator || !hydrated) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/digiflazz/pricelist", { method: "POST" });
        const json: { data?: ApiDataItem[] } = await res.json();

        if (!Array.isArray(json.data)) {
          setDataList([]);
          return;
        }

        const brands = operatorBrandMap[operator];
        const onlyData = json.data
          .filter(
            (i) =>
              i.category?.toLowerCase() === "data" &&
              brands.some((b) => i.brand?.toLowerCase().includes(b))
          )
          .map((i) => ({
            nominal: i.product_name,
            harga: applyPulsaMarkup(Number(i.price ?? 0)),
            buyer_sku_code: i.buyer_sku_code,
          }))
          .sort((a, b) => a.harga - b.harga);

        setDataList(onlyData);
      } catch (err) {
        console.error(err);
        setDataList([]);
      } finally {
        setLoading(false);
      }
    };
    void fetchData();
  }, [operator, hydrated]);

  const handleSelectItem = (item: DataItem) => {
    setSelectedItem({
      label: item.nominal,
      price: item.harga,
      sku: item.buyer_sku_code,
    });
  };

  useEffect(() => {
    if (selectedItem) {
      paymentRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [selectedItem]);

  const handleConfirm = async (
    email: string,
    name: string,
    paymentMethod: string = "qris"
  ) => {
    if (!selectedItem) return alert("Pilih paket data dulu.");
    if (!email.includes("@")) return alert("Masukkan email yang valid.");
    if (!phone) return alert("Masukkan nomor HP.");

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
          payment_method: paymentMethod,
          customer_details: { name, email, phone },
          item_details: [
            {
              id: selectedItem.sku,
              buyer_sku_code: selectedItem.sku,
              name: itemName,
              price: selectedItem.price,
              quantity: 1,
            },
            { id: "FEE", name: fee_label, price: fee_value, quantity: 1 },
          ],
        }),
      });

      const data: MidtransTransactionResponse = await res.json();

      if (data.error) return alert(data.error);
      if (
        !data.token &&
        !data.qr_string &&
        !data.payment_code &&
        !data.redirect_url
      ) {
        return alert("Gagal membuat transaksi Midtrans.");
      }

      setTrxSuccessModal({
        visible: true,
        message: "Transaksi paket data berhasil!",
        token:
          data.qr_string ||
          data.redirect_url ||
          data.payment_code ||
          data.token,
        order_id,
      });

      if (data.qr_string) setCountdown(180);
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat membuat transaksi.");
    }
  };

  // Countdown timer aman
  useEffect(() => {
    if (!trxSuccessModal?.visible) return;

    if (countdown > 0) {
      const timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [trxSuccessModal, countdown]);

  // Reset modal ketika countdown habis untuk QR
  useEffect(() => {
    if (countdown === 0 && trxSuccessModal?.token?.startsWith("data:image")) {
      setTrxSuccessModal(null);
    }
  }, [countdown, trxSuccessModal?.token]);

  if (!hydrated) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100 py-8 px-4">
      <div className="container mx-auto max-w-2xl">
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
            title="Isi Paket Data Online"
          />

          {operator && (
            <OperatorSection
              operator={operator}
              logo={operatorLogos[operator]}
              itemsList={dataList}
              onSelect={handleSelectItem}
              loading={loading}
            />
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

        {!isQR && !isLink && (
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
