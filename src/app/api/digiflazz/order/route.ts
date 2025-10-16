import { NextResponse } from "next/server";
import crypto from "crypto";

const DIGIFLAZZ_URL = "https://api.digiflazz.com/v1/transaction";

export async function POST(req: Request) {
  try {
    const { buyer_sku_code, customer_no, order_id } = await req.json();

    // 🔹 Validasi input dasar
    if (!buyer_sku_code || !customer_no) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Data tidak lengkap: buyer_sku_code atau customer_no belum diisi.",
        },
        { status: 400 }
      );
    }

    const username = process.env.DIGIFLAZZ_USERNAME;
    const apiKey = process.env.DIGIFLAZZ_API_KEY;

    // 🔹 Pastikan konfigurasi environment lengkap
    if (!username || !apiKey) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Konfigurasi Digiflazz tidak lengkap di .env (DIGIFLAZZ_USERNAME / DIGIFLAZZ_API_KEY).",
        },
        { status: 500 }
      );
    }

    // 🔹 Buat ref_id unik agar tiap transaksi berbeda
    const ref_id = order_id || `DIGI-${Date.now()}`;

    // 🔹 Buat signature hash MD5 (format wajib Digiflazz)
    const sign = crypto
      .createHash("md5")
      .update(username + apiKey + ref_id)
      .digest("hex");

    const body = {
      username,
      buyer_sku_code,
      customer_no,
      ref_id,
      sign,
    };

    console.log("⚡ Mengirim ke Digiflazz:", body);

    // 🔹 Kirim request ke API Digiflazz
    const res = await fetch(DIGIFLAZZ_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const result = await res.json();
    console.log("✅ Response Digiflazz:", result);

    // 🔹 Tangani hasil transaksi
    const data = result.data || {};
    const status = data.status || result.status || "Gagal";

    // 🔹 Buat response akhir
    return NextResponse.json({
      success: status === "Sukses" || status === "Berhasil",
      message: data.message || result.message || "Transaksi berhasil diproses.",
      ref_id,
      buyer_sku_code,
      customer_no,
      status,
      price: data.selling_price || null,
      sn: data.sn || null, // token PLN / SN pulsa
      balance: data.rc || null,
      raw: result, // opsional, biar bisa debug di frontend kalau mau
    });
  } catch (err: unknown) {
    console.error("❌ Error kirim ke Digiflazz:", err);

    let message = "Gagal mengirim ke Digiflazz.";
    if (err instanceof Error) {
      message = err.message;
    }

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 }
    );
  }
}
