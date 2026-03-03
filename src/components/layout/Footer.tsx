import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Leaf, Mail, Heart } from "lucide-react";

const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer className="border-t border-border bg-card">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-earth">
                <Leaf className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <span className="font-display text-lg font-semibold text-foreground">Alimentos</span>
                <span className="font-display text-lg font-semibold text-primary ml-1">Biodinámicos</span>
              </div>
            </Link>
            <p className="text-muted-foreground max-w-md leading-relaxed">{t('footer.description')}</p>
            <p className="mt-4 text-sm text-muted-foreground flex items-center gap-1">
              {t('footer.made_with').split('♡')[0]}<Heart className="h-3 w-3 text-accent" />{t('footer.made_with').split('♡')[1]}
            </p>
          </div>
          <div>
            <h4 className="font-display text-lg font-medium mb-4 text-foreground">{t('footer.explore_title')}</h4>
            <ul className="space-y-3">
              <li><Link to="/explorar" className="text-muted-foreground hover:text-primary transition-colors">{t('footer.search_products')}</Link></li>
              <li><Link to="/mapa" className="text-muted-foreground hover:text-primary transition-colors">{t('footer.farmer_map')}</Link></li>
              <li><Link to="/preparados" className="text-muted-foreground hover:text-primary transition-colors">{t('footer.biodynamic_preps')}</Link></li>
              <li><Link to="/sobre-nosotros" className="text-muted-foreground hover:text-primary transition-colors">{t('nav.about')}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display text-lg font-medium mb-4 text-foreground">{t('footer.contact_title')}</h4>
            <ul className="space-y-3">
              <li><a href="mailto:aragonbiodinamica@gmail.com" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"><Mail className="h-4 w-4" />{t('footer.write_us')}</a></li>
              <li><Link to="/privacidad" className="text-muted-foreground hover:text-primary transition-colors">{t('footer.privacy')}</Link></li>
              <li><Link to="/terminos" className="text-muted-foreground hover:text-primary transition-colors">{t('footer.terms')}</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-center text-sm text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-4">{t('footer.tagline')}</p>
          <p className="text-center text-sm text-muted-foreground">{t('footer.copyright', { year: new Date().getFullYear() })}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
