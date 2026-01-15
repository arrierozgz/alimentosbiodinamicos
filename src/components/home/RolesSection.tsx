import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingBasket, Tractor, Beaker, ArrowRight } from "lucide-react";

const roles = [
  {
    icon: ShoppingBasket,
    title: "Consumidor",
    description: "Encuentra alimentos biodinámicos cerca de ti. Conecta directamente con productores locales y apoya la agricultura consciente.",
    features: ["Busca por producto o ubicación", "Guarda tus favoritos", "Contacta directamente"],
    color: "primary" as const,
    link: "/registro?rol=consumidor",
  },
  {
    icon: Tractor,
    title: "Agricultor / Ganadero",
    description: "Comparte tu trabajo con consumidores que valoran la agricultura biodinámica. Sin comisiones, trato directo.",
    features: ["Publica tus productos", "Gestiona variedades y precios", "Recibe pedidos por email"],
    color: "accent" as const,
    link: "/registro?rol=agricultor",
  },
  {
    icon: Beaker,
    title: "Elaborador de preparados",
    description: "Ofrece preparados biodinámicos (500-508, María Thun) a agricultores que buscan practicar la biodinámica.",
    features: ["Catálogo de preparados", "Precios y unidades flexibles", "Contacto directo"],
    color: "leaf" as const,
    link: "/registro?rol=elaborador",
  },
];

const RolesSection = () => {
  return (
    <section className="py-16 md:py-24 bg-gradient-natural">
      <div className="container">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-4">
            Elige tu camino
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Un mismo usuario puede actuar como consumidor, agricultor o elaborador 
            según sus necesidades. Tú decides tu rol en cada momento.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {roles.map((role, index) => (
            <div
              key={role.title}
              className="group relative bg-card rounded-2xl border border-border overflow-hidden hover:shadow-elevated transition-all duration-300 animate-fade-up"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              {/* Header */}
              <div className={`p-6 pb-4 ${
                role.color === "primary" ? "bg-primary/5" :
                role.color === "accent" ? "bg-accent/10" :
                "bg-leaf/10"
              }`}>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${
                  role.color === "primary" ? "bg-primary/20" :
                  role.color === "accent" ? "bg-accent/20" :
                  "bg-leaf/20"
                }`}>
                  <role.icon className={`h-7 w-7 ${
                    role.color === "primary" ? "text-primary" :
                    role.color === "accent" ? "text-accent" :
                    "text-leaf"
                  }`} />
                </div>
                <h3 className="font-display text-2xl font-medium text-foreground">
                  {role.title}
                </h3>
              </div>

              {/* Content */}
              <div className="p-6 pt-4">
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {role.description}
                </p>

                <ul className="space-y-2 mb-6">
                  {role.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-foreground">
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        role.color === "primary" ? "bg-primary" :
                        role.color === "accent" ? "bg-accent" :
                        "bg-leaf"
                      }`} />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link to={role.link}>
                  <Button 
                    variant={role.color === "accent" ? "warm" : role.color === "primary" ? "earth" : "natural"} 
                    className="w-full group/btn"
                  >
                    Comenzar
                    <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RolesSection;
