"use client";

import FooterLinks from "@/components/Footer/FooterLinks";
import Copyright from "@/components/Footer/Copyright";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-green-50 via-emerald-50 to-green-100 border-t border-green-100">
      <FooterLinks />
      <Copyright />
    </footer>
  );
}
