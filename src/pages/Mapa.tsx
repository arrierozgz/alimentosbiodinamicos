import { useTranslation } from 'react-i18next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { MapPin } from 'lucide-react';
import ProducerMapPreview from '@/components/map/ProducerMapPreview';

export default function Mapa() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="bg-gradient-natural py-8 md:py-12">
          <div className="container max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-leaf/10 text-leaf text-sm font-medium mb-4">
              <MapPin className="h-4 w-4" />
              {t('nav.map')}
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-3">
              {t('explore.title')}
            </h1>
            <p className="text-lg text-muted-foreground">
              {t('explore.subtitle')}
            </p>
          </div>
        </section>

        <section className="py-6">
          <div className="container max-w-5xl">
            <ProducerMapPreview showSignupCta />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
