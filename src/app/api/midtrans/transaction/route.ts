import { NextResponse } from "next/server";
import midtransClient from "midtrans-client";

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY!;
const MIDTRANS_CLIENT_KEY = process.env.MIDTRANS_CLIENT_KEY!;
const MIDTRANS_IS_PRODUCTION = false; // ⚠️ ubah ke true jika sudah live

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

    // ✅ Pastikan data numerik valid
    const amount = Number(gross_amount);
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid gross_amount value" },
        { status: 400 }
      );
    }

    // ✅ Format item_details agar sesuai spesifikasi Midtrans
    const safeItems =
      Array.isArray(item_details) && item_details.length > 0
        ? item_details.map((item: any) => ({
            name: String(item.name || "Item"),
            price: Number(item.price) || 0,
            quantity: Number(item.quantity) || 1,
          }))
        : undefined;

    // ✅ Format customer_details agar aman
    const safeCustomer = customer_details
      ? {
          first_name: customer_details.first_name || "Customer",
          email: customer_details.email || "noemail@example.com",
          phone: customer_details.phone || "",
        }
      : undefined;

    // ✅ Struktur dasar payload
    const payload: any = {
      transaction_details: {
        order_id,
        gross_amount: amount,
      },
      ...(safeCustomer && { customer_details: safeCustomer }),
      ...(safeItems && { item_details: safeItems }),
    };

    // ✅ Tentukan tipe pembayaran
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
        payload.ovo = { phone: safeCustomer?.phone };
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

    // ✅ Hapus key kosong/null supaya JSON bersih
    Object.keys(payload).forEach((key) => {
      if (
        payload[key] == null ||
        (typeof payload[key] === "object" &&
          Object.keys(payload[key]).length === 0)
      ) {
        delete payload[key];
      }
    });

    console.log("🚀 Final Payload:", JSON.stringify(payload, null, 2));

    // 🔥 Kirim request ke Midtrans
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
