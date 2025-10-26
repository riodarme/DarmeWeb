import { QRCodeCanvas } from "qrcode.react";

export function TransactionQR({ code }: { code: string; onClose: () => void }) {
  return (
    <div className="flex flex-col items-center text-center p-4">
      <h2 className="text-lg font-semibold text-green-700 mb-4">
        Scan QR berikut untuk membayar
      </h2>

      <QRCodeCanvas value={code} size={220} includeMargin={true} />
    </div>
  );
}
