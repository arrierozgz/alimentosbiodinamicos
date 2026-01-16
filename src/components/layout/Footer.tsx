import { Link } from "react-router-dom";
import { Leaf, Mail, Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-earth">
                <Leaf className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <span className="font-display text-lg font-semibold text-foreground">
                  Alimentos
                </span>
                <span className="font-display text-lg font-semibold text-primary ml-1">
                  Biodinámicos
                </span>
              </div>
            </Link>
            <p className="text-muted-foreground max-w-md leading-relaxed">
              Conectamos directamente a consumidores con agricultores, ganaderos y 
              elaboradores de preparados biodinámicos. Sin intermediarios, sin comisiones, 
              solo personas.
            </p>
            <p className="mt-4 text-sm text-muted-foreground flex items-center gap-1">
              Hecho con <Heart className="h-3 w-3 text-accent" /> sin ánimo de lucro
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-display text-lg font-medium mb-4 text-foreground">
              Explora
            </h4>
            <ul className="space-y-3">
              <li>
                <Link to="/explorar" className="text-muted-foreground hover:text-primary transition-colors">
                  Buscar productos
                </Link>
              </li>
              <li>
                <Link to="/mapa" className="text-muted-foreground hover:text-primary transition-colors">
                  Mapa de agricultores
                </Link>
              </li>
              <li>
                <Link to="/preparados" className="text-muted-foreground hover:text-primary transition-colors">
                  Preparados biodinámicos
                </Link>
              </li>
              <li>
                <Link to="/sobre-nosotros" className="text-muted-foreground hover:text-primary transition-colors">
                  Sobre nosotros
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-lg font-medium mb-4 text-foreground">
              Contacto
            </h4>
            <ul className="space-y-3">
              <li>
                <a 
                  href="mailto:info@alimentosbiodinamicos.org" 
                  className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  Escríbenos
                </a>
              </li>
              <li>
                <Link to="/privacidad" className="text-muted-foreground hover:text-primary transition-colors">
                  Privacidad
                </Link>
              </li>
              <li>
                <Link to="/terminos" className="text-muted-foreground hover:text-primary transition-colors">
                  Términos de uso
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Acknowledgments */}
        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-center text-sm text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-4">
            Esta aplicación ha sido construida de forma gratuita gracias a herramientas de IA 
            (ChatGPT y Lovable), al servicio de un proyecto sin ánimo de lucro, con respeto 
            por la agricultura biodinámica y la libertad humana.
          </p>
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Pedidos Alimentos Biodinámicos. 
            Proyecto sin ánimo de lucro. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
