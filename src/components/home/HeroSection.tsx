import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Leaf, MapPin } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-natural">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute top-1/2 -left-24 w-72 h-72 rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="container relative py-16 md:py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-up">
              <Leaf className="h-4 w-4" />
              Sin ánimo de lucro · Sin comisiones
            </div>
            
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-foreground leading-tight mb-6 animate-fade-up" style={{ animationDelay: "0.1s" }}>
              Del campo a tu mesa,{" "}
              <span className="text-primary">sin intermediarios</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0 animate-fade-up" style={{ animationDelay: "0.2s" }}>
              Conectamos directamente a consumidores con agricultores, ganaderos y 
              elaboradores de preparados biodinámicos. Cercanía, confianza y trato humano.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-up" style={{ animationDelay: "0.3s" }}>
              <Link to="/explorar">
                <Button variant="earth" size="xl" className="w-full sm:w-auto group">
                  Explorar productos
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/registro">
                <Button variant="outline" size="xl" className="w-full sm:w-auto">
                  Soy productor
                </Button>
              </Link>
            </div>
          </div>

          {/* Visual */}
          <div className="relative animate-fade-up" style={{ animationDelay: "0.4s" }}>
            <div className="relative aspect-square max-w-lg mx-auto">
              {/* Main circle */}
              <div className="absolute inset-8 rounded-full bg-gradient-earth shadow-elevated" />
              
              {/* Floating cards */}
              <div className="absolute top-4 right-0 bg-card rounded-2xl p-4 shadow-card animate-float">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">+120</p>
                    <p className="text-sm text-muted-foreground">Productores</p>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-8 left-0 bg-card rounded-2xl p-4 shadow-card animate-float-delayed">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Cerca de ti</p>
                    <p className="text-sm text-muted-foreground">Km 0</p>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-1/4 right-4 bg-card rounded-2xl p-4 shadow-card animate-float" style={{ animationDelay: "1s" }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-leaf/20 flex items-center justify-center">
                    <Leaf className="h-5 w-5 text-leaf" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">100%</p>
                    <p className="text-sm text-muted-foreground">Biodinámico</p>
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
