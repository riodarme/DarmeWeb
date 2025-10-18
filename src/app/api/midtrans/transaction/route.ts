import { NextResponse } from "next/server";
import midtransClient from "midtrans-client";

// 🔐 Ambil environment variables dari Vercel
const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY || "";
const MIDTRANS_CLIENT_KEY = process.env.MIDTRANS_CLIENT_KEY || "";
const MIDTRANS_IS_PRODUCTION = true; // ✅ mode produksi

// ⚠️ Log peringatan jika key kosong
if (!MIDTRANS_SERVER_KEY) {
  console.log("Server Key:", MIDTRANS_SERVER_KEY ? "✅ Loaded" : "❌ Missing");
  console.log("Server Key Prefix:", MIDTRANS_SERVER_KEY.slice(0, 5));
  console.log("Is Production:", MIDTRANS_IS_PRODUCTION);
}

// 🔧 Inisialisasi Midtrans Core API Client
const MIDTRANS_CLIENT = new midtransClient.CoreApi({
  isProduction: MIDTRANS_IS_PRODUCTION,
  serverKey: MIDTRANS_SERVER_KEY,
  clientKey: MIDTRANS_CLIENT_KEY,
});

// -------------------------------
// 📦 Tipe data transaksi
// -------------------------------
interface ItemDetail {
  id: string;
  name?: string;
  price?: number;
  quantity?: number;
  buyer_sku_code?: string;
}

interface CustomerDetails {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
}

interface ChargeParams {
  transaction_details: { order_id: string; gross_amount: number };
  item_details: ItemDetail[];
  customer_details: CustomerDetails;
  custom_field1: string;
  custom_field2: string;
  custom_field3: number;
  payment_type?: string;
  qris?: { acquirer: string };
  gopay?: { enable_callback: boolean; callback_url: string };
  ovo?: { phone_number: string };
  shopeepay?: { callback_url: string };
  cstore?: { store: string; message: string };
}

interface Action {
  name: string;
  url: string;
}

interface ChargeResponse {
  success?: boolean;
  payment_type: string;
  transaction_status?: string;
  status_code?: string;
  qr_string?: string;
  payment_code?: string;
  actions?: Action[];
}

// -------------------------------
// 🚀 Endpoint untuk charge transaksi
// -------------------------------
export async function POST(req: Request) {
  try {
    const {
      order_id,
      gross_amount,
      customer_details,
      item_details,
      payment_method,
    } = (await req.json()) as {
      order_id: string;
      gross_amount: number;
      customer_details: CustomerDetails;
      item_details: ItemDetail[];
      payment_method: string;
    };

    if (!order_id || !gross_amount || !payment_method) {
      return NextResponse.json(
        { error: "Data transaksi tidak lengkap" },
        { status: 400 }
      );
    }

    const buyer_sku_code =
      item_details?.[0]?.buyer_sku_code || item_details?.[0]?.id || "";
    const customer_no = customer_details?.phone || "";

    if (!buyer_sku_code || !customer_no) {
      return NextResponse.json(
        { error: "SKU pulsa atau nomor HP tidak boleh kosong" },
        { status: 400 }
      );
    }

    const baseParams: ChargeParams = {
      transaction_details: { order_id, gross_amount },
      item_details,
      customer_details,
      custom_field1: buyer_sku_code,
      custom_field2: customer_no,
      custom_field3: gross_amount,
    };

    const chargeParams: ChargeParams = { ...baseParams };

    // 🎯 Tentukan metode pembayaran
    switch (payment_method) {
      case "qris":
      case "dana":
        chargeParams.payment_type = "qris";
        chargeParams.qris = { acquirer: payment_method };
        break;
      case "gopay":
        chargeParams.payment_type = "gopay";
        chargeParams.gopay = {
          enable_callback: true,
          callback_url: `${process.env.NEXT_PUBLIC_SITE_URL}/payment-status`,
        };
        break;
      case "ovo":
        chargeParams.payment_type = "ovo";
        chargeParams.ovo = { phone_number: customer_details.phone! };
        break;
      case "shopeepay":
        chargeParams.payment_type = "shopeepay";
        chargeParams.shopeepay = {
          callback_url: `${process.env.NEXT_PUBLIC_SITE_URL}/payment-status`,
        };
        break;
      case "alfamart":
        chargeParams.payment_type = "cstore";
        chargeParams.cstore = {
          store: "alfamart",
          message: "Pembayaran di gerai Alfamart",
        };
        break;
      default:
        return NextResponse.json(
          { error: `Metode pembayaran tidak dikenali: ${payment_method}` },
          { status: 400 }
        );
    }

    // 💰 Kirim request ke Midtrans Core API
    const chargeResponse: ChargeResponse = await MIDTRANS_CLIENT.charge(
      chargeParams
    );

    // 🔗 Ambil URL redirect (jika ada)
    const redirect_url = chargeResponse.actions?.find((a) =>
      ["deeplink-redirect", "mobile", "desktop"].includes(a.name)
    )?.url;

    return NextResponse.json({
      success: true,
      order_id,
      payment_type: chargeResponse.payment_type,
      transaction_status:
        chargeResponse.transaction_status || chargeResponse.status_code,
      qr_string: chargeResponse.qr_string,
      payment_code: chargeResponse.payment_code,
      redirect_url,
    });
  } catch (error: unknown) {
    console.error("❌ Midtrans Error:", error);
    let message = "Gagal membuat transaksi Midtrans";
    if (error instanceof Error) message = error.message;
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
