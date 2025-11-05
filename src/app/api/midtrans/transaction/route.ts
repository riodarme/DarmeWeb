import { NextResponse } from "next/server";
import midtransClient from "midtrans-client";

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY!;
const MIDTRANS_CLIENT_KEY = process.env.MIDTRANS_CLIENT_KEY!;
const MIDTRANS_IS_PRODUCTION = false;

const core = new midtransClient.CoreApi({
  isProduction: MIDTRANS_IS_PRODUCTION,
  serverKey: MIDTRANS_SERVER_KEY,
  clientKey: MIDTRANS_CLIENT_KEY,
});

// 🧱 Type Definitions
interface ItemDetail {
  id?: string;
  name: string;
  price: number;
  quantity: number;
}

interface CustomerDetails {
  first_name: string;
  email: string;
  phone: string;
}

type PaymentMethod =
  | "qris"
  | "gopay"
  | "dana"
  | "shopeepay"
  | "ovo"
  | "alfamart";

interface MidtransRequestBody {
  order_id: string;
  gross_amount: number;
  payment_method: PaymentMethod;
  customer_details?: Partial<CustomerDetails>;
  item_details?: ItemDetail[];
}

interface MidtransAction {
  name: string;
  method: string;
  url: string;
}

interface MidtransResponse {
  status_code: string;
  transaction_status?: string;
  payment_type?: string;
  qr_string?: string;
  payment_code?: string;
  actions?: MidtransAction[];
  [key: string]: unknown;
}

export async function POST(req: Request) {
  try {
    const body: MidtransRequestBody = await req.json();
    const {
      order_id,
      gross_amount,
      payment_method,
      customer_details,
      item_details,
    } = body;

    // 🧩 Validasi dasar
    if (!order_id || !gross_amount || !payment_method) {
      return NextResponse.json(
        { error: "Invalid transaction payload" },
        { status: 400 }
      );
    }

    const safeAmount = Number(gross_amount);
    if (isNaN(safeAmount) || safeAmount <= 0) {
      return NextResponse.json(
        { error: "Invalid gross_amount value" },
        { status: 400 }
      );
    }

    const safeItems: ItemDetail[] = Array.isArray(item_details)
      ? item_details.map((item) => ({
          id: item.id || undefined,
          name: String(item.name || "Item"),
          price: Number(item.price) || 0,
          quantity: Number(item.quantity) || 1,
        }))
      : [];

    const safeCustomer: CustomerDetails = {
      first_name: customer_details?.first_name || "Customer",
      email: customer_details?.email || "noemail@example.com",
      phone: customer_details?.phone || "",
    };

    const payload: Record<string, unknown> = {
      transaction_details: {
        order_id,
        gross_amount: safeAmount,
      },
      customer_details: safeCustomer,
      item_details: safeItems,
    };

    // 🧩 Mapping Payment Type
    const callbackBase =
      process.env.NEXT_PUBLIC_APP_URL || "https://darmemart.store/";
    switch (payment_method) {
      case "qris":
        Object.assign(payload, {
          payment_type: "qris",
          qris: { acquirer: "gopay" },
        });
        break;
      case "gopay":
      case "dana":
      case "shopeepay":
        Object.assign(payload, {
          payment_type: payment_method,
          [payment_method]: {
            enable_callback: true,
            callback_url: `${callbackBase}/status/${order_id}`,
          },
        });
        break;
      case "ovo":
        Object.assign(payload, {
          payment_type: "ovo",
          ovo: { phone_number: safeCustomer.phone.replace(/\D/g, "") },
        });
        break;
      case "alfamart":
        Object.assign(payload, {
          payment_type: "cstore",
          cstore: {
            store: "alfamart",
            message: "Silakan bayar di kasir Alfamart",
          },
        });
        break;
      default:
        return NextResponse.json(
          { error: `Unsupported payment method: ${payment_method}` },
          { status: 400 }
        );
    }

    // 🚀 Kirim ke Midtrans
    const response = (await core.charge(payload)) as MidtransResponse;

    // 🧠 Ambil URL redirect / QR / kode bayar
    const redirect_url =
      response.actions?.find(
        (a) => a.name === "deeplink-redirect" || a.name === "generate-qr-code"
      )?.url || null;

    return NextResponse.json({
      ...response,
      redirect_url,
      qr_string: response.qr_string ?? null,
      payment_code: response.payment_code ?? null,
    });
  } catch (error) {
    if (error && typeof error === "object" && "ApiResponse" in error) {
      console.error("❌ Midtrans API Error:", (error as any).ApiResponse);
      return NextResponse.json(
        {
          error: "Midtrans API error",
          details: (error as any).ApiResponse,
        },
        { status: 500 }
      );
    }

    console.error("❌ Unexpected error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Unknown error" },
      { status: 500 }
    );
  }
}
