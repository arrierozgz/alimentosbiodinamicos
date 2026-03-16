import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Leaf, MapPin, Loader2, Filter } from 'lucide-react';
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

// Certification filter options - BIODINÁMICO first (uppercase), rest lowercase
const CERT_FILTERS = [
  { key: 'biodinamico', label: 'BIODINÁMICO', color: 'bg-amber-600 hover:bg-amber-700 text-white' },
  { key: 'demeter', label: 'demeter', color: 'bg-green-700 hover:bg-green-800 text-white' },
  { key: 'ecologico', label: 'ecológico', color: 'bg-emerald-600 hover:bg-emerald-700 text-white' },
] as const;

interface Producer {
  user_id: string;
  farm_name: string;
  approximate_location?: string;
  province?: string;
  presentation?: string;
  latitude?: number;
  longitude?: number;
  certifications?: string[];
  coords: [number, number];
}

export default function Mapa() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [allProducers, setAllProducers] = useState<Producer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  useEffect(() => {
    fetchProducers();
  }, []);

  const fetchProducers = async () => {
    try {
      const { data } = await supabase
        .from('farmer_map_view' as any)
        .select('user_id, farm_name, approximate_location, province, presentation, latitude, longitude, certifications');

      if (data) {
        const mapped = (data as any[])
          .map((p) => {
            const coords = (p.latitude && p.longitude)
              ? [p.latitude, p.longitude] as [number, number]
              : null;
            return coords ? { ...p, coords } : null;
          })
          .filter(Boolean) as Producer[];
        setAllProducers(mapped);
      }
    } catch (e) {
      console.error('Error loading producers:', e);
    } finally {
      setLoading(false);
    }
  };

  // Filter producers based on active certification filter
  const filteredProducers = activeFilter
    ? allProducers.filter((p) => {
        const certs = p.certifications || [];
        if (activeFilter === 'ecologico') {
          return certs.some((c) => c === 'ecologico' || c === 'ecologico_certificado');
        }
        return certs.includes(activeFilter);
      })
    : allProducers;

  const handleFilterClick = (key: string) => {
    setActiveFilter(activeFilter === key ? null : key);
  };

  // Get certification badges for popup
  const getCertBadges = (certs: string[]) => {
    const badges: string[] = [];
    if (certs.includes('biodinamico')) badges.push('🌾 Biodinámico');
    if (certs.includes('demeter')) badges.push('🏅 Demeter');
    if (certs.some((c) => c === 'ecologico' || c === 'ecologico_certificado')) badges.push('🌿 Ecológico');
    return badges;
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
            {/* Certification filters */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground mr-1">Filtrar por certificación:</span>
              {CERT_FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => handleFilterClick(f.key)}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                    activeFilter === f.key
                      ? `${f.color} ring-2 ring-offset-2 ring-black/20 scale-105`
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {f.label}
                </button>
              ))}
              {activeFilter && (
                <button
                  onClick={() => setActiveFilter(null)}
                  className="px-3 py-1.5 rounded-full text-xs bg-red-100 text-red-700 hover:bg-red-200 transition-all"
                >
                  ✕ Quitar filtro
                </button>
              )}
            </div>

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
                    {filteredProducers.map((p) => (
                      <Marker key={p.user_id} position={p.coords} icon={greenIcon}>
                        <Popup>
                          <div className="text-sm">
                            <strong className="text-base">{p.farm_name}</strong>
                            {p.approximate_location && <p className="mt-1">📍 {p.approximate_location}{p.province ? `, ${p.province}` : ''}</p>}
                            {p.certifications && p.certifications.length > 0 && (
                              <p className="mt-1">{getCertBadges(p.certifications).join(' · ')}</p>
                            )}
                            {p.presentation && <p className="mt-1 text-gray-600">{p.presentation}</p>}
                            <a href="/explorar" className="mt-2 inline-block text-green-700 font-medium hover:underline" onClick={(e) => { e.preventDefault(); window.location.href = '/explorar'; }}>Ver productos →</a>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                </div>
                <p className="text-center text-sm text-muted-foreground mt-4">
                  {filteredProducers.length > 0
                    ? activeFilter
                      ? `${filteredProducers.length} de ${allProducers.length} agricultores (filtro activo)`
                      : `${allProducers.length} agricultores en el mapa`
                    : activeFilter
                      ? 'Ningún agricultor con esta certificación. Prueba otro filtro.'
                      : 'Aún no hay agricultores con ubicación. ¡Sé el primero!'}
                </p>
                {allProducers.length === 0 && !user && (
                  <div className="text-center mt-6">
                    <Link to="/auth">
                      <Button variant="earth" size="lg">
                        <Leaf className="w-5 h-5 mr-2" /> Registrarme como agricultor
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
