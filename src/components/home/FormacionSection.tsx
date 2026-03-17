import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { GraduationCap, Sprout } from 'lucide-react';

export default function FormacionSection() {
  const { t } = useTranslation();

  return (
    <section className="py-12 md:py-16">
      <div className="container max-w-3xl">
        <div className="rounded-2xl border-2 border-primary/20 bg-primary/5 p-8 md:p-10 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <GraduationCap className="w-7 h-7 text-primary" />
            </div>
          </div>
          <h2 className="font-display text-2xl font-semibold text-foreground mb-3">
            {t('home.formacion_title')}
          </h2>
          <p className="text-base text-foreground/80 leading-relaxed mb-6 max-w-xl mx-auto">
            {t('home.formacion_text')}
          </p>
          <Button variant="earth" size="lg" asChild>
            <a href="mailto:info@alimentosantroposoficos.es">
              <Sprout className="w-5 h-5 mr-2" />
              {t('home.formacion_cta')}
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
