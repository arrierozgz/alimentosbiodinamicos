import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Leaf, Wheat, ShoppingBag, Beaker } from 'lucide-react';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

const roleOptions: { role: AppRole; label: string; description: string; icon: React.ReactNode }[] = [
  {
    role: 'consumidor',
    label: 'Consumidor',
    description: 'Quiero comprar productos biodinámicos',
    icon: <ShoppingBag className="w-8 h-8" />,
  },
  {
    role: 'agricultor',
    label: 'Agricultor / Ganadero',
    description: 'Cultivo o crío con prácticas biodinámicas',
    icon: <Wheat className="w-8 h-8" />,
  },
  {
    role: 'elaborador',
    label: 'Elaborador / Productor',
    description: 'Elaboro preparados biodinámicos',
    icon: <Beaker className="w-8 h-8" />,
  },
];

export default function RoleSelection() {
  const [selectedRoles, setSelectedRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(false);
  const { addRole, setActiveRole } = useUserRoles();
  const { user } = useAuth();
  const navigate = useNavigate();

  const toggleRole = (role: AppRole) => {
    setSelectedRoles(prev =>
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  };

  const handleSubmit = async () => {
    if (selectedRoles.length === 0) {
      toast.error('Selecciona al menos un rol');
      return;
    }

    setLoading(true);
    try {
      for (const role of selectedRoles) {
        const { error } = await addRole(role);
        if (error) throw error;
      }
      
      // Set the first selected role as active
      setActiveRole(selectedRoles[0]);
      toast.success('¡Bienvenido a la comunidad!');
      
      // Navigate based on role
      if (selectedRoles.includes('agricultor') || selectedRoles.includes('ganadero' as AppRole)) {
        navigate('/agricultor');
      } else {
        navigate('/');
      }
    } catch (error) {
      toast.error('Error al guardar los roles');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Leaf className="w-8 h-8 text-primary" />
            </div>
          </div>
          <CardTitle className="font-display text-2xl">
            ¿Cómo participarás en la comunidad?
          </CardTitle>
          <CardDescription>
            Puedes seleccionar varios roles. Podrás cambiarlos en cualquier momento.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            {roleOptions.map(({ role, label, description, icon }) => (
              <div
                key={role}
                onClick={() => toggleRole(role)}
                className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedRoles.includes(role)
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <Checkbox
                  checked={selectedRoles.includes(role)}
                  onCheckedChange={() => toggleRole(role)}
                  className="sr-only"
                />
                <div className={`p-3 rounded-full ${
                  selectedRoles.includes(role) ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}>
                  {icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{label}</h3>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  selectedRoles.includes(role)
                    ? 'border-primary bg-primary'
                    : 'border-muted-foreground'
                }`}>
                  {selectedRoles.includes(role) && (
                    <svg className="w-4 h-4 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
            ))}
          </div>

          <Button
            onClick={handleSubmit}
            variant="earth"
            size="xl"
            className="w-full"
            disabled={loading || selectedRoles.length === 0}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Guardando...
              </span>
            ) : (
              'Continuar'
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Podrás añadir o cambiar roles desde tu perfil en cualquier momento.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
