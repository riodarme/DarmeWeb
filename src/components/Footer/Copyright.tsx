import { Heart } from "lucide-react";

export default function Copyright() {
  return (
    <div className="border-t border-green-100 mt-12 pt-6 text-center">
      <p className="text-sm text-gray-600">
        © {new Date().getFullYear()}{" "}
        <span className="font-semibold text-green-600">DarmeWeb</span>. Semua
        Hak Dilindungi.
      </p>
      <p className="text-xs text-gray-500 mt-2 flex items-center justify-center">
        Made with <Heart size={12} className="mx-1 text-red-500" /> for a better
        digital experience
      </p>
    </div>
  );
}
