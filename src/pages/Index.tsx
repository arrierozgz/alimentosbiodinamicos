import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import ValuesSection from "@/components/home/ValuesSection";
import RolesSection from "@/components/home/RolesSection";
import PreparadosPreview from "@/components/home/PreparadosPreview";
import CTASection from "@/components/home/CTASection";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <ValuesSection />
        <RolesSection />
        <PreparadosPreview />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
