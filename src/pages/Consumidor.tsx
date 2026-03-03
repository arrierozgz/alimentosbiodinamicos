import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card } from '@/components/ui/card';
import { MapPin, ShoppingBasket, Leaf } from 'lucide-react';

export default function Consumidor() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="bg-gradient-natural py-12 md:py-20">
          <div className="container max-w-3xl text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Leaf className="w-10 h-10 text-primary" />
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-3">
              ¡Bienvenido a la comunidad!
            </h1>
            <p className="text-lg text-muted-foreground mb-10">
              Encuentra alimentos ecológicos, biodinámicos y Demeter cerca de ti
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
              {/* Buscar por cercanía */}
              <Card
                className="p-8 cursor-pointer hover:shadow-elevated transition-all hover:scale-[1.02] border-2 hover:border-primary/50"
                onClick={() => navigate('/explorar?modo=cercania')}
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center">
                    <MapPin className="w-10 h-10 text-blue-600" />
                  </div>
                  <h2 className="font-display text-xl font-semibold">Buscar por cercanía</h2>
                  <p className="text-muted-foreground text-sm">
                    Encuentra productores cerca de tu ubicación o provincia
                  </p>
                </div>
              </Card>

              {/* Buscar por producto */}
              <Card
                className="p-8 cursor-pointer hover:shadow-elevated transition-all hover:scale-[1.02] border-2 hover:border-primary/50"
                onClick={() => navigate('/explorar?modo=producto')}
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center">
                    <ShoppingBasket className="w-10 h-10 text-green-600" />
                  </div>
                  <h2 className="font-display text-xl font-semibold">Buscar por producto</h2>
                  <p className="text-muted-foreground text-sm">
                    Aceite, fruta, trufa, cereales... filtra por tipo, variedad y envase
                  </p>
                </div>
              </Card>
            </div>

            {/* Leyenda certificaciones */}
            <div className="mt-12 bg-white/80 rounded-xl border border-border p-6 max-w-2xl mx-auto text-left">
              <h3 className="font-display text-lg font-semibold mb-4 text-center">
                Tipos de certificación
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50/50">
                  <span className="text-xl mt-0.5">🟢</span>
                  <div>
                    <span className="font-medium text-sm">Ecológico</span>
                    <p className="text-xs text-muted-foreground">Producción ecológica sin certificación oficial</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50/80">
                  <span className="text-xl mt-0.5">🟢✅</span>
                  <div>
                    <span className="font-medium text-sm">Ecológico certificado</span>
                    <p className="text-xs text-muted-foreground">Ecológico con sello oficial</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-purple-50/50">
                  <span className="text-xl mt-0.5">🟣</span>
                  <div>
                    <span className="font-medium text-sm">Biodinámico</span>
                    <p className="text-xs text-muted-foreground">Método biodinámico (no requiere ser ecológico)</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50/50">
                  <span className="text-xl mt-0.5">🟡</span>
                  <div>
                    <span className="font-medium text-sm">Demeter</span>
                    <p className="text-xs text-muted-foreground">Biodinámico + ecológico certificado (máxima exigencia)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
