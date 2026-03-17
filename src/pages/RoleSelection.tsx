import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Leaf, Wheat, ShoppingBag, Beaker, Store } from 'lucide-react';
import { toast } from 'sonner';
import LanguageSwitcher from '@/components/LanguageSwitcher';

type AppRole = 'consumidor' | 'agricultor' | 'ganadero' | 'elaborador' | 'tienda';

export default function RoleSelection() {
  const { t } = useTranslation();
  const [selectedRoles, setSelectedRoles] = useState<AppRole[]>([]);
  const [compromisoPreparados, setCompromisoPreparados] = useState(false);
  const [loading, setLoading] = useState(false);
  const { addRole, setActiveRole, roles, loading: rolesLoading } = useUserRoles();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Si ya tiene roles, redirigir directamente (no mostrar selección de rol)
  useEffect(() => {
    if (!rolesLoading && roles.length > 0) {
      // Ya tiene rol asignado - redirigir a su panel
      const primary = roles[0];
      if (primary === 'consumidor') navigate('/consumidor', { replace: true });
      else if (primary === 'agricultor' || primary === 'ganadero') navigate('/agricultor', { replace: true });
      else if (primary === 'elaborador') navigate('/elaborador', { replace: true });
      else if (primary === 'tienda') navigate('/tienda', { replace: true });
      else navigate('/', { replace: true });
    }
  }, [roles, rolesLoading, navigate]);

  const roleOptions: { role: AppRole; label: string; description: string; icon: React.ReactNode }[] = [
    { role: 'consumidor', label: t('roles.consumer'), description: t('roles.consumer_desc'), icon: <ShoppingBag className="w-8 h-8" /> },
    { role: 'agricultor', label: t('roles.farmer'), description: t('roles.farmer_desc'), icon: <Wheat className="w-8 h-8" /> },
    { role: 'elaborador', label: t('roles.producer'), description: t('roles.producer_desc'), icon: <Beaker className="w-8 h-8" /> },
    { role: 'tienda', label: t('roles.shop'), description: t('roles.shop_desc'), icon: <Store className="w-8 h-8" /> },
  ];

  const toggleRole = (role: AppRole) => {
    setSelectedRoles(prev => prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]);
  };

  const handleSubmit = async () => {
    if (selectedRoles.length === 0) return;
    setLoading(true);
    try {
      for (const role of selectedRoles) {
        const { error } = await addRole(role);
        if (error) throw error;
      }
      setActiveRole(selectedRoles[0]);
      toast.success(t('roles.welcome_community'));
      const primary = selectedRoles[0];
      if (primary === 'consumidor') navigate('/consumidor');
      else if (primary === 'agricultor') navigate('/agricultor');
      else if (primary === 'elaborador') navigate('/elaborador');
      else if (primary === 'tienda') navigate('/tienda');
      else navigate('/');
    } catch (error) {
      console.error(error);
    } finally { setLoading(false); }
  };

  // Mostrar loading mientras verificamos roles
  if (rolesLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Verificando...</p>
        </div>
      </div>
    );
  }

  if (!user) { navigate('/auth'); return null; }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute top-4 right-4"><LanguageSwitcher /></div>
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Leaf className="w-8 h-8 text-primary" />
            </div>
          </div>
          <CardTitle className="font-display text-2xl">{t('roles.title')}</CardTitle>
          <CardDescription>{t('roles.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            {roleOptions.map(({ role, label, description, icon }) => (
              <div key={role} onClick={() => toggleRole(role)} className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedRoles.includes(role) ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                <Checkbox checked={selectedRoles.includes(role)} onCheckedChange={() => toggleRole(role)} className="sr-only" />
                <div className={`p-3 rounded-full ${selectedRoles.includes(role) ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>{icon}</div>
                <div className="flex-1">
                  <h3 className="font-semibold">{label}</h3>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedRoles.includes(role) ? 'border-primary bg-primary' : 'border-muted-foreground'}`}>
                  {selectedRoles.includes(role) && <svg className="w-4 h-4 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                </div>
              </div>
            ))}
          </div>

          {selectedRoles.includes('agricultor') && (
            <div className="rounded-lg border-2 border-amber-300 bg-amber-50 p-4 space-y-3 animate-fade-in">
              <h4 className="font-semibold text-amber-900 flex items-center gap-2">
                🌱 {t('roles.compromiso_title')}
              </h4>
              <div className="flex items-start gap-3">
                <Checkbox
                  id="compromiso_preparados"
                  checked={compromisoPreparados}
                  onCheckedChange={(checked) => setCompromisoPreparados(checked === true)}
                  className="mt-0.5"
                />
                <label htmlFor="compromiso_preparados" className="text-sm text-amber-800 leading-relaxed cursor-pointer">
                  {t('roles.compromiso_text')}
                </label>
              </div>
            </div>
          )}

          <Button onClick={handleSubmit} variant="earth" size="xl" className="w-full" disabled={loading || selectedRoles.length === 0 || (selectedRoles.includes('agricultor') && !compromisoPreparados)}>
            {loading ? <span className="flex items-center gap-2"><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /></span> : t('roles.continue')}
          </Button>
          <p className="text-center text-xs text-muted-foreground">{t('roles.change_later')}</p>
        </CardContent>
      </Card>
    </div>
  );
}
