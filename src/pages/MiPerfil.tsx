import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRoles } from '@/hooks/useUserRoles';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { User, Save, Loader2, Check, MapPin, Globe, Mail, Phone, AlertTriangle, Trash2, Wheat, ShoppingBag, Beaker, Store } from 'lucide-react';
import { toast } from 'sonner';

interface FarmerProfile {
  id?: string;
  farm_name: string;
  presentation: string;
  approximate_location: string;
  postal_code: string;
  contact_web: string;
  is_public: boolean;
}

interface ContactDetails {
  contact_email: string;
  contact_phone: string;
}

export default function MiPerfil() {
  const { user, loading: authLoading } = useAuth();
  const { roles, addRole, removeRole } = useUserRoles();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState('');

  const [profile, setProfile] = useState<FarmerProfile>({
    farm_name: '',
    presentation: '',
    approximate_location: '',
    postal_code: '',
    contact_web: '',
    is_public: true,
  });

  const [contact, setContact] = useState<ContactDetails>({
    contact_email: '',
    contact_phone: '',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      // Fetch farmer profile
      const { data: profileData } = await supabase
        .from('farmer_profiles')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (profileData) {
        setProfile({
          id: profileData.id,
          farm_name: profileData.farm_name || '',
          presentation: profileData.presentation || '',
          approximate_location: profileData.approximate_location || '',
          postal_code: profileData.postal_code || '',
          contact_web: profileData.contact_web || '',
          is_public: profileData.is_public ?? true,
        });
      }

      // Fetch contact details
      const { data: contactData } = await supabase
        .from('farmer_contact_details')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (contactData) {
        setContact({
          contact_email: contactData.contact_email || '',
          contact_phone: contactData.contact_phone || '',
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    const errors: string[] = [];
    if (!profile.farm_name.trim()) errors.push('Nombre de la finca es obligatorio');
    if (profile.postal_code && !/^\d{5}$/.test(profile.postal_code)) errors.push('Código postal debe tener 5 dígitos');
    if (profile.contact_web && !profile.contact_web.startsWith('http')) errors.push('La web debe empezar con http:// o https://');
    if (contact.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.contact_email)) errors.push('Email de contacto no válido');
    
    if (errors.length > 0) {
      errors.forEach(e => toast.error(e));
      return;
    }

    setSaving(true);
    try {
      // Upsert farmer profile
      if (profile.id) {
        const { error } = await supabase
          .from('farmer_profiles')
          .update({
            farm_name: profile.farm_name,
            presentation: profile.presentation || null,
            approximate_location: profile.approximate_location || null,
            postal_code: profile.postal_code || null,
            contact_web: profile.contact_web || null,
            is_public: profile.is_public,
          })
          .eq('id', profile.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('farmer_profiles')
          .insert({
            user_id: user.id,
            farm_name: profile.farm_name,
            presentation: profile.presentation || null,
            approximate_location: profile.approximate_location || null,
            postal_code: profile.postal_code || null,
            contact_web: profile.contact_web || null,
            is_public: profile.is_public,
          });
        if (error) throw error;
      }

      // Upsert contact details
      const { error: contactError } = await supabase
        .from('farmer_contact_details')
        .upsert({
          user_id: user.id,
          contact_email: contact.contact_email || null,
          contact_phone: contact.contact_phone || null,
        }, { onConflict: 'user_id' });
      
      if (contactError) throw contactError;

      setSaved(true);
      toast.success('¡Perfil guardado!');
      setTimeout(() => setSaved(false), 2000);
      
      // Refetch to get the id if it was an insert
      fetchProfile();
    } catch (error: any) {
      console.error('Error saving profile:', error);
      const msg = error?.message || error?.details || 'Error desconocido';
      toast.error(`Error al guardar el perfil: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    if (confirmDelete !== 'ELIMINAR MI CUENTA') {
      toast.error('Escribe exactamente "ELIMINAR MI CUENTA"');
      return;
    }

    setDeleting(true);
    try {
      const userId = user.id;

      // Delete all user data in order:
      // 1. Products and their variations
      const { data: products } = await supabase.from('products').select('id').eq('user_id', userId);
      if (products?.length) {
        const productIds = products.map(p => p.id);
        await supabase.from('product_variations').delete().in('product_id', productIds);
      }
      await supabase.from('products').delete().eq('user_id', userId);

      // 2. Farmer profile
      await supabase.from('farmer_profiles').delete().eq('user_id', userId);

      // 3. Contact details
      await supabase.from('farmer_contact_details').delete().eq('user_id', userId);

      // 4. Biodynamic preparations
      await supabase.from('biodynamic_preparations').delete().eq('user_id', userId);

      // 5. User roles
      await supabase.from('user_roles').delete().eq('user_id', userId);

      // 6. Messages sent/received
      await supabase.from('messages').delete().or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);

      // 7. Delete from auth
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);
      if (authError) {
        console.log('Auth delete note:', authError);
        // Continue anyway - user data is already deleted
      }

      toast.success('Tu cuenta ha sido eliminada completamente');
      
      // Sign out and redirect
      await supabase.auth.signOut();
      navigate('/');
      
    } catch (error: any) {
      console.error('Error deleting account:', error);
      toast.error('Error al eliminar cuenta. Contacta al administrador.');
    } finally {
      setDeleting(false);
      setConfirmDelete('');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-8">
        <div className="container max-w-2xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-full bg-gradient-earth flex items-center justify-center">
              <User className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-semibold">Mi Perfil</h1>
              <p className="text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          {/* Public profile */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="font-display text-xl">Datos públicos</CardTitle>
              <p className="text-sm text-muted-foreground">
                Esta información será visible para otros usuarios en el listín.
              </p>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="farm_name" className="text-base font-medium">
                  Nombre de la finca / negocio *
                </Label>
                <Input
                  id="farm_name"
                  value={profile.farm_name}
                  onChange={(e) => setProfile({ ...profile, farm_name: e.target.value })}
                  placeholder="Ej: Finca La Biodinámica"
                  className="h-14 text-lg"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="presentation" className="text-base font-medium">
                  Presentación
                </Label>
                <Textarea
                  id="presentation"
                  value={profile.presentation}
                  onChange={(e) => setProfile({ ...profile, presentation: e.target.value })}
                  placeholder="Cuéntanos sobre ti y tu forma de cultivar..."
                  className="text-base min-h-[120px]"
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  Esto es lo que verán los consumidores cuando te encuentren.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-base font-medium flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Ubicación aproximada
                  </Label>
                  <Input
                    id="location"
                    value={profile.approximate_location}
                    onChange={(e) => setProfile({ ...profile, approximate_location: e.target.value })}
                    placeholder="Ej: Calatayud, Zaragoza"
                    className="h-14 text-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postal_code" className="text-base font-medium">
                    Código postal
                  </Label>
                  <Input
                    id="postal_code"
                    value={profile.postal_code}
                    onChange={(e) => setProfile({ ...profile, postal_code: e.target.value })}
                    placeholder="Ej: 50300"
                    className="h-14 text-lg"
                    maxLength={5}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="web" className="text-base font-medium flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Web o red social (opcional)
                </Label>
                <Input
                  id="web"
                  value={profile.contact_web}
                  onChange={(e) => setProfile({ ...profile, contact_web: e.target.value })}
                  placeholder="https://..."
                  className="h-14 text-lg"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium">Perfil público</p>
                  <p className="text-sm text-muted-foreground">
                    Visible para otros usuarios en el listín
                  </p>
                </div>
                <Switch
                  checked={profile.is_public}
                  onCheckedChange={(checked) => setProfile({ ...profile, is_public: checked })}
                  className="scale-125"
                />
              </div>
            </CardContent>
          </Card>

          {/* Private contact */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="font-display text-xl flex items-center gap-2">
                🔒 Datos de contacto privados
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Solo tú puedes ver estos datos. No se comparten con nadie.
              </p>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="contact_email" className="text-base font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email de contacto
                </Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={contact.contact_email}
                  onChange={(e) => setContact({ ...contact, contact_email: e.target.value })}
                  placeholder="tu@email.com"
                  className="h-14 text-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_phone" className="text-base font-medium flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Teléfono
                </Label>
                <Input
                  id="contact_phone"
                  type="tel"
                  value={contact.contact_phone}
                  onChange={(e) => setContact({ ...contact, contact_phone: e.target.value })}
                  placeholder="600 000 000"
                  className="h-14 text-lg"
                />
              </div>
            </CardContent>
          </Card>

          {/* Roles */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="font-display text-xl">Mis roles</CardTitle>
              <p className="text-sm text-muted-foreground">
                Puedes cambiar tus roles en cualquier momento.
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {([
                  { role: 'consumidor' as const, label: 'Consumidor', desc: 'Busco alimentos conscientes', icon: <ShoppingBag className="w-5 h-5" /> },
                  { role: 'agricultor' as const, label: 'Agricultor / Ganadero', desc: 'Produzco alimentos', icon: <Wheat className="w-5 h-5" /> },
                  { role: 'elaborador' as const, label: 'Elaborador', desc: 'Transformo materias primas', icon: <Beaker className="w-5 h-5" /> },
                  { role: 'tienda' as const, label: 'Tienda', desc: 'Vendo productos conscientes', icon: <Store className="w-5 h-5" /> },
                ]).map(({ role, label, desc, icon }) => {
                  const active = roles.includes(role);
                  return (
                    <div
                      key={role}
                      onClick={async () => {
                        if (active) {
                          if (roles.length <= 1) {
                            toast.error('Necesitas al menos un rol');
                            return;
                          }
                          const { error } = await removeRole(role);
                          if (error) toast.error('Error al quitar rol');
                          else toast.success(`Rol "${label}" eliminado`);
                        } else {
                          const { error } = await addRole(role);
                          if (error) toast.error('Error al añadir rol');
                          else toast.success(`Rol "${label}" añadido`);
                        }
                      }}
                      className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        active ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'
                      }`}
                    >
                      <div className={`p-2 rounded-full ${active ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                        {icon}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{label}</div>
                        <div className="text-xs text-muted-foreground">{desc}</div>
                      </div>
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        active ? 'border-primary bg-primary' : 'border-muted-foreground'
                      }`}>
                        {active && <Check className="w-3 h-3 text-primary-foreground" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Save button - BIG */}
          <Button
            variant="earth"
            size="xl"
            className="w-full h-16 text-lg"
            onClick={handleSave}
            disabled={saving || !profile.farm_name.trim()}
          >
            {saving ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : saved ? (
              <>
                <Check className="w-6 h-6" />
                ¡Guardado!
              </>
            ) : (
              <>
                <Save className="w-6 h-6" />
                Guardar perfil
              </>
            )}
          </Button>

          {/* Danger Zone - Delete Account */}
          <Card className="mt-8 border-red-300 bg-red-50 dark:bg-red-950/20">
            <CardHeader>
              <CardTitle className="font-display text-xl flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                Zona de peligro
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Esta acción es irreversible. Se eliminará TODO tu perfil, productos, mensajes y datos.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="confirm_delete" className="text-base font-medium">
                  Escribe <span className="font-mono bg-red-100 px-1 rounded">ELIMINAR MI CUENTA</span> para confirmar
                </Label>
                <Input
                  id="confirm_delete"
                  value={confirmDelete}
                  onChange={(e) => setConfirmDelete(e.target.value)}
                  placeholder="Escribe el texto de confirmación"
                  className="h-12 font-mono"
                  disabled={deleting}
                />
              </div>
              
              <Button
                variant="destructive"
                size="lg"
                className="w-full"
                onClick={handleDeleteAccount}
                disabled={deleting || confirmDelete !== 'ELIMINAR MI CUENTA'}
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Eliminando cuenta...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-5 h-5 mr-2" />
                    Eliminar mi cuenta permanentemente
                  </>
                )}
              </Button>
              
              <p className="text-xs text-center text-muted-foreground">
                Al eliminar tu cuenta, todos tus datos serán borrados de forma permanente y no podrás recuperarlos.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
