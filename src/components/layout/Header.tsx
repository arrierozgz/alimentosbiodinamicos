import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Leaf, User, Search, Heart, MessageCircle, ChevronDown, LogOut, Download } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { useUserRoles } from "@/hooks/useUserRoles";
import { useDataExport } from "@/hooks/useDataExport";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { roles, activeRole, setActiveRole } = useUserRoles();
  const { exporting, exportData, exportProductsCSV } = useDataExport();

  const roleLabels: Record<string, string> = {
    consumidor: t('home.role_consumer'),
    agricultor: t('home.role_farmer'),
    ganadero: t('home.role_farmer'),
    elaborador: t('home.role_elaborador'),
  };

  const handleSignOut = async () => {
    await signOut();
    setIsMenuOpen(false);
  };

  const showProductExport = activeRole === 'agricultor' || activeRole === 'ganadero' || activeRole === 'elaborador';

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
              {t("nav.explore")}
            </Button>
          </Link>
          <Link to="/mapa">
            <Button variant="ghost">{t("nav.map")}</Button>
          </Link>
          <Link to="/preparados">
            <Button variant="ghost">{t("nav.preparations")}</Button>
          </Link>
          <Link to="/sobre-nosotros">
            <Button variant="ghost">{t("nav.about")}</Button>
          </Link>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-2">
          <LanguageSwitcher />
          {user && (
            <Link to="/mensajes">
              <Button variant="ghost" size="icon">
                <MessageCircle className="h-5 w-5" />
              </Button>
            </Link>
          )}
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
                  {activeRole ? roleLabels[activeRole] : t('common.my_account')}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {roles.length > 1 && (
                  <>
                    <DropdownMenuLabel>{t('common.switch_role')}</DropdownMenuLabel>
                    {roles.map((role) => (
                      <DropdownMenuItem
                        key={role}
                        onClick={() => setActiveRole(role)}
                        className={activeRole === role ? 'bg-primary/10' : ''}
                      >
                        {roleLabels[role]}
                        {activeRole === role && (
                          <span className="ml-auto text-xs text-primary">{t('common.active')}</span>
                        )}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem asChild>
                  <Link to="/mi-perfil">{t('common.my_profile')}</Link>
                </DropdownMenuItem>
                {(activeRole === 'agricultor' || activeRole === 'ganadero') && (
                  <DropdownMenuItem asChild>
                    <Link to="/agricultor">{t('common.my_products')}</Link>
                  </DropdownMenuItem>
                )}
                {activeRole === 'elaborador' && (
                  <DropdownMenuItem asChild>
                    <Link to="/elaborador">{t('common.my_preparations_link')}</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuLabel>{t('common.export_data')}</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => exportData()} disabled={exporting}>
                  <Download className="h-4 w-4 mr-2" />
                  {t('common.all_json')}
                </DropdownMenuItem>
                {showProductExport && (
                  <DropdownMenuItem onClick={exportProductsCSV} disabled={exporting}>
                    <Download className="h-4 w-4 mr-2" />
                    {t('common.products_csv')}
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                  <LogOut className="h-4 w-4 mr-2" />
                  {t('common.logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link to="/auth">
                <Button variant="natural" className="gap-2">
                  <User className="h-4 w-4" />
                  {t('common.access')}
                </Button>
              </Link>
              <Link to="/auth">
                <Button variant="earth">{t("common.register")}</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Actions + Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          {!user && (
            <Link to="/auth">
              <Button variant="earth" size="sm" className="gap-1.5">
                <User className="h-4 w-4" />
                {t('common.access')}
              </Button>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-border/50 bg-background animate-fade-in">
          <nav className="container py-4 flex flex-col gap-2">
            <Link to="/explorar" onClick={() => setIsMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start gap-2">
                <Search className="h-4 w-4" />
                {t("nav.explore")}
              </Button>
            </Link>
            <Link to="/mapa" onClick={() => setIsMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">
                {t("nav.map")}
              </Button>
            </Link>
            <Link to="/preparados" onClick={() => setIsMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">
                {t("nav.preparations")}
              </Button>
            </Link>
            <Link to="/sobre-nosotros" onClick={() => setIsMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">
                {t("nav.about")}
              </Button>
            </Link>
            <div className="border-t border-border my-2" />
            <Link to="/favoritos" onClick={() => setIsMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start gap-2">
                <Heart className="h-4 w-4" />
                {t('common.favorites')}
              </Button>
            </Link>
            
            {user ? (
              <>
                {roles.length > 1 && (
                  <div className="px-3 py-2">
                    <p className="text-sm text-muted-foreground mb-2">{t('common.active_role')}</p>
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
                    {t('common.my_profile')}
                  </Button>
                </Link>
                {(activeRole === 'agricultor' || activeRole === 'ganadero') && (
                  <Link to="/agricultor" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      {t('common.my_products')}
                    </Button>
                  </Link>
                )}
                {activeRole === 'elaborador' && (
                  <Link to="/elaborador" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      {t('common.my_preparations_link')}
                    </Button>
                  </Link>
                )}
                <div className="border-t border-border my-2" />
                <p className="px-3 py-1 text-sm text-muted-foreground">{t('common.export_data')}</p>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start gap-2"
                  onClick={() => { exportData(); setIsMenuOpen(false); }}
                  disabled={exporting}
                >
                  <Download className="h-4 w-4" />
                  {t('common.all_json')}
                </Button>
                {showProductExport && (
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start gap-2"
                    onClick={() => { exportProductsCSV(); setIsMenuOpen(false); }}
                    disabled={exporting}
                  >
                    <Download className="h-4 w-4" />
                    {t('common.products_csv')}
                  </Button>
                )}
                <div className="border-t border-border my-2" />
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-destructive"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {t('common.logout')}
                </Button>
              </>
            ) : (
              <>
                <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="natural" className="w-full justify-start gap-2">
                    <User className="h-4 w-4" />
                    {t('common.access')}
                  </Button>
                </Link>
                <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="earth" className="w-full">
                    {t('common.join')}
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
