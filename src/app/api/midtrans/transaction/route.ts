// /app/api/midtrans/transaction/route.ts
import { NextResponse } from "next/server";
import midtransClient from "midtrans-client";

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY!;
const MIDTRANS_CLIENT = new midtransClient.CoreApi({
  isProduction: false,
  serverKey: MIDTRANS_SERVER_KEY,
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!,
});

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
  shopeepay?: { callback_url: string };
  cstore?: { store: string; message: string };
  ovo?: { phone_number: string };
}

interface Action {
  name: string;
  url: string;
}

interface ChargeResponse {
  payment_type: string;
  transaction_status?: string;
  status_code?: string;
  qr_string?: string;
  payment_code?: string;
  actions?: Action[];
}

export async function POST(req: Request) {
  try {
    const {
      order_id,
      gross_amount,
      customer_details,
      item_details,
      payment_method,
    } = await req.json();

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

    switch (payment_method) {
      case "qris":
        chargeParams.payment_type = "qris";
        chargeParams.qris = { acquirer: "gopay" }; // ✅ Gunakan GoPay QR
        break;

      case "gopay":
        chargeParams.payment_type = "gopay";
        chargeParams.gopay = {
          enable_callback: true,
          callback_url: `${process.env.NEXT_PUBLIC_SITE_URL}/payment-status`,
        };
        break;

      case "shopeepay":
        chargeParams.payment_type = "shopeepay";
        chargeParams.shopeepay = {
          callback_url: `${process.env.NEXT_PUBLIC_SITE_URL}/payment-status`,
        };
        break;

      case "ovo":
        chargeParams.payment_type = "ovo";
        chargeParams.ovo = { phone_number: customer_details.phone! };
        break;

      case "alfamart":
        chargeParams.payment_type = "cstore";
        chargeParams.cstore = {
          store: "alfamart",
          message: "Pembayaran di gerai Alfamart",
        };
        break;

      case "dana":
        // ❌ Core API tidak mendukung langsung DANA.
        // ✅ Gunakan fallback ke GoPay agar tidak error.
        chargeParams.payment_type = "gopay";
        chargeParams.gopay = {
          enable_callback: true,
          callback_url: `${process.env.NEXT_PUBLIC_SITE_URL}/payment-status`,
        };
        break;

      default:
        return NextResponse.json(
          { error: `Metode pembayaran tidak dikenali: ${payment_method}` },
          { status: 400 }
        );
    }

    const chargeResponse: ChargeResponse = await MIDTRANS_CLIENT.charge(
      chargeParams
    );

    // 🔹 Konversi qr_string jadi base64 agar bisa langsung dipakai <img src="...">
    const qrBase64 =
      chargeResponse.qr_string &&
      `data:image/png;base64,${Buffer.from(chargeResponse.qr_string).toString(
        "base64"
      )}`;

    // 🔹 Ambil redirect URL untuk e-wallet / cstore
    const redirect_url = chargeResponse.actions?.find((a) =>
      ["deeplink-redirect", "mobile", "desktop"].includes(a.name)
    )?.url;

    return NextResponse.json({
      success: true,
      order_id,
      payment_type: chargeResponse.payment_type,
      transaction_status:
        chargeResponse.transaction_status || chargeResponse.status_code,
      qr_string: qrBase64 || chargeResponse.qr_string,
      payment_code: chargeResponse.payment_code,
      redirect_url,
    });
  } catch (error: unknown) {
    console.error("❌ Midtrans Error:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Gagal membuat transaksi Midtrans";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
