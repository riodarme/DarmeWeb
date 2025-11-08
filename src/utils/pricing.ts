// 💡 Fungsi markup dasar pulsa
export const applyPulsaMarkup = (price: number | undefined): number => {
  if (!price || isNaN(price)) price = 0;

  let markup: number;
  if (price <= 25000) markup = 1500;
  else if (price <= 50000) markup = 2000;
  else markup = 5500;

  const newPrice = price + markup;
  return Math.ceil(newPrice / 500) * 500;
};

// 💰 Hitung total harga + fee berdasarkan metode pembayaran
export const calculateTotalWithFee = (basePrice: number, method: string): { total: number; fee_value: number; fee_label: string } => {
  let total = basePrice;
  let fee_value = 0;
  let fee_label = "Tanpa Biaya Tambahan";

  switch (method) {
    case "qris":
      fee_value = Math.ceil(basePrice * 0.007);
      fee_label = "Biaya QRIS (0.7%)";
      break;
    case "gopay":
    case "ovo":
    case "dana":
      fee_value = Math.ceil(basePrice * 0.05);
      fee_label = "Biaya E-Wallet (5%)";
      break;
    case "shopeepay":
      fee_value = Math.ceil(basePrice * 0.04);
      fee_label = "Biaya ShopeePay (4%)";
      break;
    case "alfamart":
      fee_value = 2500;
      fee_label = "Biaya Alfamart";
      break;
    case "midtrans":
      fee_label = "Biaya bervariasi (Midtrans)";
      break;
    default:
      fee_label = "Tanpa Biaya Admin";
  }

  total = basePrice + fee_value;
  return { total, fee_value, fee_label };
};
