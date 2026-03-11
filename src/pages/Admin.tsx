import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRoles } from '@/hooks/useUserRoles';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  Users, Trash2, Search, Loader2,
  MapPin, Mail, Phone, Eye, EyeOff,
  Shield, ShieldPlus, ShieldMinus
} from 'lucide-react';
import { toast } from 'sonner';

interface Farmer {
  id: string;
  user_id: string;
  farm_name: string;
  presentation: string;
  approximate_location: string;
  postal_code: string;
  is_public: boolean;
}

interface UserRow {
  id: string;
  email: string;
  created_at: string;
}

export default function Admin() {
  const { user, loading: authLoading } = useAuth();
  const { hasRole } = useUserRoles();
  const navigate = useNavigate();

  const [tab, setTab] = useState<'farmers' | 'users'>('farmers');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  // Farmers data
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [contacts, setContacts] = useState<Record<string, { contact_email?: string; contact_phone?: string }>>({});
  const [emailMap, setEmailMap] = useState<Record<string, string>>({});

  // Users data
  const [allUsers, setAllUsers] = useState<UserRow[]>([]);
  const [roleMap, setRoleMap] = useState<Record<string, string[]>>({});

  const isAdmin = hasRole('admin');

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
    if (!authLoading && user && !isAdmin) navigate('/');
  }, [user, authLoading, isAdmin]);

  useEffect(() => {
    if (user && isAdmin) {
      if (tab === 'farmers') loadFarmers();
      else loadUsers();
    }
  }, [user, isAdmin, tab]);

  /* ── Farmers ── */
  const loadFarmers = async () => {
    setLoading(true);
    try {
      const [{ data: profiles }, { data: cDetails }, { data: usrs }] = await Promise.all([
        supabase.from('farmer_profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('farmer_contact_details').select('*'),
        supabase.from('users').select('id, email'),
      ]);

      const cm: typeof contacts = {};
      cDetails?.forEach(c => { cm[c.user_id] = c; });

      const em: Record<string, string> = {};
      usrs?.forEach(u => { em[u.id] = u.email; });

      setFarmers(profiles || []);
      setContacts(cm);
      setEmailMap(em);
    } catch (e: any) {
      toast.error('Error cargando agricultores');
    } finally {
      setLoading(false);
    }
  };

  const deleteFarmer = async (farmerId: string, userId: string) => {
    if (!confirm('¿Eliminar este agricultor y TODOS sus datos?')) return;
    setDeleting(farmerId);
    try {
      // Delete related data
      const { data: prods } = await supabase.from('products').select('id').eq('user_id', userId);
      if (prods?.length) {
        await supabase.from('product_variations').delete().in('product_id', prods.map(p => p.id));
      }
      await supabase.from('products').delete().eq('user_id', userId);
      await supabase.from('biodynamic_preparations').delete().eq('user_id', userId);
      await supabase.from('farmer_profiles').delete().eq('id', farmerId);
      await supabase.from('farmer_contact_details').delete().eq('user_id', userId);
      await supabase.from('user_roles').delete().eq('user_id', userId);

      toast.success('Agricultor eliminado');
      loadFarmers();
    } catch {
      toast.error('Error al eliminar');
    } finally {
      setDeleting(null);
    }
  };

  const togglePublic = async (id: string, val: boolean) => {
    await supabase.from('farmer_profiles').update({ is_public: val }).eq('id', id);
    setFarmers(prev => prev.map(f => f.id === id ? { ...f, is_public: val } : f));
    toast.success(val ? 'Publicado' : 'Ocultado');
  };

  /* ── Users / Admins ── */
  const loadUsers = async () => {
    setLoading(true);
    try {
      const [{ data: usrs }, { data: roles }] = await Promise.all([
        supabase.from('users').select('id, email, created_at').order('created_at', { ascending: false }),
        supabase.from('user_roles').select('user_id, role'),
      ]);

      const rm: Record<string, string[]> = {};
      roles?.forEach(r => {
        if (!rm[r.user_id]) rm[r.user_id] = [];
        rm[r.user_id].push(r.role);
      });

      setAllUsers(usrs || []);
      setRoleMap(rm);
    } catch {
      toast.error('Error cargando usuarios');
    } finally {
      setLoading(false);
    }
  };

  const toggleAdmin = async (userId: string, give: boolean) => {
    if (give) {
      await supabase.from('user_roles').insert({ user_id: userId, role: 'admin' });
    } else {
      await supabase.from('user_roles').delete().eq('user_id', userId).eq('role', 'admin');
    }
    toast.success(give ? 'Admin concedido' : 'Admin retirado');
    loadUsers();
  };

  /* ── Filter ── */
  const filtered = farmers.filter(f =>
    f.farm_name.toLowerCase().includes(search.toLowerCase()) ||
    f.approximate_location?.toLowerCase().includes(search.toLowerCase())
  );

  /* ── Render ── */
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
        <div className="container max-w-6xl">

          {/* Title */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h1 className="font-display text-2xl font-semibold">Panel de Administración</h1>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <Button variant={tab === 'farmers' ? 'default' : 'outline'} onClick={() => setTab('farmers')} className="gap-2">
              <Users className="w-4 h-4" /> Agricultores ({farmers.length})
            </Button>
            <Button variant={tab === 'users' ? 'default' : 'outline'} onClick={() => setTab('users')} className="gap-2">
              <Shield className="w-4 h-4" /> Usuarios / Admins
            </Button>
          </div>

          {/* ═══ FARMERS TAB ═══ */}
          {tab === 'farmers' && (
            <div>
              <div className="mb-4 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 h-12" />
              </div>

              <div className="space-y-3">
                {filtered.map(f => {
                  const c = contacts[f.user_id];
                  return (
                    <Card key={f.id} className={f.is_public ? '' : 'opacity-60'}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold truncate">{f.farm_name}</h3>
                              {f.is_public
                                ? <span className="shrink-0 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-1"><Eye className="w-3 h-3" />Público</span>
                                : <span className="shrink-0 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full flex items-center gap-1"><EyeOff className="w-3 h-3" />Oculto</span>
                              }
                            </div>
                            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                              {f.approximate_location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{f.approximate_location} ({f.postal_code})</span>}
                              {c?.contact_email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{c.contact_email}</span>}
                              {c?.contact_phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{c.contact_phone}</span>}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">User: {emailMap[f.user_id] || f.user_id.slice(0, 8)}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Switch checked={f.is_public} onCheckedChange={v => togglePublic(f.id, v)} />
                            <Button variant="destructive" size="sm" onClick={() => deleteFarmer(f.id, f.user_id)} disabled={deleting === f.id}>
                              {deleting === f.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                {filtered.length === 0 && (
                  <p className="text-center py-12 text-muted-foreground">No se encontraron agricultores</p>
                )}
              </div>
            </div>
          )}

          {/* ═══ USERS TAB ═══ */}
          {tab === 'users' && (
            <div className="space-y-3">
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <p className="text-sm"><Shield className="w-4 h-4 inline mr-1" />Desde aquí puedes dar o quitar rol de administrador a cualquier usuario registrado.</p>
              </div>
              {allUsers.map(u => {
                const roles = roleMap[u.id] || [];
                const admin = roles.includes('admin');
                return (
                  <Card key={u.id} className={admin ? 'border-blue-300 bg-blue-50/50' : ''}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{u.email}</p>
                          {admin && <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">Admin</span>}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Roles: {roles.join(', ') || 'ninguno'} · Registro: {new Date(u.created_at).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                      <Button variant={admin ? 'outline' : 'default'} size="sm" onClick={() => toggleAdmin(u.id, !admin)} className="gap-1">
                        {admin ? <><ShieldMinus className="w-4 h-4" />Quitar</> : <><ShieldPlus className="w-4 h-4" />Admin</>}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

        </div>
      </main>
      <Footer />
    </div>
  );
}
