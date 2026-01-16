import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Sparkles } from "lucide-react";

const SteinerQuote = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section className="py-12 md:py-16 bg-muted/30">
      <div className="container max-w-3xl">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 text-primary mb-4">
            <Sparkles className="h-5 w-5" />
            <span className="text-sm font-medium uppercase tracking-wider">Inspiración</span>
          </div>
          
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-6">
            Gracias, Rudolf Steiner
          </h2>
          
          <blockquote className="text-lg md:text-xl text-muted-foreground leading-relaxed italic">
            "Esto es un problema de nutrición. La nutrición tal como hoy se entiende…"
          </blockquote>

          {isExpanded && (
            <div className="mt-6 animate-fade-up">
              <blockquote className="text-lg md:text-xl text-muted-foreground leading-relaxed italic">
                "…no suministra la fuerza necesaria para manifestar el espíritu en la vida física.
              </blockquote>
              <p className="mt-6 text-foreground leading-relaxed">
                La nutrición no es solo material, sino un puente metabólico-rítmico hacia el espíritu, 
                debilitado en lo convencional y restaurado en lo biodinámico.
              </p>
            </div>
          )}

          <Button
            variant="ghost"
            size="lg"
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-6 text-primary hover:text-primary/80"
          >
            {isExpanded ? (
              <>
                Cerrar <ChevronUp className="h-4 w-4 ml-1" />
              </>
            ) : (
              <>
                Leer más <ChevronDown className="h-4 w-4 ml-1" />
              </>
            )}
          </Button>
        </div>
      </div>
    </section>
  );
};

export default SteinerQuote;
