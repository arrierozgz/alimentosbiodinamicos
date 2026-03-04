import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ShoppingBasket, Tractor, Beaker, ArrowRight } from "lucide-react";

const RolesSection = () => {
  const { t } = useTranslation();

  const roles = [
    {
      icon: ShoppingBasket,
      titleKey: "home.role_consumer",
      descKey: "home.role_consumer_desc",
      features: ["home.role_consumer_f1", "home.role_consumer_f2", "home.role_consumer_f3"],
      color: "primary" as const,
      link: "/auth",
    },
    {
      icon: Tractor,
      titleKey: "home.role_farmer",
      descKey: "home.role_farmer_desc",
      features: ["home.role_farmer_f1", "home.role_farmer_f2", "home.role_farmer_f3"],
      color: "accent" as const,
      link: "/auth",
    },
    {
      icon: Beaker,
      titleKey: "home.role_elaborador",
      descKey: "home.role_elaborador_desc",
      features: ["home.role_elaborador_f1", "home.role_elaborador_f2", "home.role_elaborador_f3"],
      color: "leaf" as const,
      link: "/auth",
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-gradient-natural">
      <div className="container">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-4">
            {t('home.roles_title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('home.roles_subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {roles.map((role, index) => (
            <div
              key={role.titleKey}
              className="group relative bg-card rounded-2xl border border-border overflow-hidden hover:shadow-elevated transition-all duration-300 animate-fade-up"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className={`p-6 pb-4 ${
                role.color === "primary" ? "bg-primary/5" :
                role.color === "accent" ? "bg-accent/10" :
                "bg-leaf/10"
              }`}>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${
                  role.color === "primary" ? "bg-primary/20" :
                  role.color === "accent" ? "bg-accent/20" :
                  "bg-leaf/20"
                }`}>
                  <role.icon className={`h-7 w-7 ${
                    role.color === "primary" ? "text-primary" :
                    role.color === "accent" ? "text-accent" :
                    "text-leaf"
                  }`} />
                </div>
                <h3 className="font-display text-2xl font-medium text-foreground">
                  {t(role.titleKey)}
                </h3>
              </div>

              <div className="p-6 pt-4">
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {t(role.descKey)}
                </p>

                <ul className="space-y-2 mb-6">
                  {role.features.map((featureKey) => (
                    <li key={featureKey} className="flex items-center gap-2 text-sm text-foreground">
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        role.color === "primary" ? "bg-primary" :
                        role.color === "accent" ? "bg-accent" :
                        "bg-leaf"
                      }`} />
                      {t(featureKey)}
                    </li>
                  ))}
                </ul>

                <Link to={role.link}>
                  <Button 
                    variant={role.color === "accent" ? "warm" : role.color === "primary" ? "earth" : "natural"} 
                    className="w-full group/btn"
                  >
                    {t('home.role_cta')}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RolesSection;
