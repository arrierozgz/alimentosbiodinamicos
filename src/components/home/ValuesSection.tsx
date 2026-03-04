import { useTranslation } from "react-i18next";
import { Heart, Users, Sprout, ShieldCheck } from "lucide-react";

const ValuesSection = () => {
  const { t } = useTranslation();

  const values = [
    { icon: Heart, titleKey: 'home.value_nonprofit_title', descKey: 'home.value_nonprofit_desc' },
    { icon: Users, titleKey: 'home.value_direct_title', descKey: 'home.value_direct_desc' },
    { icon: Sprout, titleKey: 'home.value_biodynamic_title', descKey: 'home.value_biodynamic_desc' },
    { icon: ShieldCheck, titleKey: 'home.value_transparency_title', descKey: 'home.value_transparency_desc' },
  ];

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-4">
            {t('home.values_title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('home.values_subtitle')}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {values.map((value, index) => (
            <div
              key={value.titleKey}
              className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-card transition-all duration-300 animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <value.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-display text-xl font-medium text-foreground mb-2">
                {t(value.titleKey)}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {t(value.descKey)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ValuesSection;
