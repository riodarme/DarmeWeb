import { NextResponse } from "next/server";
import midtransClient from "midtrans-client";

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY!;
const MIDTRANS_CLIENT_KEY = process.env.MIDTRANS_CLIENT_KEY!;
const MIDTRANS_IS_PRODUCTION = true; // set true kalau sudah live

const core = new midtransClient.CoreApi({
  isProduction: MIDTRANS_IS_PRODUCTION,
  serverKey: MIDTRANS_SERVER_KEY,
  clientKey: MIDTRANS_CLIENT_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      order_id,
      gross_amount,
      payment_method,
      customer_details,
      item_details,
    } = body;

    if (!order_id || !gross_amount || !payment_method) {
      return NextResponse.json(
        { error: "Invalid transaction payload" },
        { status: 400 }
      );
    }

    // ✅ Struktur dasar
    const payload: any = {
      transaction_details: {
        order_id,
        gross_amount: Number(gross_amount),
      },
      customer_details,
      item_details,
    };

    // ✅ Tambahkan tipe pembayaran sesuai metode
    switch (payment_method) {
      case "qris":
        payload.payment_type = "qris";
        payload.qris = { acquirer: "gopay" };
        break;

      case "gopay":
        payload.payment_type = "gopay";
        payload.gopay = {
          enable_callback: true,
          callback_url: "https://yourdomain.com/thankyou",
        };
        break;

      case "shopeepay":
        payload.payment_type = "shopeepay";
        payload.shopee_pay = {
          callback_url: "https://yourdomain.com/thankyou",
        };
        break;

      case "ovo":
        payload.payment_type = "ovo";
        payload.ovo = { phone: customer_details?.phone };
        break;

      case "alfamart":
        payload.payment_type = "cstore";
        payload.cstore = {
          store: "alfamart",
          message: "Pembayaran di Alfamart",
        };
        break;

      case "dana":
        payload.payment_type = "qris";
        payload.qris = { acquirer: "dana" };
        break;

      default:
        throw new Error(`Unsupported payment method: ${payment_method}`);
    }

    // 🔥 Kirim request ke Midtrans Core API
    const response = await core.charge(payload);

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Midtrans Error:", error.ApiResponse || error.message);
    return NextResponse.json(
      {
        error: error.message || "Midtrans API error",
        details: error.ApiResponse || null,
      },
      { status: 500 }
    );
  }
}
