import { QRCodeCanvas } from "qrcode.react";

export function TransactionQR({
  code,
  onClose,
}: {
  code: string;
  onClose: () => void;
}) {
  return (
    <div className="flex flex-col items-center text-center p-4">
      <h2 className="text-lg font-semibold text-green-700 mb-4">
        Scan QR berikut untuk membayar
      </h2>

      <QRCodeCanvas value={code} size={220} includeMargin={true} />

      <p className="text-gray-500 text-sm mt-2">QR berlaku beberapa menit</p>

      <button
        onClick={onClose}
        className="mt-6 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
      >
        Tutup
      </button>
    </div>
  );
}
