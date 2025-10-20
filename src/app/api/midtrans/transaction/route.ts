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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      order_id,
      gross_amount,
      customer_details,
      item_details,
      payment_method,
    } = body;

    if (!order_id || !gross_amount || !payment_method) {
      return NextResponse.json(
        { error: "Data transaksi tidak lengkap" },
        { status: 400 }
      );
    }

    const payload: any = {
      transaction_details: { order_id, gross_amount },
      customer_details,
      item_details,
    };

    switch (payment_method) {
      case "qris":
        payload.payment_type = "qris";
        payload.qris = { acquirer: "gopay" };
        break;
      case "gopay":
        payload.payment_type = "gopay";
        payload.gopay = {
          enable_callback: true,
          callback_url: `${process.env.NEXT_PUBLIC_SITE_URL}/status`,
        };
        break;
      case "dana":
        payload.payment_type = "dana";
        break;
      case "ovo":
        payload.payment_type = "ovo";
        payload.ovo = { phone_number: customer_details.phone };
        break;
      case "shopeepay":
        payload.payment_type = "shopeepay";
        payload.shopeepay = {
          callback_url: `${process.env.NEXT_PUBLIC_SITE_URL}/status`,
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

    const chargeResponse = await MIDTRANS_CLIENT.charge(payload);

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
  } catch (error: any) {
    console.error("❌ Midtrans Error:", error.ApiResponse || error);
    return NextResponse.json(
      {
        error:
          error?.ApiResponse?.status_message ||
          error.message ||
          "Gagal membuat transaksi",
      },
      { status: 500 }
    );
  }
}
