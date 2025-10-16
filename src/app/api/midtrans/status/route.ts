import { NextResponse } from "next/server";
import midtransClient from "midtrans-client";

interface CustomerDetails {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
}

interface ItemDetails {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface TransactionStatus {
  transaction_id: string;
  order_id: string;
  transaction_status: string;
  payment_type: string;
  gross_amount: number | string;
  transaction_time: string;
  settlement_time?: string;
  fraud_status?: string;
  customer_details?: CustomerDetails;
  item_details?: ItemDetails[];
}

interface MidtransCoreApi {
  status(orderId: string): Promise<TransactionStatus>;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const order_id = searchParams.get("order_id");
    if (!order_id)
      return NextResponse.json(
        { success: false, message: "Order ID tidak ditemukan" },
        { status: 400 }
      );

    if (!process.env.MIDTRANS_SERVER_KEY)
      throw new Error("MIDTRANS_SERVER_KEY belum di set");

    const coreApi = new midtransClient.CoreApi({
      isProduction: process.env.NODE_ENV === "production",
      serverKey: process.env.MIDTRANS_SERVER_KEY!,
      clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!,
    }) as unknown as MidtransCoreApi;

    const status = await coreApi.status(order_id);

    const items =
      status.item_details?.map((item) => ({
        id: item.id,
        name: item.name,
        price: Number(item.price),
        quantity: item.quantity,
      })) ?? [];

    const response = {
      success: true,
      order_id: status.order_id,
      status: status.transaction_status,
      payment_type: status.payment_type,
      gross_amount: Number(status.gross_amount),
      customer_no: status.customer_details?.phone || "-",
      product_name: status.item_details?.[0]?.name || "Produk tidak diketahui",
      receipt: {
        order_id: status.order_id,
        product_name:
          status.item_details?.[0]?.name || "Produk tidak diketahui",
        payment_type: status.payment_type,
        gross_amount: Number(status.gross_amount),
        customer_no: status.customer_details?.phone || "-",
        transaction_time: status.transaction_time,
        status: status.transaction_status,
        items,
      },
    };

    return NextResponse.json(response);
  } catch (err: unknown) {
    console.error("❌ Gagal ambil status Midtrans:", err);
    const message =
      process.env.NODE_ENV === "production"
        ? "Gagal ambil status transaksi, silakan coba lagi."
        : (err as Error).message;
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
