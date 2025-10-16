/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true, // supaya gambar bisa load tanpa optimization server
  },
  // ❌ Hapus: output: "export"
};

module.exports = nextConfig;
