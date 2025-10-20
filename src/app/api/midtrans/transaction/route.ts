import { NextResponse } from "next/server";
import midtransClient from "midtrans-client";

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY!;
const MIDTRANS_CLIENT_KEY = process.env.MIDTRANS_CLIENT_KEY!;
const MIDTRANS_IS_PRODUCTION = process.env.NODE_ENV === "production";

const MIDTRANS_CLIENT = new midtransClient.CoreApi({
  isProduction: MIDTRANS_IS_PRODUCTION,
  serverKey: MIDTRANS_SERVER_KEY,
  clientKey: MIDTRANS_CLIENT_KEY,
});

interface CustomerDetails {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
}

interface ItemDetail {
  id: string;
  price: number;
  quantity: number;
  name: string;
}

type PaymentMethod =
  | "qris"
  | "gopay"
  | "dana"
  | "ovo"
  | "shopeepay"
  | "alfamart";

interface TransactionRequest {
  order_id: string;
  gross_amount: number;
  customer_details?: CustomerDetails;
  item_details?: ItemDetail[];
  payment_method: PaymentMethod;
}

// 🧹 Fungsi pembersih payload frontend
function sanitizePayload(body: Record<string, unknown>): TransactionRequest {
  const {
    order_id,
    gross_amount,
    customer_details,
    item_details,
    payment_method,
  } = body;

  if (typeof order_id !== "string") throw new Error("order_id harus string");
  if (typeof gross_amount !== "number")
    throw new Error("gross_amount harus number");
  if (typeof payment_method !== "string")
    throw new Error("payment_method harus string");

  return {
    order_id,
    gross_amount,
    customer_details: customer_details as CustomerDetails,
    item_details: Array.isArray(item_details)
      ? (item_details as ItemDetail[])
      : undefined,
    payment_method: payment_method as PaymentMethod,
  };
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.json();
    const body = sanitizePayload(rawBody);

    const {
      order_id,
      gross_amount,
      customer_details,
      item_details,
      payment_method,
    } = body;

    const payload: Record<string, unknown> = {
      transaction_details: { order_id, gross_amount },
      customer_details,
      item_details,
    };

    // 🔧 pilih struktur payload berdasarkan metode
    switch (payment_method) {
      case "qris":
        Object.assign(payload, {
          payment_type: "qris",
          qris: { acquirer: "gopay" },
        });
        break;
      case "gopay":
        Object.assign(payload, {
          payment_type: "gopay",
          gopay: {
            enable_callback: true,
            callback_url: `${process.env.NEXT_PUBLIC_SITE_URL}/status`,
          },
        });
        break;
      case "dana":
        Object.assign(payload, { payment_type: "dana" });
        break;
      case "ovo":
        Object.assign(payload, {
          payment_type: "ovo",
          ovo: { phone_number: customer_details?.phone },
        });
        break;
      case "shopeepay":
        Object.assign(payload, {
          payment_type: "shopeepay",
          shopeepay: {
            callback_url: `${process.env.NEXT_PUBLIC_SITE_URL}/status`,
          },
        });
        break;
      case "alfamart":
        Object.assign(payload, {
          payment_type: "cstore",
          cstore: {
            store: "alfamart",
            message: "Pembayaran di gerai Alfamart",
          },
        });
        break;
      default:
        return NextResponse.json(
          { error: `Metode pembayaran tidak dikenali: ${payment_method}` },
          { status: 400 }
        );
    }

    // 🧠 hapus field undefined/null sebelum dikirim ke Midtrans
    const safePayload = JSON.parse(
      JSON.stringify(payload, (_key, value) =>
        value === undefined || value === null ? undefined : value
      )
    );

    const chargeResponse = await MIDTRANS_CLIENT.charge(safePayload);
    const responseObj = chargeResponse as Record<string, unknown>;

    const actions = Array.isArray(responseObj.actions)
      ? (responseObj.actions as { name: string; url?: string }[])
      : [];
    const redirectAction = actions.find((a) =>
      ["deeplink-redirect", "mobile", "desktop"].includes(a.name)
    );

    return NextResponse.json({
      success: true,
      order_id,
      payment_type: responseObj.payment_type,
      transaction_status:
        responseObj.transaction_status || responseObj.status_code,
      qr_string: responseObj.qr_string,
      payment_code: responseObj.payment_code,
      redirect_url: redirectAction?.url,
    });
  } catch (error: unknown) {
    console.error("❌ Midtrans Error:", error);

    if (typeof error === "object" && error !== null && "ApiResponse" in error) {
      const apiError = (error as { ApiResponse: { status_message?: string } })
        .ApiResponse;
      return NextResponse.json(
        { error: apiError.status_message || "Gagal membuat transaksi" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: (error as Error).message || "Gagal membuat transaksi" },
      { status: 500 }
    );
  }
}
