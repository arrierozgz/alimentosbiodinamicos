import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Beaker, LogOut, Loader2, Plus, Edit, Trash2, Save, X, MapPin, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

const PREPARATIONS = [
  { value: '500', label: '500 — Cuerno de estiércol', emoji: '🐮' },
  { value: '501', label: '501 — Cuerno de sílice', emoji: '💎' },
  { value: '502', label: '502 — Milenrama', emoji: '🌼' },
  { value: '503', label: '503 — Manzanilla', emoji: '🌸' },
  { value: '504', label: '504 — Ortiga', emoji: '🌿' },
  { value: '505', label: '505 — Corteza de roble', emoji: '🌳' },
  { value: '506', label: '506 — Diente de león', emoji: '🌻' },
  { value: '507', label: '507 — Valeriana', emoji: '🪻' },
  { value: '508', label: '508 — Cola de caballo', emoji: '🌾' },
  { value: 'maria_thun', label: 'María Thun — Preparado de compost', emoji: '🧪' },
];

interface Preparation {
  id: string;
  preparation: string;
  price: number | null;
  unit: string | null;
  is_active: boolean;
}

interface ProfileData {
  id?: string;
  farm_name: string;
  approximate_location: string;
  province: string;
  postal_code: string;
  contact_web: string;
  presentation: string;
}

interface ContactData {
  contact_email: string;
  contact_phone: string;
}

export default function Elaborador() {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();

  const [preparations, setPreparations] = useState<Preparation[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<Preparation | null>(null);
  const [saving, setSaving] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const [profile, setProfile] = useState<ProfileData>({
    farm_name: '', approximate_location: '', province: '', postal_code: '', contact_web: '', presentation: '',
  });
  const [contact, setContact] = useState<ContactData>({ contact_email: '', contact_phone: '' });

  // Form state
  const [formPrep, setFormPrep] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formUnit, setFormUnit] = useState('kg');

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) fetchAll();
  }, [user]);

  const fetchAll = async () => {
    try {
      const { data: preps } = await supabase.from('biodynamic_preparations').select('*').eq('user_id', user?.id);
      setPreparations((preps || []) as any);

      const { data: profiles } = await supabase.from('farmer_profiles' as any).select('*').eq('user_id', user?.id);
      if (profiles && profiles.length > 0) {
        const p = profiles[0] as any;
        setProfile({ id: p.id, farm_name: p.farm_name || '', approximate_location: p.approximate_location || '', province: p.province || '', postal_code: p.postal_code || '', contact_web: p.contact_web || '', presentation: p.presentation || '' });
        if (!p.farm_name) setShowProfile(true);
      } else {
        setShowProfile(true);
      }

      const { data: contacts } = await supabase.from('farmer_contact_details' as any).select('*').eq('user_id', user?.id);
      if (contacts && contacts.length > 0) {
        const c = contacts[0] as any;
        setContact({ contact_email: c.contact_email || '', contact_phone: c.contact_phone || '' });
      } else {
        setContact({ contact_email: user?.email || '', contact_phone: '' });
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleSaveProfile = async () => {
    if (!profile.farm_name.trim()) { toast.error('Nombre obligatorio'); return; }
    setSavingProfile(true);
    try {
      const data = {
        user_id: user?.id, farm_name: profile.farm_name, approximate_location: profile.approximate_location || null,
        province: profile.province || null, postal_code: profile.postal_code || null, contact_web: profile.contact_web || null,
        presentation: profile.presentation || null, activity_types: ['elaborador'], is_public: true,
      };
      if (profile.id) {
        await supabase.from('farmer_profiles' as any).update(data).eq('id', profile.id);
      } else {
        const { data: inserted } = await supabase.from('farmer_profiles' as any).insert(data).select();
        if (inserted?.length) setProfile(prev => ({ ...prev, id: (inserted[0] as any).id }));
      }
      await supabase.from('farmer_contact_details' as any).upsert({ user_id: user?.id, contact_email: contact.contact_email || null, contact_phone: contact.contact_phone || null }).select();
      toast.success('Perfil guardado');
      setShowProfile(false);
    } catch (e) { toast.error('Error'); console.error(e); } finally { setSavingProfile(false); }
  };

  const openForm = (item?: Preparation) => {
    if (item) {
      setEditItem(item);
      setFormPrep(item.preparation);
      setFormPrice(item.price?.toString() || '');
      setFormUnit(item.unit || 'kg');
    } else {
      setEditItem(null);
      setFormPrep('');
      setFormPrice('');
      setFormUnit('kg');
    }
    setFormOpen(true);
  };

  const handleSavePrep = async () => {
    if (!formPrep) { toast.error('Selecciona un preparado'); return; }
    setSaving(true);
    try {
      const payload = {
        user_id: user?.id,
        preparation: formPrep,
        price: formPrice ? parseFloat(formPrice) : null,
        unit: formUnit || 'kg',
        is_active: true,
      };
      if (editItem) {
        await supabase.from('biodynamic_preparations').update(payload).eq('id', editItem.id);
      } else {
        await supabase.from('biodynamic_preparations').insert(payload).select();
      }
      toast.success(editItem ? 'Actualizado' : 'Preparado añadido');
      setFormOpen(false);
      fetchAll();
    } catch (e) { toast.error('Error'); console.error(e); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar?')) return;
    await supabase.from('biodynamic_preparations').delete().eq('id', id);
    setPreparations(preparations.filter(p => p.id !== id));
    toast.success('Eliminado');
  };

  const handleToggle = async (id: string, active: boolean) => {
    await supabase.from('biodynamic_preparations').update({ is_active: active }).eq('id', id);
    setPreparations(preparations.map(p => p.id === id ? { ...p, is_active: active } : p));
  };

  const getPrepInfo = (val: string) => PREPARATIONS.find(p => p.value === val);

  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Beaker className="w-5 h-5 text-purple-700" />
            </div>
            <div>
              <h1 className="font-display text-lg font-semibold">{profile.farm_name || 'Mis Preparados'}</h1>
              <p className="text-xs text-muted-foreground">
                {profile.approximate_location && `📍 ${profile.approximate_location}`}
                {profile.province && `, ${profile.province}`}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowProfile(!showProfile)}>
              <Edit className="w-4 h-4 mr-1" /> Perfil
            </Button>
            <Button variant="ghost" size="icon" onClick={async () => { await signOut(); navigate('/'); }}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Profile */}
        {showProfile && (
          <Card className="p-5 mb-6 animate-fade-in">
            <h2 className="font-display text-lg font-semibold mb-4">📋 Mi perfil de elaborador</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><Label>Nombre *</Label><Input value={profile.farm_name} onChange={e => setProfile({ ...profile, farm_name: e.target.value })} placeholder="Nombre o empresa" className="h-11" /></div>
                <div><Label>Localidad</Label><Input value={profile.approximate_location} onChange={e => setProfile({ ...profile, approximate_location: e.target.value })} placeholder="Ej: Almonacid" className="h-11" /></div>
                <div><Label>Provincia</Label><Input value={profile.province} onChange={e => setProfile({ ...profile, province: e.target.value })} placeholder="Zaragoza" className="h-11" /></div>
                <div><Label>CP</Label><Input value={profile.postal_code} onChange={e => setProfile({ ...profile, postal_code: e.target.value })} placeholder="50100" className="h-11" /></div>
              </div>
              <h3 className="font-medium text-sm">📞 Contacto</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><Label>Email</Label><Input type="email" value={contact.contact_email} onChange={e => setContact({ ...contact, contact_email: e.target.value })} className="h-11" /></div>
                <div><Label>Teléfono</Label><Input type="tel" value={contact.contact_phone} onChange={e => setContact({ ...contact, contact_phone: e.target.value })} placeholder="600 000 000" className="h-11" /></div>
              </div>
              <Button variant="earth" onClick={handleSaveProfile} disabled={savingProfile} className="w-full h-12">
                {savingProfile ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5 mr-2" /> Guardar</>}
              </Button>
            </div>
          </Card>
        )}

        {/* Add */}
        <Button variant="earth" size="xl" className="w-full mb-6 h-14 text-lg gap-3" onClick={() => openForm()}>
          <Plus className="w-6 h-6" /> Añadir Preparado
        </Button>

        {/* List */}
        {preparations.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Beaker className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="font-display text-xl font-semibold mb-2">Sin preparados</h3>
            <p className="text-muted-foreground">Añade los preparados que elaboras</p>
          </div>
        ) : (
          <div className="space-y-3">
            {preparations.map(prep => {
              const info = getPrepInfo(prep.preparation);
              return (
                <Card key={prep.id} className={`p-4 ${!prep.is_active ? 'opacity-50' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{info?.emoji || '🧪'}</span>
                      <div>
                        <h3 className="font-semibold">{info?.label || prep.preparation}</h3>
                        {prep.price != null && (
                          <p className="text-sm text-primary font-medium">{prep.price} €/{prep.unit || 'kg'}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleToggle(prep.id, !prep.is_active)}>
                        {prep.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openForm(prep)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(prep.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      {/* Form dialog */}
      <Dialog open={formOpen} onOpenChange={o => !o && setFormOpen(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Beaker className="w-5 h-5 text-purple-700" />
              {editItem ? 'Editar Preparado' : 'Nuevo Preparado'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label>Preparado *</Label>
              <Select value={formPrep} onValueChange={setFormPrep}>
                <SelectTrigger className="h-12"><SelectValue placeholder="Selecciona preparado" /></SelectTrigger>
                <SelectContent>
                  {PREPARATIONS.map(p => (
                    <SelectItem key={p.value} value={p.value}>{p.emoji} {p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Precio €</Label>
                <Input type="number" step="0.01" min="0" value={formPrice} onChange={e => setFormPrice(e.target.value)} placeholder="Ej: 15.00" className="h-12" />
              </div>
              <div>
                <Label>Unidad de venta</Label>
                <Select value={formUnit} onValueChange={setFormUnit}>
                  <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">por kg</SelectItem>
                    <SelectItem value="g">por g</SelectItem>
                    <SelectItem value="litro">por litro</SelectItem>
                    <SelectItem value="unidad">por unidad</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1 h-12" onClick={() => setFormOpen(false)}>
                <X className="w-5 h-5 mr-2" /> Cancelar
              </Button>
              <Button variant="earth" className="flex-1 h-12" onClick={handleSavePrep} disabled={saving || !formPrep}>
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5 mr-2" /> Guardar</>}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
