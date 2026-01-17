import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Leaf, User, Search, Heart, ChevronDown, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUserRoles } from "@/hooks/useUserRoles";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const roleLabels: Record<string, string> = {
  consumidor: "Consumidor",
  agricultor: "Agricultor",
  ganadero: "Ganadero",
  elaborador: "Elaborador",
};

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { roles, activeRole, setActiveRole } = useUserRoles();

  const handleSignOut = async () => {
    await signOut();
    setIsMenuOpen(false);
  };

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
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="natural" className="gap-2">
                  <User className="h-4 w-4" />
                  {activeRole ? roleLabels[activeRole] : 'Mi cuenta'}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {roles.length > 1 && (
                  <>
                    <DropdownMenuLabel>Cambiar rol activo</DropdownMenuLabel>
                    {roles.map((role) => (
                      <DropdownMenuItem
                        key={role}
                        onClick={() => setActiveRole(role)}
                        className={activeRole === role ? 'bg-primary/10' : ''}
                      >
                        {roleLabels[role]}
                        {activeRole === role && (
                          <span className="ml-auto text-xs text-primary">Activo</span>
                        )}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem asChild>
                  <Link to="/mi-perfil">Mi perfil</Link>
                </DropdownMenuItem>
                {(activeRole === 'agricultor' || activeRole === 'ganadero') && (
                  <DropdownMenuItem asChild>
                    <Link to="/agricultor">Mis productos</Link>
                  </DropdownMenuItem>
                )}
                {activeRole === 'elaborador' && (
                  <DropdownMenuItem asChild>
                    <Link to="/elaborador">Mis preparados</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                  <LogOut className="h-4 w-4 mr-2" />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link to="/auth">
                <Button variant="natural" className="gap-2">
                  <User className="h-4 w-4" />
                  Acceder
                </Button>
              </Link>
              <Link to="/auth">
                <Button variant="earth">Únete</Button>
              </Link>
            </>
          )}
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
            
            {user ? (
              <>
                {roles.length > 1 && (
                  <div className="px-3 py-2">
                    <p className="text-sm text-muted-foreground mb-2">Rol activo:</p>
                    <div className="flex flex-wrap gap-2">
                      {roles.map((role) => (
                        <Button
                          key={role}
                          variant={activeRole === role ? "earth" : "outline"}
                          size="sm"
                          onClick={() => setActiveRole(role)}
                        >
                          {roleLabels[role]}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
                <div className="border-t border-border my-2" />
                <Link to="/mi-perfil" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start gap-2">
                    <User className="h-4 w-4" />
                    Mi perfil
                  </Button>
                </Link>
                {(activeRole === 'agricultor' || activeRole === 'ganadero') && (
                  <Link to="/agricultor" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      Mis productos
                    </Button>
                  </Link>
                )}
                {activeRole === 'elaborador' && (
                  <Link to="/elaborador" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      Mis preparados
                    </Button>
                  </Link>
                )}
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-destructive"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Cerrar sesión
                </Button>
              </>
            ) : (
              <>
                <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="natural" className="w-full justify-start gap-2">
                    <User className="h-4 w-4" />
                    Acceder
                  </Button>
                </Link>
                <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="earth" className="w-full">
                    Únete
                  </Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
