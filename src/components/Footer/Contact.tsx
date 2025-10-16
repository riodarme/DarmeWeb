import {
  MapPin,
  Mail,
  Phone,
  Facebook,
  Instagram,
  Twitter,
} from "lucide-react";

export default function Contact() {
  return (
    <div>
      <h3 className="text-gray-800 font-semibold mb-5 uppercase tracking-wide">
        Kontak
      </h3>
      <ul className="space-y-4 text-sm text-gray-600 mb-6">
        <li className="flex items-start gap-3">
          <MapPin size={18} className="text-green-600 mt-0.5 flex-shrink-0" />
          <span>Jl. Contoh No. 123, Bekasi, Jawa Barat</span>
        </li>
        <li className="flex items-center gap-3">
          <Mail size={18} className="text-green-600 flex-shrink-0" />
          <span>support@darmeweb.com</span>
        </li>
        <li className="flex items-center gap-3">
          <Phone size={18} className="text-green-600 flex-shrink-0" />
          <span>+62 812-3456-7890</span>
        </li>
      </ul>

      <div className="flex space-x-3">
        <a
          href="#"
          className="w-10 h-10 flex items-center justify-center rounded-lg bg-white border border-green-100 text-gray-500 hover:bg-[#1877F2] hover:text-white transition-all shadow-sm hover:shadow-md"
          aria-label="Facebook"
        >
          <Facebook size={18} />
        </a>
        <a
          href="#"
          className="w-10 h-10 flex items-center justify-center rounded-lg bg-white border border-green-100 text-gray-500 hover:bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 hover:text-white transition-all shadow-sm hover:shadow-md"
          aria-label="Instagram"
        >
          <Instagram size={18} />
        </a>
        <a
          href="#"
          className="w-10 h-10 flex items-center justify-center rounded-lg bg-white border border-green-100 text-gray-500 hover:bg-[#1DA1F2] hover:text-white transition-all shadow-sm hover:shadow-md"
          aria-label="Twitter"
        >
          <Twitter size={18} />
        </a>
      </div>
    </div>
  );
}
