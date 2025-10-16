import Link from "next/link";
import { Phone, Wifi, Zap, Gamepad2, Wallet } from "lucide-react";

export default function Services() {
  return (
    <div>
      <h3 className="text-gray-800 font-semibold mb-5 uppercase tracking-wide">
        Layanan
      </h3>
      <ul className="space-y-3 text-sm text-gray-600">
        <li>
          <Link
            href="/produk/pulsa"
            className="flex items-center hover:text-green-600 transition group"
          >
            <Phone
              size={14}
              className="mr-2 text-green-500 group-hover:scale-110 transition-transform"
            />
            Pulsa & Telepon
          </Link>
        </li>
        <li>
          <Link
            href="/produk/data"
            className="flex items-center hover:text-green-600 transition group"
          >
            <Wifi
              size={14}
              className="mr-2 text-green-500 group-hover:scale-110 transition-transform"
            />
            Paket Data
          </Link>
        </li>
        <li>
          <Link
            href="/produk/pln"
            className="flex items-center hover:text-green-600 transition group"
          >
            <Zap
              size={14}
              className="mr-2 text-green-500 group-hover:scale-110 transition-transform"
            />
            Token PLN
          </Link>
        </li>
        <li>
          <Link
            href="/produk/games"
            className="flex items-center hover:text-green-600 transition group"
          >
            <Gamepad2
              size={14}
              className="mr-2 text-green-500 group-hover:scale-110 transition-transform"
            />
            Voucher Game
          </Link>
        </li>
        <li>
          <Link
            href="/produk/emoney"
            className="flex items-center hover:text-green-600 transition group"
          >
            <Wallet
              size={14}
              className="mr-2 text-green-500 group-hover:scale-110 transition-transform"
            />
            E-Money
          </Link>
        </li>
      </ul>
    </div>
  );
}
