import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Filter, Leaf, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const greenIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const CERT_FILTERS = [
  { key: "biodinamico", label: "BIODINÁMICO", active: "bg-amber-600 hover:bg-amber-700 text-white" },
  { key: "demeter", label: "demeter", active: "bg-green-700 hover:bg-green-800 text-white" },
  { key: "ecologico", label: "ecológico", active: "bg-emerald-600 hover:bg-emerald-700 text-white" },
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

interface ProducerMapPreviewProps {
  compact?: boolean;
  showSignupCta?: boolean;
  scrollWheelZoom?: boolean;
}

export default function ProducerMapPreview({ compact = false, showSignupCta = false, scrollWheelZoom = true }: ProducerMapPreviewProps) {
  const [allProducers, setAllProducers] = useState<Producer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducers = async () => {
      try {
        const { data } = await supabase
          .from("farmer_map_view" as any)
          .select("user_id, farm_name, approximate_location, province, presentation, latitude, longitude, certifications");

        const mapped = ((data || []) as any[])
          .map((p) => {
            const coords = p.latitude && p.longitude ? ([p.latitude, p.longitude] as [number, number]) : null;
            return coords ? { ...p, coords } : null;
          })
          .filter(Boolean) as Producer[];

        setAllProducers(mapped);
      } catch (error) {
        console.error("Error loading producers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducers();
  }, []);

  const filteredProducers = useMemo(() => {
    if (!activeFilter) return allProducers;

    return allProducers.filter((producer) => {
      const certs = producer.certifications || [];
      if (activeFilter === "ecologico") {
        return certs.some((cert) => cert === "ecologico" || cert === "ecologico_certificado");
      }
      return certs.includes(activeFilter);
    });
  }, [activeFilter, allProducers]);

  const getCertBadges = (certs: string[]) => {
    const badges: string[] = [];
    if (certs.includes("biodinamico")) badges.push("Biodinámico");
    if (certs.includes("demeter")) badges.push("Demeter");
    if (certs.some((cert) => cert === "ecologico" || cert === "ecologico_certificado")) badges.push("Ecológico");
    return badges;
  };

  return (
    <div className="w-full">
      <div className="mb-3 flex flex-wrap items-center justify-center gap-2 text-sm lg:justify-start">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-muted-foreground">Filtrar:</span>
        {CERT_FILTERS.map((filter) => (
          <button
            key={filter.key}
            type="button"
            onClick={() => setActiveFilter(activeFilter === filter.key ? null : filter.key)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
              activeFilter === filter.key ? `${filter.active} ring-2 ring-black/15 ring-offset-1` : "bg-white/75 text-foreground hover:bg-white"
            }`}
          >
            {filter.label}
          </button>
        ))}
        {activeFilter && (
          <button
            type="button"
            onClick={() => setActiveFilter(null)}
            className="rounded-full bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-200"
          >
            Quitar filtro
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex h-80 items-center justify-center rounded-xl border bg-white/70">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border bg-white shadow-card" style={{ height: compact ? "420px" : "70vh", minHeight: compact ? "340px" : "400px" }}>
            <MapContainer
              center={[40.0, -3.5]}
              zoom={5}
              minZoom={2}
              maxZoom={18}
              style={{ height: "100%", width: "100%" }}
              scrollWheelZoom={scrollWheelZoom}
              worldCopyJump
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {filteredProducers.map((producer) => (
                <Marker key={producer.user_id} position={producer.coords} icon={greenIcon}>
                  <Popup>
                    <div className="text-sm">
                      <strong className="text-base">{producer.farm_name}</strong>
                      {producer.approximate_location && (
                        <p className="mt-1">
                          {producer.approximate_location}
                          {producer.province ? `, ${producer.province}` : ""}
                        </p>
                      )}
                      {producer.certifications && producer.certifications.length > 0 && (
                        <p className="mt-1">{getCertBadges(producer.certifications).join(" · ")}</p>
                      )}
                      {producer.presentation && <p className="mt-1 text-gray-600">{producer.presentation}</p>}
                      <Link to="/explorar" className="mt-2 inline-block font-medium text-green-700 hover:underline">
                        Ver productos
                      </Link>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
          <p className="mt-3 text-center text-sm text-muted-foreground">
            {filteredProducers.length > 0
              ? activeFilter
                ? `${filteredProducers.length} de ${allProducers.length} agricultores`
                : `${allProducers.length} agricultores en el mapa`
              : activeFilter
                ? "Ningún agricultor con esta certificación."
                : "Aún no hay agricultores con ubicación."}
          </p>
          {showSignupCta && allProducers.length === 0 && (
            <div className="mt-6 text-center">
              <Link to="/auth">
                <Button variant="earth" size="lg">
                  <Leaf className="mr-2 h-5 w-5" />
                  Registrarme como agricultor
                </Button>
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
