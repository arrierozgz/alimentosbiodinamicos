import { useTranslation } from 'react-i18next';
import { Info, Download, Eye } from 'lucide-react';

export default function DisclaimerSection() {
  const { t } = useTranslation();

  return (
    <section className="py-12 md:py-16">
      <div className="container max-w-3xl">
        <div className="rounded-2xl border-2 border-amber-200 bg-amber-50/50 p-8 md:p-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Info className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-800 text-xs font-semibold uppercase tracking-wide">
                {t('home.disclaimer_badge')}
              </span>
              <h2 className="font-display text-2xl font-semibold text-foreground mt-1">
                {t('home.disclaimer_title')}
              </h2>
            </div>
          </div>

          <div className="space-y-5 text-base leading-relaxed text-foreground/80">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-lg">🤝</span>
              </div>
              <p dangerouslySetInnerHTML={{ __html: t('home.disclaimer_p1') }} />
            </div>

            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Download className="w-4 h-4 text-primary" />
              </div>
              <p dangerouslySetInnerHTML={{ __html: t('home.disclaimer_p2') }} />
            </div>

            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Eye className="w-4 h-4 text-primary" />
              </div>
              <p dangerouslySetInnerHTML={{ __html: t('home.disclaimer_p3') }} />
            </div>

            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-lg">🌱</span>
              </div>
              <p dangerouslySetInnerHTML={{ __html: t('home.disclaimer_p4') }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
