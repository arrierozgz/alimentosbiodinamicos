import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Leaf, Loader2, User, Mail } from 'lucide-react';

const PREPARADOS_INFO: Record<string, { name: string; subtitle: string; description: string; emoji: string }> = {
  '500': {
    name: 'Preparado 500',
    subtitle: 'Cuerno de estiércol',
    description: 'Para la tierra. Se aplica pulverizado sobre el suelo para estimular la vida microbiana, la formación de humus y el enraizamiento de las plantas.',
    emoji: '🐄',
  },
  '501': {
    name: 'Preparado 501',
    subtitle: 'Cuerno de sílice',
    description: 'Para la planta. Se pulveriza finamente sobre las hojas para potenciar la fotosíntesis, la maduración y la calidad de los frutos.',
    emoji: '✨',
  },
  '502': {
    name: 'Preparado 502',
    subtitle: 'Milenrama (Achillea millefolium)',
    description: 'Preparado de compost. Regula el azufre y el potasio en el compost, favoreciendo procesos de nutrición sutiles.',
    emoji: '🌿',
  },
  '503': {
    name: 'Preparado 503',
    subtitle: 'Manzanilla (Matricaria chamomilla)',
    description: 'Preparado de compost. Estabiliza el nitrógeno y estimula el crecimiento vegetal. Relacionada con el calcio y el azufre.',
    emoji: '🌼',
  },
  '504': {
    name: 'Preparado 504',
    subtitle: 'Ortiga (Urtica dioica)',
    description: 'Preparado de compost. Vivifica el suelo y regula el hierro. Da al compost una "sensibilidad" especial, como un corazón interior.',
    emoji: '🌱',
  },
  '505': {
    name: 'Preparado 505',
    subtitle: 'Corteza de roble (Quercus robur)',
    description: 'Preparado de compost. Aporta calcio de forma viva y protege contra enfermedades fúngicas. Da estructura y forma.',
    emoji: '🌳',
  },
  '506': {
    name: 'Preparado 506',
    subtitle: 'Diente de león (Taraxacum officinale)',
    description: 'Preparado de compost. Relaciona la planta con su entorno cósmico. Media entre el sílice y el potasio en el suelo.',
    emoji: '🌻',
  },
  '507': {
    name: 'Preparado 507',
    subtitle: 'Valeriana (Valeriana officinalis)',
    description: 'Preparado de compost. Se aplica como jugo diluido. Estimula el fósforo y protege del frío. Envuelve al compost como una piel cálida.',
    emoji: '💜',
  },
  '508': {
    name: 'Preparado 508',
    subtitle: 'Cola de caballo (Equisetum arvense)',
    description: 'Decocción fungicida natural. Se pulveriza contra hongos y para regular las fuerzas lunares excesivas de humedad.',
    emoji: '🌿',
  },
  'maria_thun': {
    name: 'María Thun',
    subtitle: 'Preparado compuesto',
    description: 'Preparado de compost desarrollado por Maria Thun. Combina estiércol de vaca con los preparados 502-507 y cáscaras de huevo. Simplifica el uso de preparados para compost.',
    emoji: '⭐',
  },
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
  const { user } = useAuth();
  const [availablePreparations, setAvailablePreparations] = useState<PreparationWithUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPreparations();
  }, [user]);

  const fetchPreparations = async () => {
    try {
      // Only authenticated users can see preparations with prices
      if (user) {
        const { data, error } = await supabase
          .from('biodynamic_preparations')
          .select('*')
          .eq('is_active', true);

        if (!error && data) {
          // Fetch farmer names for each preparation
          const userIds = [...new Set(data.map((p) => p.user_id))];
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

  // Group available preparations by type
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
        {/* Hero */}
        <section className="bg-gradient-natural py-10 md:py-16">
          <div className="container max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-leaf/10 text-leaf text-sm font-medium mb-4">
              <Leaf className="h-4 w-4" />
              Agricultura biodinámica
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-3">
              Preparados biodinámicos
            </h1>
            <p className="text-lg text-muted-foreground">
              Los preparados 500-508 son el corazón de la agricultura biodinámica, formulados por Rudolf Steiner en 1924. Vitalizan la tierra y las plantas.
            </p>
          </div>
        </section>

        {/* Preparados grid */}
        <section className="py-8 md:py-12">
          <div className="container max-w-4xl">
            <div className="space-y-6">
              {prepOrder.map((prepId) => {
                const info = PREPARADOS_INFO[prepId];
                if (!info) return null;
                const offerings = availableByType.get(prepId) || [];

                return (
                  <Card key={prepId} className="overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-xl bg-leaf/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-2xl">{info.emoji}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-display text-xl font-semibold">{info.name}</h3>
                            {offerings.length > 0 && (
                              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                                ✅ Disponible
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-medium text-primary mt-0.5">{info.subtitle}</p>
                          <p className="text-muted-foreground mt-2 leading-relaxed">{info.description}</p>

                          {/* Available offerings */}
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
                                      {offering.farmer_name || 'Elaborador'}
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

            {/* CTA for non-authenticated */}
            {!user && (
              <div className="mt-8 p-6 rounded-2xl bg-muted/50 text-center">
                <p className="text-lg font-medium mb-2">
                  ¿Quieres ver qué elaboradores ofrecen estos preparados?
                </p>
                <p className="text-muted-foreground mb-4">
                  Regístrate gratis para ver precios y contactar directamente.
                </p>
                <Link to="/auth">
                  <Button variant="earth" size="xl" className="h-14 text-lg">
                    Acceder a la comunidad
                  </Button>
                </Link>
              </div>
            )}

            {/* CTA for elaboradores */}
            <div className="mt-8 p-6 rounded-2xl bg-leaf/5 border border-leaf/20 text-center">
              <p className="text-lg font-medium mb-2">
                ¿Elaboras preparados biodinámicos?
              </p>
              <p className="text-muted-foreground mb-4">
                Regístrate como elaborador y ofrece tus preparados a la comunidad.
              </p>
              <Link to="/auth">
                <Button variant="natural" size="xl" className="h-14 text-lg">
                  Registrarme como elaborador
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
