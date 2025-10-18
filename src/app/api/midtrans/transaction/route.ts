import { NextResponse } from "next/server";
import midtransClient from "midtrans-client";

// 🔐 Environment variables
const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY || "";
const MIDTRANS_CLIENT_KEY = process.env.MIDTRANS_CLIENT_KEY || "";
const MIDTRANS_IS_PRODUCTION = process.env.NODE_ENV === "production";

// ⚠️ Cek server/client key
if (!MIDTRANS_SERVER_KEY || !MIDTRANS_CLIENT_KEY) {
  console.error(
    "❌ MIDTRANS_SERVER_KEY atau MIDTRANS_CLIENT_KEY belum diatur!"
  );
}

// 🔧 Inisialisasi Midtrans Core API
const MIDTRANS_CLIENT = new midtransClient.CoreApi({
  isProduction: MIDTRANS_IS_PRODUCTION,
  serverKey: MIDTRANS_SERVER_KEY,
  clientKey: MIDTRANS_CLIENT_KEY,
});

interface ItemDetail {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CustomerDetails {
  first_name: string;
  last_name?: string;
  email: string;
  phone: string;
}

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

    // 🔹 Payload CoreApi minimal
    const payload: any = {
      transaction_details: { order_id, gross_amount },
      customer_details,
      item_details,
      payment_type: payment_method,
    };

    // 🎯 Tambahkan konfigurasi spesifik tiap payment_type
    switch (payment_method) {
      case "qris":
      case "dana":
        payload.payment_type = "qris";
        payload.qris = { acquirer: payment_method };
        break;
      case "gopay":
        payload.payment_type = "gopay";
        payload.gopay = {
          enable_callback: true,
          callback_url: `${process.env.NEXT_PUBLIC_SITE_URL}/payment-status`,
        };
        break;
      case "ovo":
        payload.payment_type = "ovo";
        payload.ovo = { phone_number: customer_details.phone };
        break;
      case "shopeepay":
        payload.payment_type = "shopeepay";
        payload.shopeepay = {
          callback_url: `${process.env.NEXT_PUBLIC_SITE_URL}/payment-status`,
        };
        break;
      case "alfamart":
        payload.payment_type = "cstore";
        payload.cstore = {
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
    const chargeResponse = await MIDTRANS_CLIENT.charge(payload);

    // 🔗 Ambil URL redirect (jika ada)
    const redirect_url = chargeResponse.actions?.find((a: any) =>
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
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Gagal membuat transaksi",
      },
      { status: 500 }
    );
  }
}
