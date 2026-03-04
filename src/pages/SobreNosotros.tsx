import { useTranslation } from 'react-i18next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Heart, Users, Sprout, ShieldCheck, Leaf, ArrowRight } from 'lucide-react';

export default function SobreNosotros() {
  const { t } = useTranslation();

  const values = [
    { icon: Heart, titleKey: 'about.value_1_title', descKey: 'about.value_1_desc' },
    { icon: Users, titleKey: 'about.value_2_title', descKey: 'about.value_2_desc' },
    { icon: Sprout, titleKey: 'about.value_3_title', descKey: 'about.value_3_desc' },
    { icon: ShieldCheck, titleKey: 'about.value_4_title', descKey: 'about.value_4_desc' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="bg-gradient-natural py-12 md:py-20">
          <div className="container max-w-3xl text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
              <Leaf className="h-8 w-8 text-primary" />
            </div>
            <h1 className="font-display text-3xl md:text-5xl font-semibold text-foreground mb-4">
              {t('about.title')}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              {t('about.hero_desc')}
            </p>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container max-w-3xl">
            <h2 className="font-display text-2xl md:text-3xl font-semibold mb-6">
              {t('about.why_title')}
            </h2>
            <div className="prose prose-lg text-muted-foreground space-y-4">
              <p>{t('about.why_p1')}</p>
              <p>{t('about.why_p2')}</p>
              <p>{t('about.why_p3')}</p>
              <p>{t('about.why_p4')}</p>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16 bg-muted/30">
          <div className="container max-w-4xl">
            <h2 className="font-display text-2xl md:text-3xl font-semibold mb-8 text-center">
              {t('about.values_title')}
            </h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {values.map((value) => (
                <div key={value.titleKey} className="p-6 rounded-2xl bg-card border border-border">
                  <value.icon className="w-8 h-8 text-primary mb-3" />
                  <h3 className="font-display text-xl font-semibold mb-2">{t(value.titleKey)}</h3>
                  <p className="text-muted-foreground leading-relaxed">{t(value.descKey)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container max-w-3xl">
            <h2 className="font-display text-2xl md:text-3xl font-semibold mb-6">
              {t('about.steiner_title')}
            </h2>
            <div className="prose prose-lg text-muted-foreground space-y-4">
              <p>{t('about.steiner_p1')}</p>
              <p>{t('about.steiner_p2')}</p>
              <p>{t('about.steiner_p3')}</p>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16 bg-gradient-earth">
          <div className="container max-w-2xl text-center">
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-primary-foreground mb-4">
              {t('about.cta_title')}
            </h2>
            <p className="text-lg text-primary-foreground/80 mb-6">
              {t('about.cta_desc')}
            </p>
            <Link to="/auth">
              <Button 
                size="xl" 
                className="h-14 text-lg bg-primary-foreground text-primary hover:bg-primary-foreground/90"
              >
                {t('about.cta_button')}
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
