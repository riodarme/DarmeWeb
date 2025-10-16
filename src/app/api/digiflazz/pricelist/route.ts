// ./src/app/api/digiflazz/pricelist/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";

interface PriceListItem {
  category: string;
  brand: string;
  product_name: string;
  price: number;
  buyer_sku_code: string;
}

let cachedData: PriceListItem[] | null = null;
let lastFetch = 0;
const CACHE_TTL = 1000 * 60 * 30; // 30 menit cache

export async function POST() {
  try {
    const now = Date.now();

    // 🔹 Gunakan data dari cache jika masih valid
    if (cachedData && now - lastFetch < CACHE_TTL) {
      return NextResponse.json({ data: cachedData, cached: true });
    }

    const username = process.env.DIGIFLAZZ_USERNAME;
    const apiKey = process.env.DIGIFLAZZ_API_KEY;

    if (!username || !apiKey) {
      return NextResponse.json({ error: "Konfigurasi Digiflazz tidak lengkap di .env" }, { status: 500 });
    }

    // 🔹 Generate sign sesuai dokumentasi Digiflazz
    const sign = crypto
      .createHash("md5")
      .update(username + apiKey + "prepaid")
      .digest("hex");

    // 🔹 Request ke API Digiflazz
    const res = await fetch("https://api.digiflazz.com/v1/price-list", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cmd: "prepaid", username, sign }),
    });

    if (!res.ok) {
      throw new Error(`Request gagal dengan status ${res.status}`);
    }

    const json = (await res.json()) as { data?: PriceListItem[] };

    // 🔹 Sanitasi & simpan cache
    const data = Array.isArray(json.data)
      ? json.data.map((item) => ({
          ...item,
          price: Number(item.price ?? 0),
        }))
      : [];

    cachedData = data;
    lastFetch = now;

    return NextResponse.json({ data, cached: false });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan server";
    return NextResponse.json({ error: "Gagal mengambil data pricelist", detail: message }, { status: 500 });
  }
}
