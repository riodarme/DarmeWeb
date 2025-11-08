import { QRCodeCanvas } from "qrcode.react";

export function TransactionQR({
  code,
  onClose,
}: {
  code: string;
  onClose: () => void;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <QRCodeCanvas value={code} size={220} includeMargin={true} />
      <h1 className="text-lg font-semibold text-green-700 mb-3">
        Scan QR untuk bayar
      </h1>
    </div>
  );
}
