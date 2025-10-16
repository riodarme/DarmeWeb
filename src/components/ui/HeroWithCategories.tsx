"use client";

import HeroBanner from "./HeroBanner";
import Categories from "./Categories";

export default function HeroWithCategories() {
  return (
    <div className="relative">
      {/* Banner */}
      <section className="container mx-auto px-4 mt-6">
        <div className="rounded-2xl shadow-lg overflow-hidden">
          <HeroBanner />
        </div>
      </section>

      {/* Desktop: kategori floating nempel di bawah banner */}
      <section className="hidden md:block container mx-auto px-4 relative -mt-16 z-20">
        <div className="max-w-8xl mx-auto px-2">
          <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg p-6">
            <Categories />
          </div>
        </div>
      </section>

      {/* Mobile: kategori card sendiri */}
      <section className="md:hidden container mx-auto px-4 mt-4">
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg p-4">
          <Categories />
        </div>
      </section>
    </div>
  );
}
