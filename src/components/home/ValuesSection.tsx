import { Heart, Users, Sprout, ShieldCheck } from "lucide-react";

const values = [
  {
    icon: Heart,
    title: "Sin ánimo de lucro",
    description: "No cobramos comisiones ni intermediamos económicamente. El trato es siempre directo entre personas.",
  },
  {
    icon: Users,
    title: "Conexión directa",
    description: "Facilitamos el encuentro entre consumidores y productores. Tú decides con quién tratar y cómo.",
  },
  {
    icon: Sprout,
    title: "Agricultura biodinámica",
    description: "Apoyamos prácticas agrícolas que respetan la tierra, los ciclos naturales y la vida en su conjunto.",
  },
  {
    icon: ShieldCheck,
    title: "Transparencia total",
    description: "Conoce el origen de tus alimentos. Cada productor comparte libremente su historia y métodos.",
  },
];

const ValuesSection = () => {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-4">
            Nuestros principios
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Una plataforma construida sobre valores que priorizan a las personas 
            y la agricultura consciente por encima de todo.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {values.map((value, index) => (
            <div
              key={value.title}
              className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-card transition-all duration-300 animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <value.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-display text-xl font-medium text-foreground mb-2">
                {value.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ValuesSection;
