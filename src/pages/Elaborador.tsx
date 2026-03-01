import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Beaker, Plus, Loader2, LogOut, Save, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { ExportDataButton } from '@/components/ExportDataButton';
import type { Database } from '@/integrations/supabase/types';

type PreparationType = Database['public']['Enums']['preparation_type'];

const PREPARADOS: { value: PreparationType; label: string; emoji: string }[] = [
  { value: '500', label: 'Preparado 500 — Cuerno de estiércol', emoji: '🐄' },
  { value: '501', label: 'Preparado 501 — Cuerno de sílice', emoji: '✨' },
  { value: '502', label: 'Preparado 502 — Milenrama', emoji: '🌿' },
  { value: '503', label: 'Preparado 503 — Manzanilla', emoji: '🌼' },
  { value: '504', label: 'Preparado 504 — Ortiga', emoji: '🌱' },
  { value: '505', label: 'Preparado 505 — Corteza de roble', emoji: '🌳' },
  { value: '506', label: 'Preparado 506 — Diente de león', emoji: '🌻' },
  { value: '507', label: 'Preparado 507 — Valeriana', emoji: '💜' },
  { value: '508', label: 'Preparado 508 — Cola de caballo', emoji: '🌿' },
  { value: 'maria_thun', label: 'María Thun — Preparado compuesto', emoji: '⭐' },
];

interface Preparation {
  id: string;
  preparation: PreparationType;
  price: number | null;
  unit: string | null;
  is_active: boolean;
}

export default function Elaborador() {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [preparations, setPreparations] = useState<Preparation[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newPrep, setNewPrep] = useState<PreparationType | ''>('');

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) fetchPreparations();
  }, [user]);

  const fetchPreparations = async () => {
    try {
      const { data, error } = await supabase
        .from('biodynamic_preparations')
        .select('*')
        .eq('user_id', user!.id)
        .order('preparation');

      if (error) throw error;
      setPreparations(data || []);
    } catch (error) {
      console.error('Error fetching preparations:', error);
      toast.error('Error al cargar preparados');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newPrep || !user) return;

    // Check if already exists
    if (preparations.some((p) => p.preparation === newPrep)) {
      toast.error('Ya tienes este preparado');
      return;
    }

    setAdding(true);
    try {
      const { error } = await supabase.from('biodynamic_preparations').insert({
        user_id: user.id,
        preparation: newPrep,
      });

      if (error) throw error;
      toast.success('Preparado añadido');
      setNewPrep('');
      fetchPreparations();
    } catch (error) {
      console.error('Error adding preparation:', error);
      toast.error('Error al añadir');
    } finally {
      setAdding(false);
    }
  };

  const handleUpdate = async (id: string, updates: Partial<Preparation>) => {
    try {
      const { error } = await supabase
        .from('biodynamic_preparations')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      setPreparations(preparations.map((p) => (p.id === id ? { ...p, ...updates } : p)));
      toast.success('Actualizado');
    } catch (error) {
      console.error('Error updating:', error);
      toast.error('Error al actualizar');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('biodynamic_preparations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setPreparations(preparations.filter((p) => p.id !== id));
      toast.success('Preparado eliminado');
    } catch (error) {
      console.error('Error deleting:', error);
      toast.error('Error al eliminar');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Available preparations not yet added
  const availablePreps = PREPARADOS.filter(
    (p) => !preparations.some((existing) => existing.preparation === p.value)
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-leaf/10 rounded-full flex items-center justify-center">
              <Beaker className="w-5 h-5 text-leaf" />
            </div>
            <div>
              <h1 className="font-display text-lg font-semibold">Mis Preparados</h1>
              <p className="text-xs text-muted-foreground">Gestiona tus preparados biodinámicos</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ExportDataButton variant="compact" />
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Add preparation */}
        {availablePreps.length > 0 && (
          <div className="flex gap-3 mb-6">
            <Select value={newPrep} onValueChange={(v) => setNewPrep(v as PreparationType)}>
              <SelectTrigger className="h-14 text-base flex-1">
                <SelectValue placeholder="Seleccionar preparado..." />
              </SelectTrigger>
              <SelectContent>
                {availablePreps.map((p) => (
                  <SelectItem key={p.value} value={p.value} className="text-base py-3">
                    {p.emoji} {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="earth"
              className="h-14 px-6 text-base"
              onClick={handleAdd}
              disabled={!newPrep || adding}
            >
              {adding ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
              Añadir
            </Button>
          </div>
        )}

        {/* Preparations list */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : preparations.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Beaker className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="font-display text-xl font-semibold text-foreground mb-2">
              Sin preparados aún
            </h3>
            <p className="text-muted-foreground">
              Añade los preparados biodinámicos que elaboras
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {preparations.map((prep) => {
              const info = PREPARADOS.find((p) => p.value === prep.preparation);
              return (
                <Card key={prep.id} className="p-5">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-2xl">{info?.emoji || '🌿'}</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{info?.label || prep.preparation}</h3>
                    </div>
                    <div className="flex flex-col items-center">
                      <Switch
                        checked={prep.is_active}
                        onCheckedChange={(checked) => handleUpdate(prep.id, { is_active: checked })}
                        className="scale-125"
                      />
                      <span className={`text-xs mt-1 font-medium ${prep.is_active ? 'text-primary' : 'text-muted-foreground'}`}>
                        {prep.is_active ? 'Activo' : 'Pausa'}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3 items-end">
                    <div className="flex-1">
                      <label className="text-sm font-medium text-muted-foreground">Precio</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={prep.price ?? ''}
                        onChange={(e) =>
                          setPreparations(
                            preparations.map((p) =>
                              p.id === prep.id ? { ...p, price: e.target.value ? parseFloat(e.target.value) : null } : p
                            )
                          )
                        }
                        placeholder="0.00"
                        className="h-12 text-lg"
                      />
                    </div>
                    <div className="w-32">
                      <label className="text-sm font-medium text-muted-foreground">Unidad</label>
                      <Input
                        value={prep.unit ?? ''}
                        onChange={(e) =>
                          setPreparations(
                            preparations.map((p) =>
                              p.id === prep.id ? { ...p, unit: e.target.value } : p
                            )
                          )
                        }
                        placeholder="unidad"
                        className="h-12 text-lg"
                      />
                    </div>
                    <Button
                      variant="earth"
                      className="h-12"
                      onClick={() =>
                        handleUpdate(prep.id, {
                          price: prep.price,
                          unit: prep.unit,
                        })
                      }
                    >
                      <Save className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      className="h-12 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(prep.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
