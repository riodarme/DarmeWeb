import crypto from "crypto";
import { NextResponse } from "next/server";

interface MidtransNotification {
  transaction_status: string;
  fraud_status: string;
  custom_field1?: string;
  custom_field2?: string;
  custom_field3?: string | number;
}

interface DigiflazzData {
  status?: string;
  rc?: string;
  buyer_sku_code?: string;
  price?: number;
  [key: string]: string | number | undefined;
}

interface DigiflazzResponse {
  data?: DigiflazzData;
}

export async function POST(req: Request) {
  try {
    const body: MidtransNotification = await req.json();
    console.log("📩 Midtrans Notification diterima:", body);

    const { transaction_status, fraud_status, custom_field1, custom_field2 } =
      body;

    if (transaction_status === "settlement" && fraud_status === "accept") {
      const username = process.env.DIGIFLAZZ_USERNAME!;
      const apiKey = process.env.DIGIFLAZZ_API_KEY!;
      const ref_id = "DIGI-" + Date.now();

      const sign = crypto
        .createHash("md5")
        .update(username + apiKey + ref_id)
        .digest("hex");

      const buyer_sku_code = custom_field1 || "";
      const customer_no = custom_field2 || "";

      if (!buyer_sku_code || !customer_no) {
        console.warn("❗ Data Digiflazz tidak lengkap — transaksi diabaikan");
        return NextResponse.json({
          success: false,
          message: "Custom field kosong",
        });
      }

      const digiRes = await fetch("https://api.digiflazz.com/v1/transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          buyer_sku_code,
          customer_no,
          ref_id,
          sign,
        }),
      });

      const digiData: DigiflazzResponse = await digiRes.json();
      console.log("✅ Response Digiflazz:", digiData);

      if (digiData?.data?.status === "Sukses" || digiData?.data?.rc === "00") {
        return NextResponse.json({
          success: true,
          message: "Produk berhasil dikirim",
          digiflazz: digiData.data,
        });
      } else {
        return NextResponse.json({
          success: false,
          message: "Digiflazz gagal",
          digiflazz: digiData.data,
        });
      }
    }

    return NextResponse.json({
      success: false,
      message: "Transaksi belum settlement",
    });
  } catch (err) {
    console.error("❌ Notification Error:", err);
    return NextResponse.json(
      { error: "Gagal memproses notifikasi" },
      { status: 500 }
    );
  }
}
