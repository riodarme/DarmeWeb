import Brand from "@/components/Footer/Brand";
import Services from "@/components/Footer/Services";
import Menu from "@/components/Footer/Menu";
import Contact from "@/components/Footer/Contact";

export default function FooterLinks() {
  return (
    <div className="container mx-auto px-6 lg:px-12 pt-16 pb-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
      <Brand />
      <Services />
      <Menu />
      <Contact />
    </div>
  );
}
