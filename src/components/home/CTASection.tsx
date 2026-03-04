import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ArrowRight, Leaf } from "lucide-react";

const CTASection = () => {
  const { t } = useTranslation();

  return (
    <section className="py-16 md:py-24 bg-gradient-earth relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full bg-primary-foreground/5 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-64 h-64 rounded-full bg-primary-foreground/5 blur-3xl" />
      </div>

      <div className="container relative">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-foreground/10 mb-6">
            <Leaf className="h-8 w-8 text-primary-foreground" />
          </div>

          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-primary-foreground mb-6">
            {t('home.cta_title')}
          </h2>
          
          <p className="text-lg md:text-xl text-primary-foreground/80 leading-relaxed mb-8 max-w-2xl mx-auto">
            {t('home.cta_description')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/registro">
              <Button 
                size="xl" 
                className="w-full sm:w-auto bg-primary-foreground text-primary hover:bg-primary-foreground/90 shadow-card hover:shadow-elevated group"
              >
                {t('home.cta_register')}
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link to="/explorar">
              <Button 
                variant="outline" 
                size="xl" 
                className="w-full sm:w-auto border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
              >
                {t('home.cta_explore')}
              </Button>
            </Link>
          </div>

          <p className="mt-8 text-sm text-primary-foreground/60">
            {t('home.cta_footer')}
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
