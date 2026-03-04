import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { ProductForm, type ProductFormData } from '@/components/agricultor/ProductForm';
import { Plus, Leaf, LogOut, Loader2, MapPin, Phone, Mail, Globe, Edit, Trash2, Eye, EyeOff, Save } from 'lucide-react';
import { toast } from 'sonner';
import { PRODUCT_CATEGORY_EMOJIS, CERTIFICATION_TYPES } from '@/lib/catalogo';

interface Product {
  id: string;
  name: string;
  photo_url: string | null;
  season: string | null;
  is_active: boolean;
  product_type: string | null;
  certifications: string[];
  variations?: { id: string; variety: string | null; packaging: string | null; net_price: number | null; unit: string | null }[];
}

interface FarmerProfile {
  id?: string;
  farm_name: string;
  approximate_location: string;
  province: string;
  postal_code: string;
  contact_web: string;
  presentation: string;
}

interface ContactDetails {
  contact_email: string;
  contact_phone: string;
}

export default function Agricultor() {
  const { t } = useTranslation();
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const [profile, setProfile] = useState<FarmerProfile>({
    farm_name: '', approximate_location: '', province: '', postal_code: '', contact_web: '', presentation: '',
  });
  const [contact, setContact] = useState<ContactDetails>({ contact_email: '', contact_phone: '' });

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchAll();
    }
  }, [user]);

  const fetchAll = async () => {
    try {
      const { data: prods } = await supabase.from('products').select('*').eq('user_id', user?.id);
      const productIds = (prods || []).map((p: any) => p.id);

      let variations: any[] = [];
      if (productIds.length > 0) {
        const { data: vars } = await supabase.from('product_variations').select('*');
        variations = (vars || []).filter((v: any) => productIds.includes(v.product_id));
      }

      const enriched = (prods || []).map((p: any) => ({
        ...p,
        certifications: p.certifications || [],
        variations: variations.filter((v: any) => v.product_id === p.id),
      }));
      setProducts(enriched);

      const { data: profiles } = await supabase.from('farmer_profiles' as any).select('*').eq('user_id', user?.id);
      if (profiles && profiles.length > 0) {
        const p = profiles[0] as any;
        setProfile({
          id: p.id,
          farm_name: p.farm_name || '',
          approximate_location: p.approximate_location || '',
          province: p.province || '',
          postal_code: p.postal_code || '',
          contact_web: p.contact_web || '',
          presentation: p.presentation || '',
        });
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
    } catch (e) {
      console.error('Error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!profile.farm_name.trim()) {
      toast.error(t('farmer_panel.name_required'));
      return;
    }
    setSavingProfile(true);
    try {
      const profileData = {
        user_id: user?.id,
        farm_name: profile.farm_name,
        approximate_location: profile.approximate_location || null,
        province: profile.province || null,
        postal_code: profile.postal_code || null,
        contact_web: profile.contact_web || null,
        presentation: profile.presentation || null,
        activity_types: ['agricultor'],
        is_public: true,
      };

      if (profile.id) {
        await supabase.from('farmer_profiles' as any).update(profileData).eq('id', profile.id);
      } else {
        const { data } = await supabase.from('farmer_profiles' as any).insert(profileData).select();
        if (data && data.length > 0) setProfile(prev => ({ ...prev, id: (data[0] as any).id }));
      }

      await supabase.from('farmer_contact_details' as any).upsert({
        user_id: user?.id,
        contact_email: contact.contact_email || null,
        contact_phone: contact.contact_phone || null,
      }).select();

      toast.success(t('farmer_panel.profile_saved'));
      setShowProfile(false);
    } catch (e) {
      console.error('Error saving profile:', e);
      toast.error((e as any)?.message || 'Error al guardar perfil');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveProduct = async (data: ProductFormData) => {
    setSaving(true);
    try {
      const productPayload = {
        user_id: user?.id,
        name: data.name,
        product_type: data.product_type || null,
        season: data.season || null,
        photo_url: data.photo_url || null,
        certifications: data.certifications || [],
      };

      let productId: string;

      if (editingProduct?.id) {
        await supabase.from('products').update(productPayload).eq('id', editingProduct.id);
        productId = editingProduct.id;
        await supabase.from('product_variations').delete().eq('product_id', productId);
      } else {
        const { data: inserted } = await supabase.from('products').insert(productPayload).select();
        if (!inserted || inserted.length === 0) throw new Error('Error');
        productId = (inserted[0] as any).id;
      }

      const variations = data.variations
        .filter(v => v.variety || v.packaging || v.net_price)
        .map(v => ({
          product_id: productId,
          variety: v.variety || null,
          packaging: v.packaging || null,
          net_price: v.net_price ? parseFloat(v.net_price) : null,
          unit: v.unit || 'kg',
        }));

      if (variations.length > 0) {
        await supabase.from('product_variations').insert(variations).select();
      }

      toast.success(editingProduct ? t('farmer_panel.product_updated') : t('farmer_panel.product_created'));
      setFormOpen(false);
      setEditingProduct(null);
      fetchAll();
    } catch (e) {
      console.error('Error:', e);
      toast.error('Error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm(t('farmer_panel.confirm_delete_product'))) return;
    try {
      await supabase.from('product_variations').delete().eq('product_id', id);
      await supabase.from('products').delete().eq('id', id);
      setProducts(products.filter(p => p.id !== id));
      toast.success(t('farmer_panel.product_deleted'));
    } catch (e) {
      toast.error('Error');
    }
  };

  const handleToggleActive = async (id: string, active: boolean) => {
    await supabase.from('products').update({ is_active: active }).eq('id', id);
    setProducts(products.map(p => p.id === id ? { ...p, is_active: active } : p));
  };

  const handleEdit = (product: Product) => {
    setEditingProduct({
      id: product.id,
      name: product.name,
      product_type: product.product_type || '',
      season: product.season || '',
      photo_url: product.photo_url || '',
      certifications: product.certifications || [],
      variations: product.variations?.map(v => ({
        id: v.id,
        variety: v.variety || '',
        packaging: v.packaging || '',
        net_price: v.net_price?.toString() || '',
        unit: v.unit || 'kg',
      })) || [],
    });
    setFormOpen(true);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const getCertBadge = (cert: string) => {
    const c = CERTIFICATION_TYPES.find(t => t.value === cert);
    return c ? `${c.emoji} ${c.label}` : cert;
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Leaf className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-lg font-semibold">{profile.farm_name || t('farmer_panel.my_garden')}</h1>
              <p className="text-xs text-muted-foreground">
                {profile.approximate_location && `📍 ${profile.approximate_location}`}
                {profile.province && `, ${profile.province}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowProfile(!showProfile)}>
              <Edit className="w-4 h-4 mr-1" /> {t('farmer_panel.profile_btn')}
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
            <h2 className="font-display text-lg font-semibold mb-4">{t('farmer_panel.profile_title')}</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>{t('farmer_panel.farm_name')} *</Label>
                  <Input
                    value={profile.farm_name}
                    onChange={(e) => setProfile({ ...profile, farm_name: e.target.value })}
                    placeholder={t('farmer_panel.farm_name_placeholder')}
                    className="h-11"
                  />
                </div>
                <div>
                  <Label>{t('farmer_panel.location')}</Label>
                  <Input
                    value={profile.approximate_location}
                    onChange={(e) => setProfile({ ...profile, approximate_location: e.target.value })}
                    placeholder={t('farmer_panel.location_placeholder')}
                    className="h-11"
                  />
                </div>
                <div>
                  <Label>{t('farmer_panel.province')}</Label>
                  <Input
                    value={profile.province}
                    onChange={(e) => setProfile({ ...profile, province: e.target.value })}
                    placeholder={t('farmer_panel.province_placeholder')}
                    className="h-11"
                  />
                </div>
                <div>
                  <Label>{t('farmer_panel.postal_code')}</Label>
                  <Input
                    value={profile.postal_code}
                    onChange={(e) => setProfile({ ...profile, postal_code: e.target.value })}
                    placeholder="50790"
                    className="h-11"
                  />
                </div>
              </div>

              <div>
                <Label>{t('farmer_panel.presentation')} ({t('common.optional')})</Label>
                <Input
                  value={profile.presentation}
                  onChange={(e) => setProfile({ ...profile, presentation: e.target.value })}
                  placeholder={t('farmer_panel.presentation_placeholder')}
                  className="h-11"
                />
              </div>

              <h3 className="font-medium text-sm mt-4 mb-2">{t('farmer_panel.contact_title')}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>{t('farmer_panel.contact_email')}</Label>
                  <Input
                    type="email"
                    value={contact.contact_email}
                    onChange={(e) => setContact({ ...contact, contact_email: e.target.value })}
                    placeholder="tu@email.com"
                    className="h-11"
                  />
                </div>
                <div>
                  <Label>{t('farmer_panel.contact_phone')}</Label>
                  <Input
                    type="tel"
                    value={contact.contact_phone}
                    onChange={(e) => setContact({ ...contact, contact_phone: e.target.value })}
                    placeholder="600 000 000"
                    className="h-11"
                  />
                </div>
              </div>
              <div>
                <Label>{t('farmer_panel.contact_web')} ({t('common.optional')})</Label>
                <Input
                  value={profile.contact_web}
                  onChange={(e) => setProfile({ ...profile, contact_web: e.target.value })}
                  placeholder="www.mifinca.com"
                  className="h-11"
                />
              </div>

              <Button variant="earth" onClick={handleSaveProfile} disabled={savingProfile} className="w-full h-12">
                {savingProfile ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5 mr-2" /> {t('farmer_panel.save_profile')}</>}
              </Button>
            </div>
          </Card>
        )}

        <Button
          variant="earth" size="xl" className="w-full mb-6 h-14 text-lg gap-3"
          onClick={() => { setEditingProduct(null); setFormOpen(true); }}
        >
          <Plus className="w-6 h-6" /> {t('farmer_panel.add_product')}
        </Button>

        {products.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Leaf className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="font-display text-xl font-semibold mb-2">{t('farmer_panel.no_products')}</h3>
            <p className="text-muted-foreground">{t('farmer_panel.add_first')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {products.map((product) => (
              <Card key={product.id} className={`p-4 ${!product.is_active ? 'opacity-50' : ''}`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {product.product_type && PRODUCT_CATEGORY_EMOJIS[product.product_type] && (
                      <span className="text-2xl">{PRODUCT_CATEGORY_EMOJIS[product.product_type]}</span>
                    )}
                    <div>
                      <h3 className="font-semibold">{product.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {product.product_type}
                        {product.season && ` · 🗓️ ${product.season}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleToggleActive(product.id, !product.is_active)}>
                      {product.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(product)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteProduct(product.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {product.certifications?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {product.certifications.map(cert => (
                      <span key={cert} className="text-xs bg-muted rounded-full px-2 py-0.5">{getCertBadge(cert)}</span>
                    ))}
                  </div>
                )}

                {product.variations && product.variations.length > 0 && (
                  <div className="space-y-1 mt-2">
                    {product.variations.map(v => (
                      <div key={v.id} className="flex items-center justify-between text-sm bg-muted/50 rounded px-3 py-1.5">
                        <span>
                          {v.variety && <span>🌱 {v.variety}</span>}
                          {v.variety && v.packaging && <span className="mx-1 text-muted-foreground">·</span>}
                          {v.packaging && <span>📦 {v.packaging}</span>}
                        </span>
                        {v.net_price != null && (
                          <span className="font-semibold text-primary">
                            {v.net_price} €/{v.unit || 'kg'}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </main>

      <ProductForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditingProduct(null); }}
        onSave={handleSaveProduct}
        initialData={editingProduct}
        loading={saving}
      />
    </div>
  );
}
