import { NextResponse } from "next/server";
import midtransClient from "midtrans-client";

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY!;
const MIDTRANS_CLIENT_KEY = process.env.MIDTRANS_CLIENT_KEY!;
const MIDTRANS_IS_PRODUCTION = false; // ✅ Production mode

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

    // 🔒 Validasi minimal
    if (!order_id || !gross_amount || !payment_method) {
      return NextResponse.json(
        { error: "Invalid transaction payload" },
        { status: 400 }
      );
    }

    const payload = {
      payment_type: payment_method,
      transaction_details: { order_id, gross_amount },
      customer_details,
      item_details,
    };

    const response = await core.charge(payload);
    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Midtrans Error:", error);
    return NextResponse.json(
      {
        error: error.message || "Midtrans API error",
        details: error.ApiResponse || null,
      },
      { status: 500 }
    );
  }
}
