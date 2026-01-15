import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Info } from "lucide-react";

const preparados = [
  { id: "500", name: "Preparado 500", description: "Cuerno de estiércol - para la tierra" },
  { id: "501", name: "Preparado 501", description: "Cuerno de sílice - para la planta" },
  { id: "502", name: "Preparado 502", description: "Milenrama" },
  { id: "503", name: "Preparado 503", description: "Manzanilla" },
  { id: "504", name: "Preparado 504", description: "Ortiga" },
  { id: "505", name: "Preparado 505", description: "Corteza de roble" },
  { id: "506", name: "Preparado 506", description: "Diente de león" },
  { id: "507", name: "Preparado 507", description: "Valeriana" },
  { id: "508", name: "Preparado 508", description: "Cola de caballo" },
  { id: "maria-thun", name: "María Thun", description: "Preparado compuesto" },
];

const PreparadosPreview = () => {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-leaf/10 text-leaf text-sm font-medium mb-4">
              <Info className="h-4 w-4" />
              Preparados biodinámicos
            </div>
            
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-4">
              El corazón de la agricultura biodinámica
            </h2>
            
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              Los preparados biodinámicos son sustancias especiales que vitalizan 
              el suelo y las plantas. Conectamos a agricultores con elaboradores 
              para que puedas acceder a estos preparados de forma directa.
            </p>

            <Link to="/preparados">
              <Button variant="natural" className="group">
                Ver todos los preparados
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {preparados.slice(0, 9).map((prep, index) => (
              <div
                key={prep.id}
                className="p-4 rounded-xl bg-card border border-border hover:border-leaf/30 hover:shadow-soft transition-all duration-200 animate-fade-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="w-10 h-10 rounded-lg bg-leaf/10 flex items-center justify-center mb-2 text-leaf font-display font-semibold text-sm">
                  {prep.id === "maria-thun" ? "MT" : prep.id}
                </div>
                <p className="font-medium text-foreground text-sm leading-tight">
                  {prep.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PreparadosPreview;
