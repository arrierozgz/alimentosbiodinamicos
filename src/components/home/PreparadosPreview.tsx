import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ArrowRight, Info } from "lucide-react";

const preparados = [
  { id: "500", nameKey: "preparations_page.prep_500_name" },
  { id: "501", nameKey: "preparations_page.prep_501_name" },
  { id: "502", nameKey: "preparations_page.prep_502_name" },
  { id: "503", nameKey: "preparations_page.prep_503_name" },
  { id: "504", nameKey: "preparations_page.prep_504_name" },
  { id: "505", nameKey: "preparations_page.prep_505_name" },
  { id: "506", nameKey: "preparations_page.prep_506_name" },
  { id: "507", nameKey: "preparations_page.prep_507_name" },
  { id: "508", nameKey: "preparations_page.prep_508_name" },
  { id: "maria-thun", nameKey: "preparations_page.prep_maria_thun_name" },
];

const PreparadosPreview = () => {
  const { t } = useTranslation();

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-leaf/10 text-leaf text-sm font-medium mb-4">
              <Info className="h-4 w-4" />
              {t('home.preps_badge')}
            </div>
            
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-4">
              {t('home.preps_title')}
            </h2>
            
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              {t('home.preps_description')}
            </p>

            <Link to="/preparados">
              <Button variant="natural" className="group">
                {t('home.preps_cta')}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {preparados.slice(0, 9).map((prep, index) => (
              <div
                key={prep.id}
                className="p-4 rounded-xl bg-card border border-border hover:border-leaf/30 hover:shadow-soft transition-all duration-200 animate-fade-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="w-10 h-10 rounded-lg bg-leaf/10 flex items-center justify-center mb-2 text-leaf font-display font-semibold text-sm">
                  {prep.id === "maria-thun" ? "MT" : prep.id}
                </div>
                <p className="font-medium text-foreground text-sm leading-tight">
                  {t(prep.nameKey)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PreparadosPreview;
