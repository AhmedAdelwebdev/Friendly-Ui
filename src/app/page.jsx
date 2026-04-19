import { HeroSection } from "@/components/home/HeroSection";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { FeaturedDesigns } from "@/components/home/FeaturedDesigns";

export default function Home() {
  return (
    <div className="flex flex-col w-full">
      <HeroSection />
      {/* Products Second */}
      <FeaturedDesigns type="Product" title="Premium Store" />
      {/* Designs First */}
      <FeaturedDesigns type="Design" title="Latest Designs" />
      <FeaturesSection />
    </div>
  );
}
