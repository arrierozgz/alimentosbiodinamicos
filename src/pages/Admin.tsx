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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { 
  Users, Trash2, Search, Loader2, Check, X, 
  MapPin, Globe, Mail, Phone, AlertTriangle,
  Package, Edit, Eye, EyeOff
} from 'lucide-react';
import { toast } from 'sonner';

interface FarmerProfile {
  id: string;
  user_id: string;
  farm_name: string;
  presentation: string;
  approximate_location: string;
  postal_code: string;
  contact_web: string;
  is_public: boolean;
  latitude?: number;
  longitude?: number;
  certifications?: string[];
}

interface ContactDetails {
  user_id: string;
  contact_email: string;
  contact_phone: string;
}

interface UserInfo {
  id: string;
  email: string;
  created_at: string;
}

export default function Admin() {
  const { user, loading: authLoading } = useAuth();
  const { roles, hasRole } = useUserRoles();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [farmers, setFarmers] = useState<FarmerProfile[]>([]);
  const [contacts, setContacts] = useState<Record<string, ContactDetails>>({});
  const [users, setUsers] = useState<Record<string, UserInfo>>({});
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  const isAdmin = hasRole('admin');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && !isAdmin) {
      // Check if user is Carlos or Maria
      const adminEmails = ['mcarlosmorales@hotmail.com', 'aragonbiodinamica@gmail.com', 'lumicasalola@gmail.com'];
      if (adminEmails.includes(user.email || '')) {
        // Auto-add admin role
        toast.error('Tienes acceso de admin. Contacta al desarrollador para activar.');
      }
      navigate('/');
    }
  }, [user, isAdmin, navigate]);

  useEffect(() => {
    if (user && isAdmin) {
      fetchFarmers();
    }
  }, [user, isAdmin]);

  const fetchFarmers = async () => {
    setLoading(true);
    try {
      // Fetch all farmer profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('farmer_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch all contacts
      const { data: contactsData, error: contactsError } = await supabase
        .from('farmer_contact_details')
        .select('*');

      if (contactsError) throw contactsError;

      // Fetch all users
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, email, created_at');

      if (usersError) throw usersError;

      // Build contacts map
      const contactsMap: Record<string, ContactDetails> = {};
      contactsData?.forEach(c => {
        contactsMap[c.user_id] = c;
      });

      // Build users map
      const usersMap: Record<string, UserInfo> = {};
      usersData?.forEach(u => {
        usersMap[u.id] = u;
      });

      setFarmers(profiles || []);
      setContacts(contactsMap);
      setUsers(usersMap);
    } catch (error: any) {
      console.error('Error fetching farmers:', error);
      toast.error('Error al cargar agricultores');
    } finally {
      setLoading(false);
    }
  };

  const deleteFarmer = async (id: string, userId: string) => {
    if (!confirm('¿Estás seguro de eliminar este agricultor? Esto también eliminará todos sus productos y datos.')) {
      return;
    }

    setDeleting(id);
    try {
      // Delete in order: products → profiles → contact_details → user_roles → user
      await supabase.from('products').delete().eq('user_id', userId);
      await supabase.from('farmer_profiles').delete().eq('id', id);
      await supabase.from('farmer_contact_details').delete().eq('user_id', userId);
      await supabase.from('user_roles').delete().eq('user_id', userId);
      
      // Delete from auth.users (requires admin privileges)
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);
      if (authError) {
        console.log('Auth delete failed (may need admin):', authError);
        toast.warning('Agricultor borrado pero no se pudo eliminar usuario de auth');
      }

      toast.success('Agricultor eliminado completamente');
      fetchFarmers();
    } catch (error: any) {
      console.error('Error deleting farmer:', error);
      toast.error('Error al eliminar agricultor');
    } finally {
      setDeleting(null);
    }
  };

  const togglePublic = async (id: string, isPublic: boolean) => {
    try {
      await supabase
        .from('farmer_profiles')
        .update({ is_public: isPublic })
        .eq('id', id);
      
      setFarmers(farmers.map(f => 
        f.id === id ? { ...f, is_public: isPublic } : f
      ));
      toast.success(isPublic ? 'Perfil publicado' : 'Perfil ocultado');
    } catch (error) {
      console.error('Error toggling public:', error);
      toast.error('Error al cambiar visibilidad');
    }
  };

  const filteredFarmers = farmers.filter(f => 
    f.farm_name.toLowerCase().includes(search.toLowerCase()) ||
    f.approximate_location?.toLowerCase().includes(search.toLowerCase()) ||
    contacts[f.user_id]?.contact_email?.toLowerCase().includes(search.toLowerCase())
  );

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
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-semibold">Panel de Administración</h1>
              <p className="text-muted-foreground">{filteredFarmers.length} agricultores</p>
            </div>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, ubicación o email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
          </div>

          {/* Farmer List */}
          <div className="space-y-4">
            {filteredFarmers.map(farmer => {
              const contact = contacts[farmer.user_id];
              const userInfo = users[farmer.user_id];
              
              return (
                <Card key={farmer.id} className={farmer.is_public ? '' : 'opacity-60'}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{farmer.farm_name}</h3>
                          {farmer.is_public ? (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-1">
                              <Eye className="w-3 h-3" /> Público
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full flex items-center gap-1">
                              <EyeOff className="w-3 h-3" /> Oculto
                            </span>
                          )}
                        </div>
                        
                        {farmer.presentation && (
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                            {farmer.presentation}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          {farmer.approximate_location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {farmer.approximate_location} ({farmer.postal_code})
                            </span>
                          )}
                          {farmer.contact_web && (
                            <span className="flex items-center gap-1">
                              <Globe className="w-4 h-4" />
                              <a href={farmer.contact_web} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                Web
                              </a>
                            </span>
                          )}
                          {contact?.contact_email && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-4 h-4" />
                              {contact.contact_email}
                            </span>
                          )}
                          {contact?.contact_phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-4 h-4" />
                              {contact.contact_phone}
                            </span>
                          )}
                        </div>

                        <div className="mt-2 text-xs text-muted-foreground">
                          ID: {farmer.id.slice(0,8)}... | User: {userInfo?.email || farmer.user_id.slice(0,8)}...
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Switch
                          checked={farmer.is_public}
                          onCheckedChange={(checked) => togglePublic(farmer.id, checked)}
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteFarmer(farmer.id, farmer.user_id)}
                          disabled={deleting === farmer.id}
                        >
                          {deleting === farmer.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {filteredFarmers.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No se encontraron agricultores</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
