import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
    if (!profile.farm_name.trim()) { toast.error(t('elaborador.name_required')); return; }
    setSavingProfile(true);
    try {
      // Auto-geocode
      let latitude: number | null = null;
      let longitude: number | null = null;
      if (profile.approximate_location || profile.postal_code) {
        try {
          const q = [profile.approximate_location, profile.postal_code, profile.province, 'Spain'].filter(Boolean).join(', ');
          const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`, {
            headers: { 'User-Agent': 'AlimentosConscientes/1.0' }
          });
          const geo = await res.json();
          if (geo.length > 0) { latitude = parseFloat(geo[0].lat); longitude = parseFloat(geo[0].lon); }
        } catch (e) { console.warn('Geocoding failed:', e); }
      }
      const data = {
        user_id: user?.id, farm_name: profile.farm_name, approximate_location: profile.approximate_location || null,
        province: profile.province || null, postal_code: profile.postal_code || null, contact_web: profile.contact_web || null,
        presentation: profile.presentation || null, activity_types: ['elaborador'], is_public: true,
        ...(latitude && longitude ? { latitude, longitude } : {}),
      };
      if (profile.id) {
        await supabase.from('farmer_profiles' as any).update(data).eq('id', profile.id);
      } else {
        const { data: inserted } = await supabase.from('farmer_profiles' as any).insert(data).select();
        if (inserted?.length) setProfile(prev => ({ ...prev, id: (inserted[0] as any).id }));
      }
      await supabase.from('farmer_contact_details' as any).upsert({ user_id: user?.id, contact_email: contact.contact_email || null, contact_phone: contact.contact_phone || null }).select();
      toast.success(t('elaborador.profile_saved'));
      setShowProfile(false);
    } catch (e: any) { toast.error(e?.message || t('elaborador.error_save')); console.error('Profile save error:', e); } finally { setSavingProfile(false); }
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
    if (!formPrep) { toast.error(t('elaborador.select_required')); return; }
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
      toast.success(editItem ? t('elaborador.updated') : t('elaborador.added'));
      setFormOpen(false);
      fetchAll();
    } catch (e) { toast.error('Error'); console.error(e); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('elaborador.confirm_delete'))) return;
    await supabase.from('biodynamic_preparations').delete().eq('id', id);
    setPreparations(preparations.filter(p => p.id !== id));
    toast.success(t('elaborador.deleted'));
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
              <h1 className="font-display text-lg font-semibold">{profile.farm_name || t('elaborador.my_preparations')}</h1>
              <p className="text-xs text-muted-foreground">
                {profile.approximate_location && `📍 ${profile.approximate_location}`}
                {profile.province && `, ${profile.province}`}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowProfile(!showProfile)}>
              <Edit className="w-4 h-4 mr-1" /> {t('elaborador.profile_btn')}
            </Button>
            <Button variant="ghost" size="icon" onClick={async () => { await signOut(); navigate('/'); }}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        {showProfile && (
          <Card className="p-5 mb-6 animate-fade-in">
            <h2 className="font-display text-lg font-semibold mb-4">{t('elaborador.profile_title')}</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><Label>{t('farmer_panel.farm_name')} *</Label><Input value={profile.farm_name} onChange={e => setProfile({ ...profile, farm_name: e.target.value })} placeholder={t('farmer_panel.farm_name_placeholder')} className="h-11" /></div>
                <div><Label>{t('farmer_panel.location')}</Label><Input value={profile.approximate_location} onChange={e => setProfile({ ...profile, approximate_location: e.target.value })} placeholder={t('farmer_panel.location_placeholder')} className="h-11" /></div>
                <div><Label>{t('farmer_panel.province')}</Label><Input value={profile.province} onChange={e => setProfile({ ...profile, province: e.target.value })} placeholder={t('farmer_panel.province_placeholder')} className="h-11" /></div>
                <div><Label>{t('farmer_panel.postal_code')}</Label><Input value={profile.postal_code} onChange={e => setProfile({ ...profile, postal_code: e.target.value })} placeholder="50100" className="h-11" /></div>
              </div>
              <h3 className="font-medium text-sm">{t('farmer_panel.contact_title')}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><Label>{t('farmer_panel.contact_email')}</Label><Input type="email" value={contact.contact_email} onChange={e => setContact({ ...contact, contact_email: e.target.value })} className="h-11" /></div>
                <div><Label>{t('farmer_panel.contact_phone')}</Label><Input type="tel" value={contact.contact_phone} onChange={e => setContact({ ...contact, contact_phone: e.target.value })} placeholder="600 000 000" className="h-11" /></div>
              </div>
              <Button variant="earth" onClick={handleSaveProfile} disabled={savingProfile} className="w-full h-12">
                {savingProfile ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5 mr-2" /> {t('common.save')}</>}
              </Button>
            </div>
          </Card>
        )}

        <Button variant="earth" size="xl" className="w-full mb-6 h-14 text-lg gap-3" onClick={() => openForm()}>
          <Plus className="w-6 h-6" /> {t('elaborador.add_preparation')}
        </Button>

        {preparations.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Beaker className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="font-display text-xl font-semibold mb-2">{t('elaborador.no_preparations')}</h3>
            <p className="text-muted-foreground">{t('elaborador.add_first')}</p>
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

      <Dialog open={formOpen} onOpenChange={o => !o && setFormOpen(false)}>
        <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()} onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Beaker className="w-5 h-5 text-purple-700" />
              {editItem ? t('elaborador.edit_preparation') : t('elaborador.new_preparation')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label>{t('elaborador.select_preparation')} *</Label>
              <Select value={formPrep} onValueChange={setFormPrep}>
                <SelectTrigger className="h-12"><SelectValue placeholder={t('elaborador.select_preparation')} /></SelectTrigger>
                <SelectContent>
                  {PREPARATIONS.map(p => (
                    <SelectItem key={p.value} value={p.value}>{p.emoji} {p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t('elaborador.price')}</Label>
                <Input type="number" step="0.01" min="0" value={formPrice} onChange={e => setFormPrice(e.target.value)} placeholder="15.00" className="h-12" />
              </div>
              <div>
                <Label>{t('elaborador.sale_unit')}</Label>
                <Select value={formUnit} onValueChange={setFormUnit}>
                  <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">{t('product_form.per_kg')}</SelectItem>
                    <SelectItem value="g">{t('product_form.per_g')}</SelectItem>
                    <SelectItem value="litro">{t('product_form.per_liter')}</SelectItem>
                    <SelectItem value="unidad">{t('product_form.per_unit')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1 h-12" onClick={() => setFormOpen(false)}>
                <X className="w-5 h-5 mr-2" /> {t('common.cancel')}
              </Button>
              <Button variant="earth" className="flex-1 h-12" onClick={handleSavePrep} disabled={saving || !formPrep}>
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5 mr-2" /> {t('common.save')}</>}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
