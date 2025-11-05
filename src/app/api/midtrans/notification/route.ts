import crypto from "crypto";
import { NextResponse } from "next/server";

// 📦 Interface struktur notifikasi Midtrans
interface MidtransNotification {
  transaction_status: string;
  fraud_status: string;
  custom_field1?: string; // kode produk / buyer_sku_code
  custom_field2?: string; // nomor pelanggan
  custom_field3?: string | number; // opsional (misal: ref tambahan)
}

// 📦 Interface untuk respons Digiflazz
interface DigiflazzData {
  status?: string;
  rc?: string;
  buyer_sku_code?: string;
  price?: number;
  message?: string;
  [key: string]: string | number | undefined;
}

interface DigiflazzResponse {
  data?: DigiflazzData;
  success?: boolean;
  message?: string;
}

export async function POST(req: Request) {
  try {
    const body: MidtransNotification = await req.json();
    console.log("📩 Notifikasi Midtrans diterima:", body);

    const { transaction_status, fraud_status, custom_field1, custom_field2 } =
      body;

    // ✅ Proses hanya jika transaksi berhasil
    if (transaction_status === "settlement" && fraud_status === "accept") {
      const username = process.env.DIGIFLAZZ_USERNAME!;
      const apiKey = process.env.DIGIFLAZZ_API_KEY!;
      const ref_id = "DIGI-" + Date.now();

      // 🔐 Buat tanda tangan (MD5)
      const sign = crypto
        .createHash("md5")
        .update(username + apiKey + ref_id)
        .digest("hex");

      const buyer_sku_code = custom_field1?.trim();
      const customer_no = custom_field2?.trim();

      // 🧩 Validasi input dari Midtrans custom field
      if (!buyer_sku_code || !customer_no) {
        console.warn("⚠️ Data custom field kosong — transaksi dilewati");
        return NextResponse.json(
          {
            success: false,
            message:
              "Custom field tidak lengkap (buyer_sku_code / customer_no)",
          },
          { status: 400 }
        );
      }

      // 🚀 Kirim permintaan ke Digiflazz
      const digiResponse = await fetch(
        "https://api.digiflazz.com/v1/transaction",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username,
            buyer_sku_code,
            customer_no,
            ref_id,
            sign,
          }),
        }
      );

      const digiData: DigiflazzResponse = await digiResponse.json();
      console.log("✅ Respons dari Digiflazz:", digiData);

      // 💡 Cek hasil transaksi dari Digiflazz
      if (digiData?.data?.status === "Sukses" || digiData?.data?.rc === "00") {
        return NextResponse.json({
          success: true,
          message: "Transaksi berhasil & produk terkirim",
          digiflazz: digiData.data,
        });
      }

      return NextResponse.json({
        success: false,
        message: "Transaksi Digiflazz gagal diproses",
        digiflazz: digiData.data,
      });
    }

    // 🕓 Jika belum settlement, abaikan
    return NextResponse.json({
      success: false,
      message: "Transaksi belum settlement, tidak diproses.",
    });
  } catch (err: unknown) {
    console.error("❌ Gagal memproses notifikasi Midtrans:", err);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat memproses notifikasi.",
      },
      { status: 500 }
    );
  }
}

