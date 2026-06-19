import HeroSection from "@/components/home/HeroSection";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import WhyPearlByAnn from "@/components/home/WhyPearlByAnn";
import CustomerLove from "@/components/home/CustomerLove";
import CTASection from "@/components/home/CTASection";

export default function Home() {
  return (
    <>
      <HeroSection />
      <FeaturedProducts />
      <WhyPearlByAnn />
      <CustomerLove />
      <CTASection />
    </>
  );
}
