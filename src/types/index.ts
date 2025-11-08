// ---------- Operator Types ----------
export type Operator =
  | "Telkomsel"
  | "Indosat"
  | "XL"
  | "Tri"
  | "Smartfren"
  | "Axis";

// Tambah khusus PLN (supaya bisa dipakai di PlnPage)
export type UtilityOperator = "PLN";

// ---------- Item untuk Pulsa/Data ----------
export interface PulsaItem {
  nominal: string;
  harga: number;
  buyer_sku_code: string;
}

export interface ApiPulsaItem {
  category: string;
  brand: string;
  product_name: string;
  price: number;
  buyer_sku_code: string;
}

// ---------- Item untuk Paket Data ----------
export interface DataItem {
  nominal: string;
  harga: number;
  buyer_sku_code: string;
}

export interface ApiDataItem {
  category: string;
  brand: string;
  product_name: string;
  price: number;
  buyer_sku_code: string;
}

// ---------- Item untuk PLN ----------
export interface PlnItem {
  nominal: string;
  harga: number;
  buyer_sku_code: string;
}

export interface ApiPlnItem {
  category: string;
  brand: string;
  product_name: string;
  price: number;
  buyer_sku_code: string;
}
// ---------- Item untuk E-Money ----------
export interface EmoneyItem {
  nominal: string; // Contoh: "Saldo GoPay 20.000"
  harga: number; // Harga jual (sudah termasuk markup)
  buyer_sku_code: string; // Kode produk Digiflazz
}

export interface ApiEmoneyItem {
  category: string; // Biasanya: "E-Money"
  brand: string; // Contoh: "GoPay", "OVO", "Dana", dll.
  product_name: string; // Contoh: "GoPay 20000"
  price: number; // Harga dasar dari Digiflazz
  buyer_sku_code: string;
}

// ---------- Midtrans Snap Window ----------
export interface SnapWindow extends Window {
  snap?: {
    pay: (
      token: string,
      callbacks?: {
        onSuccess?: () => void;
        onPending?: () => void;
        onError?: () => void;
        onClose?: () => void;
      }
    ) => void;
  };
}
