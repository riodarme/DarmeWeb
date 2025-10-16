import Link from "next/link";

export default function Menu() {
  const menus = [
    { name: "Beranda", path: "/" },
    { name: "Semua Produk", path: "/produk" },
    { name: "Promo & Diskon", path: "/promo" },
    { name: "Cara Order", path: "/cara-order" },
    { name: "Kontak", path: "/kontak" },
  ];

  return (
    <div>
      <h3 className="text-gray-800 font-semibold mb-5 uppercase tracking-wide">
        Menu
      </h3>
      <ul className="space-y-3 text-sm text-gray-600">
        {menus.map((item) => (
          <li key={item.path}>
            <Link
              href={item.path}
              className="hover:text-green-600 transition hover:pl-1 block"
            >
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
