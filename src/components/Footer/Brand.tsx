export default function Brand() {
  return (
    <div className="lg:col-span-2">
      <div className="flex items-center mb-5">
        <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center mr-3 shadow border border-green-100">
          <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent font-extrabold text-lg">
            DW
          </span>
        </div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
          DarmeWeb
        </h2>
      </div>
      <p className="text-gray-600 text-sm leading-relaxed max-w-md">
        Solusi mudah dan cepat untuk pembelian produk digital: pulsa, data,
        token PLN, voucher game, e-money, dan lainnya. Layanan 24 jam dengan
        proses instan.
      </p>

      <div className="mt-6">
        <h4 className="text-gray-700 font-semibold text-sm mb-3 uppercase tracking-wide">
          Metode Pembayaran
        </h4>
        <div className="flex flex-wrap gap-2">
          {["Dana", "OVO", "Gopay", "QRIS", "Bank Transfer"].map((method) => (
            <span
              key={method}
              className="px-3 py-1 bg-white text-xs text-gray-600 rounded-full border border-green-100 shadow-sm hover:shadow-md transition"
            >
              {method}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
