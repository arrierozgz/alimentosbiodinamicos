import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Users, Leaf, MapPin, User, Search } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const HeroSection = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <section className="relative overflow-hidden bg-gradient-natural">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute top-1/2 -left-24 w-72 h-72 rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="container relative py-16 md:py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-up">
              <Leaf className="h-4 w-4" />
              {t('home.hero_badge')}
            </div>
            
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-foreground leading-tight mb-6 animate-fade-up" style={{ animationDelay: "0.1s" }}>
              {t('home.hero_title_1')}{" "}
              <span className="text-primary">{t('home.hero_title_2')}</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0 animate-fade-up" style={{ animationDelay: "0.2s" }}>
              {t('home.hero_description')}
            </p>

            {/* Search bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                navigate(`/explorar${searchTerm ? `?buscar=${encodeURIComponent(searchTerm)}` : ''}`);
              }}
              className="relative max-w-lg mx-auto lg:mx-0 mb-8 animate-fade-up"
              style={{ animationDelay: "0.3s" }}
            >
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground" />
              <Input
                type="text"
                placeholder={t('home.search_placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-28 h-14 text-lg rounded-xl border-2 shadow-card"
              />
              <Button
                type="submit"
                variant="earth"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg h-10"
              >
                {t('home.search_button')}
              </Button>
            </form>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-up" style={{ animationDelay: "0.4s" }}>
              {!user && (
                <Link to="/auth">
                  <Button variant="earth" size="xl" className="w-full sm:w-auto group text-lg h-16">
                    <User className="h-5 w-5" />
                    {t('home.hero_cta_access')}
                  </Button>
                </Link>
              )}
              <Link to="/explorar">
                <Button variant="outline" size="xl" className="w-full sm:w-auto group text-lg h-16">
                  {t('home.hero_cta_explore')}
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative animate-fade-up" style={{ animationDelay: "0.4s" }}>
            <div className="relative aspect-square max-w-lg mx-auto">
              <div className="absolute inset-8 rounded-full bg-gradient-earth shadow-elevated" />
              
              <div className="absolute top-4 right-0 bg-card rounded-2xl p-4 shadow-card animate-float">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{t('home.card_community')}</p>
                    <p className="text-sm text-muted-foreground">{t('home.card_growing')}</p>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-8 left-0 bg-card rounded-2xl p-4 shadow-card animate-float-delayed">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{t('home.card_nearby')}</p>
                    <p className="text-sm text-muted-foreground">{t('home.card_km0')}</p>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-1/4 right-4 bg-card rounded-2xl p-4 shadow-card animate-float" style={{ animationDelay: "1s" }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-leaf/20 flex items-center justify-center">
                    <Leaf className="h-5 w-5 text-leaf" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{t('home.card_biodynamic')}</p>
                    <p className="text-sm text-muted-foreground">{t('home.card_certified')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
