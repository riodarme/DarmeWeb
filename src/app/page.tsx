import HeroWithCategories from "@/components/ui/HeroWithCategories";
import About from "@/components/ui/About";
import Kontak from "@/components/ui/Kontak";
import WhyChooseUs from "@/components/ui/WhyChooseUs";

export default function Home() {
  return (
    <div className="mx-auto px-4">
      {/* Kategori */}
      <HeroWithCategories />

      {/* About */}
      <About />

      {/* Produk Populer */}
      <WhyChooseUs />

      {/* Kontak */}
      <Kontak />
    </div>
  );
}
