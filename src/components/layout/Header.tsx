import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Leaf, User, Search, Heart } from "lucide-react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-earth shadow-soft group-hover:shadow-card transition-shadow">
            <Leaf className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="hidden sm:block">
            <span className="font-display text-lg font-semibold text-foreground">
              Alimentos
            </span>
            <span className="font-display text-lg font-semibold text-primary ml-1">
              Biodinámicos
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <Link to="/explorar">
            <Button variant="ghost" className="gap-2">
              <Search className="h-4 w-4" />
              Explorar
            </Button>
          </Link>
          <Link to="/mapa">
            <Button variant="ghost">Mapa</Button>
          </Link>
          <Link to="/preparados">
            <Button variant="ghost">Preparados</Button>
          </Link>
          <Link to="/sobre-nosotros">
            <Button variant="ghost">Sobre Nosotros</Button>
          </Link>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-2">
          <Link to="/favoritos">
            <Button variant="ghost" size="icon">
              <Heart className="h-5 w-5" />
            </Button>
          </Link>
          <Link to="/acceder">
            <Button variant="natural" className="gap-2">
              <User className="h-4 w-4" />
              Acceder
            </Button>
          </Link>
          <Link to="/registro">
            <Button variant="earth">Únete</Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-border/50 bg-background animate-fade-in">
          <nav className="container py-4 flex flex-col gap-2">
            <Link to="/explorar" onClick={() => setIsMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start gap-2">
                <Search className="h-4 w-4" />
                Explorar
              </Button>
            </Link>
            <Link to="/mapa" onClick={() => setIsMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">
                Mapa
              </Button>
            </Link>
            <Link to="/preparados" onClick={() => setIsMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">
                Preparados
              </Button>
            </Link>
            <Link to="/sobre-nosotros" onClick={() => setIsMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">
                Sobre Nosotros
              </Button>
            </Link>
            <div className="border-t border-border my-2" />
            <Link to="/favoritos" onClick={() => setIsMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start gap-2">
                <Heart className="h-4 w-4" />
                Favoritos
              </Button>
            </Link>
            <Link to="/acceder" onClick={() => setIsMenuOpen(false)}>
              <Button variant="natural" className="w-full justify-start gap-2">
                <User className="h-4 w-4" />
                Acceder
              </Button>
            </Link>
            <Link to="/registro" onClick={() => setIsMenuOpen(false)}>
              <Button variant="earth" className="w-full">
                Únete
              </Button>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
