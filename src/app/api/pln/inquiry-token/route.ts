// app/api/pln/inquiry-token/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { customer_no, buyer_sku_code } = await req.json();

    // Validasi input
    if (!customer_no || !buyer_sku_code) {
      return NextResponse.json({ status: false, message: "Nomor pelanggan & SKU wajib diisi" }, { status: 400 });
    }

    const username = process.env.DIGIFLAZZ_USERNAME!;
    const apiKey = process.env.DIGIFLAZZ_API_KEY!;

    if (!username || !apiKey) {
      return NextResponse.json(
        {
          status: false,
          message: "Env DIGIFLAZZ_USER atau DIGIFLAZZ_KEY belum di-set",
        },
        { status: 500 }
      );
    }

    // ✅ Gunakan ref_id untuk sign, bukan customer_no
    const ref_id = `pln-${Date.now()}`;
    const sign = crypto
      .createHash("md5")
      .update(username + apiKey + ref_id)
      .digest("hex");

    const payload = { username, buyer_sku_code, customer_no, ref_id, sign };

    const res = await fetch("https://api.digiflazz.com/v1/transaction", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    // ✅ Pastikan ada data.data
    if (data?.data) {
      return NextResponse.json({
        status: true,
        message: data.data.message || "Inquiry berhasil",
        data: {
          ref_id: data.data.ref_id || ref_id,
          customer_no: data.data.customer_no || customer_no,
          name: data.data.name || data.data.customer_name || "-", // pastikan ada fallback
          meter_no: data.data.customer_no || "-", // PLN prepaid biasanya nomor meter
          subscriber_power: data.data.subscriber_power || data.data.segment_power || "-",
          nominal: data.data.buyer_sku_code || buyer_sku_code,
          status: data.data.status || "PENDING",
        },
        raw: data,
      });
    }

    return NextResponse.json({
      status: false,
      message: data?.message || "Inquiry gagal",
      raw: data,
    });
  } catch (err) {
    return NextResponse.json({ status: false, message: "Server error", detail: String(err) }, { status: 500 });
  }
}
