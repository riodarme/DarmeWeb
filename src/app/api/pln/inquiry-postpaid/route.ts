import { NextResponse } from "next/server";
import crypto from "crypto";

interface DigiflazzResponse {
  data?: {
    customer_name?: string;
    subscriber_power?: string;
    month?: string;
    bill_amount?: number;
    message?: string;
  };
  message?: string;
}

export async function POST(req: Request) {
  try {
    const { customer_no } = await req.json();

    if (!customer_no) {
      return NextResponse.json({ status: false, message: "Nomor pelanggan wajib diisi" }, { status: 400 });
    }

    const username = process.env.DIGIFLAZZ_USERNAME!;
    const apiKey = process.env.DIGIFLAZZ_API_KEY!;

    if (!username || !apiKey) {
      console.error("Env DIGIFLAZZ_USER atau DIGIFLAZZ_API_KEY tidak tersedia");
      return NextResponse.json({ status: false, message: "Server configuration error" }, { status: 500 });
    }

    // 🔹 Buat ref_id unik
    const ref_id = Date.now().toString();

    // 🔹 Buat signature MD5
    const sign = crypto
      .createHash("md5")
      .update(username + apiKey + ref_id, "utf8")
      .digest("hex");

    const body = {
      cmd: "inq-pasca",
      username,
      buyer_sku_code: "pln-postpaid",
      customer_no,
      ref_id,
      sign,
    };

    console.log("Request Body Digiflazz:", body);

    const res = await fetch("https://api.digiflazz.com/v1/transaction", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data: DigiflazzResponse = await res.json();

    console.log("Digiflazz Response:", data);

    if (data.data?.customer_name) {
      return NextResponse.json({
        status: true,
        data: {
          name: data.data.customer_name,
          meter_no: customer_no,
          subscriber_power: data.data.subscriber_power,
          month: data.data.month,
          bill_amount: data.data.bill_amount,
        },
      });
    } else {
      const message = data.message || data.data?.message || "Gagal inquiry pascabayar";
      return NextResponse.json({ status: false, message }, { status: 400 });
    }
  } catch (err: unknown) {
    console.error("Inquiry Postpaid Error:", err);

    const message = err instanceof Error ? err.message : "Terjadi kesalahan server yang tidak diketahui";

    return NextResponse.json({ status: false, message }, { status: 500 });
  }
}
