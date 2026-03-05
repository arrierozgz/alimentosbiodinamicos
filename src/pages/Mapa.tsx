import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Leaf, MapPin, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

// Fix Leaflet default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

// Spanish provinces with approximate coordinates
const PROVINCE_COORDS: Record<string, [number, number]> = {
  'álava': [42.85, -2.67], 'albacete': [38.99, -1.86], 'alicante': [38.35, -0.48],
  'almería': [36.84, -2.47], 'asturias': [43.36, -5.85], 'ávila': [40.66, -4.68],
  'badajoz': [38.88, -6.97], 'barcelona': [41.39, 2.17], 'burgos': [42.34, -3.70],
  'cáceres': [39.47, -6.37], 'cádiz': [36.53, -6.28], 'cantabria': [43.18, -3.99],
  'castellón': [39.99, -0.03], 'ciudad real': [38.99, -3.93], 'córdoba': [37.89, -4.78],
  'cuenca': [40.07, -2.14], 'gerona': [41.98, 2.82], 'girona': [41.98, 2.82],
  'granada': [37.18, -3.60], 'guadalajara': [40.63, -3.17], 'guipúzcoa': [43.32, -1.98],
  'huelva': [37.26, -6.95], 'huesca': [42.14, -0.41], 'jaén': [37.77, -3.79],
  'la rioja': [42.29, -2.52], 'las palmas': [28.10, -15.42], 'león': [42.60, -5.57],
  'lérida': [41.62, 0.63], 'lleida': [41.62, 0.63], 'lugo': [43.01, -7.56],
  'madrid': [40.42, -3.70], 'málaga': [36.72, -4.42], 'murcia': [37.99, -1.13],
  'navarra': [42.82, -1.64], 'orense': [42.34, -7.86], 'ourense': [42.34, -7.86],
  'palencia': [42.01, -4.53], 'pontevedra': [42.43, -8.65],
  'salamanca': [40.96, -5.66], 'segovia': [40.95, -4.12],
  'sevilla': [37.39, -5.99], 'soria': [41.76, -2.47],
  'tarragona': [41.12, 1.25], 'tenerife': [28.47, -16.25], 'teruel': [40.34, -1.11],
  'toledo': [39.86, -4.02], 'valencia': [39.47, -0.38], 'valladolid': [41.65, -4.72],
  'vizcaya': [43.26, -2.92], 'zamora': [41.50, -5.75], 'zaragoza': [41.65, -0.89],
};

function getCoords(location?: string, province?: string): [number, number] | null {
  const prov = (province || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const loc = (location || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  for (const [key, coords] of Object.entries(PROVINCE_COORDS)) {
    const normKey = key.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (prov.includes(normKey) || loc.includes(normKey)) {
      // Add small random offset to avoid stacking
      return [coords[0] + (Math.random() - 0.5) * 0.1, coords[1] + (Math.random() - 0.5) * 0.1];
    }
  }
  return null;
}

interface Producer {
  user_id: string;
  farm_name: string;
  approximate_location?: string;
  province?: string;
  presentation?: string;
  coords: [number, number];
}

export default function Mapa() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [producers, setProducers] = useState<Producer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducers();
  }, []);

  const fetchProducers = async () => {
    try {
      const { data } = await supabase
        .from('farmer_profiles_public' as any)
        .select('user_id, farm_name, approximate_location, province, presentation');

      if (data) {
        const mapped = (data as any[])
          .map((p) => {
            const coords = getCoords(p.approximate_location, p.province);
            return coords ? { ...p, coords } : null;
          })
          .filter(Boolean) as Producer[];
        setProducers(mapped);
      }
    } catch (e) {
      console.error('Error loading producers:', e);
    } finally {
      setLoading(false);
    }
  };

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
            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                <div className="rounded-xl overflow-hidden border shadow-md" style={{ height: '70vh', minHeight: '400px' }}>
                  <MapContainer
                    center={[40.0, -3.5]}
                    zoom={5}
                    minZoom={2}
                    maxZoom={18}
                    style={{ height: '100%', width: '100%' }}
                    scrollWheelZoom={true}
                    worldCopyJump={true}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {producers.map((p) => (
                      <Marker key={p.user_id} position={p.coords} icon={greenIcon}>
                        <Popup>
                          <div className="text-sm">
                            <strong className="text-base">{p.farm_name}</strong>
                            {p.approximate_location && <p className="mt-1">📍 {p.approximate_location}{p.province ? `, ${p.province}` : ''}</p>}
                            {p.presentation && <p className="mt-1 text-gray-600">{p.presentation}</p>}
                            <a href="/explorar" className="mt-2 inline-block text-green-700 font-medium hover:underline">Ver en listín →</a>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                </div>
                <p className="text-center text-sm text-muted-foreground mt-4">
                  {producers.length > 0
                    ? `${producers.length} productores en el mapa`
                    : 'Aún no hay productores con ubicación. ¡Sé el primero!'}
                </p>
                {producers.length === 0 && !user && (
                  <div className="text-center mt-6">
                    <Link to="/auth">
                      <Button variant="earth" size="lg">
                        <Leaf className="w-5 h-5 mr-2" /> Registrarme como productor
                      </Button>
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
