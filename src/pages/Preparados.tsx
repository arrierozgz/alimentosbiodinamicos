import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Leaf, Loader2, User, Mail } from 'lucide-react';

const PREP_EMOJIS: Record<string, string> = {
  '500': '🐄', '501': '✨', '502': '🌿', '503': '🌼', '504': '🌱',
  '505': '🌳', '506': '🌻', '507': '💜', '508': '🌿', 'maria_thun': '⭐',
};

interface PreparationWithUser {
  id: string;
  user_id: string;
  preparation: string;
  price: number | null;
  unit: string | null;
  is_active: boolean;
  farmer_name?: string;
  farmer_location?: string;
}

export default function Preparados() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [availablePreparations, setAvailablePreparations] = useState<PreparationWithUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPreparations();
  }, [user]);

  const fetchPreparations = async () => {
    try {
      if (user) {
        const { data, error } = await supabase
          .from('biodynamic_preparations')
          .select('*')
          .eq('is_active', true);

        if (!error && data) {
          const { data: profiles } = await supabase
            .from('farmer_profiles_public' as any)
            .select('user_id, farm_name, approximate_location');

          const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));

          setAvailablePreparations(
            data.map((p) => ({
              ...p,
              farmer_name: (profileMap.get(p.user_id) as any)?.farm_name,
              farmer_location: (profileMap.get(p.user_id) as any)?.approximate_location,
            }))
          );
        }
      }
    } catch (error) {
      console.error('Error fetching preparations:', error);
    } finally {
      setLoading(false);
    }
  };

  const availableByType = new Map<string, PreparationWithUser[]>();
  availablePreparations.forEach((p) => {
    const existing = availableByType.get(p.preparation) || [];
    existing.push(p);
    availableByType.set(p.preparation, existing);
  });

  const prepOrder = ['500', '501', '502', '503', '504', '505', '506', '507', '508', 'maria_thun'];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="bg-gradient-natural py-10 md:py-16">
          <div className="container max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-leaf/10 text-leaf text-sm font-medium mb-4">
              <Leaf className="h-4 w-4" />
              {t('preparations_page.badge')}
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-3">
              {t('preparations_page.title')}
            </h1>
            <p className="text-lg text-muted-foreground">
              {t('preparations_page.subtitle')}
            </p>
          </div>
        </section>

        <section className="py-8 md:py-12">
          <div className="container max-w-4xl">
            <div className="space-y-6">
              {prepOrder.map((prepId) => {
                const nameKey = `preparations_page.prep_${prepId}_name`;
                const subtitleKey = `preparations_page.prep_${prepId}_subtitle`;
                const descKey = `preparations_page.prep_${prepId}_desc`;
                const emoji = PREP_EMOJIS[prepId] || '🧪';
                const offerings = availableByType.get(prepId) || [];

                return (
                  <Card key={prepId} className="overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-xl bg-leaf/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-2xl">{emoji}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-display text-xl font-semibold">{t(nameKey)}</h3>
                            {offerings.length > 0 && (
                              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                                ✅ {t('preparations_page.available')}
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-medium text-primary mt-0.5">{t(subtitleKey)}</p>
                          <p className="text-muted-foreground mt-2 leading-relaxed">{t(descKey)}</p>

                          {offerings.length > 0 && (
                            <div className="mt-4 space-y-2">
                              {offerings.map((offering) => (
                                <div
                                  key={offering.id}
                                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                                >
                                  <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-muted-foreground" />
                                    <span className="font-medium">
                                      {offering.farmer_name || t('preparations_page.elaborador_fallback')}
                                    </span>
                                    {offering.farmer_location && (
                                      <span className="text-sm text-muted-foreground">
                                        · {offering.farmer_location}
                                      </span>
                                    )}
                                  </div>
                                  {offering.price && (
                                    <span className="font-semibold text-primary">
                                      {offering.price}€/{offering.unit || 'unidad'}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {!user && (
              <div className="mt-8 p-6 rounded-2xl bg-muted/50 text-center">
                <p className="text-lg font-medium mb-2">
                  {t('preparations_page.cta_auth_title')}
                </p>
                <p className="text-muted-foreground mb-4">
                  {t('preparations_page.cta_auth_desc')}
                </p>
                <Link to="/auth">
                  <Button variant="earth" size="xl" className="h-14 text-lg">
                    {t('preparations_page.cta_auth_button')}
                  </Button>
                </Link>
              </div>
            )}

            <div className="mt-8 p-6 rounded-2xl bg-leaf/5 border border-leaf/20 text-center">
              <p className="text-lg font-medium mb-2">
                {t('preparations_page.cta_elab_title')}
              </p>
              <p className="text-muted-foreground mb-4">
                {t('preparations_page.cta_elab_desc')}
              </p>
              <Link to="/auth">
                <Button variant="natural" size="xl" className="h-14 text-lg">
                  {t('preparations_page.cta_elab_button')}
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
