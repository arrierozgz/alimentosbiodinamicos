import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft, Leaf, MapPin, Mail, Phone, Globe, Package,
  Award, MessageCircle, User, ChevronLeft, ChevronRight, Loader2,
} from 'lucide-react';
import {
  PRODUCT_CATEGORY_EMOJIS,
  CERTIFICATION_TYPES,
} from '@/lib/catalogo';

interface PhotoItem {
  url: string;
  thumb: string;
}

interface ProductVariation {
  id: string;
  variety: string | null;
  packaging: string | null;
  unit: string | null;
  net_price: number | null;
}

interface Product {
  id: string;
  name: string;
  product_type: string | null;
  season: string | null;
  photo_url: string | null;
  photos: PhotoItem[];
  is_active: boolean;
  certifications: string[] | null;
  user_id: string;
}

interface FarmerProfile {
  id: string;
  user_id: string;
  farm_name: string;
  presentation: string | null;
  approximate_location: string | null;
  postal_code: string | null;
  contact_web: string | null;
  activity_types: string[];
}

interface FarmerContact {
  user_id: string;
  contact_email: string | null;
  contact_phone: string | null;
}

export default function Producto() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [variations, setVariations] = useState<ProductVariation[]>([]);
  const [farmer, setFarmer] = useState<FarmerProfile | null>(null);
  const [contact, setContact] = useState<FarmerContact | null>(null);
  const [otherProducts, setOtherProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPhoto, setCurrentPhoto] = useState(0);

  useEffect(() => {
    if (id) fetchProduct(id);
  }, [id]);

  const fetchProduct = async (productId: string) => {
    setLoading(true);
    try {
      // Fetch product
      const { data: prod } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (!prod) {
        setLoading(false);
        return;
      }

      const p = prod as any;
      setProduct({
        ...p,
        photos: p.photos || [],
      });

      // Fetch variations
      const { data: vars } = await supabase
        .from('product_variations')
        .select('*')
        .eq('product_id', productId);
      setVariations((vars || []) as any);

      // Fetch farmer profile
      const { data: farmerData } = await supabase
        .from('farmer_profiles_public' as any)
        .select('*')
        .eq('user_id', p.user_id);
      if (farmerData && farmerData.length > 0) {
        setFarmer(farmerData[0] as any);
      }

      // Fetch contact
      const { data: contactData } = await supabase
        .from('farmer_contact_details' as any)
        .select('*')
        .eq('user_id', p.user_id);
      if (contactData && contactData.length > 0) {
        setContact(contactData[0] as any);
      }

      // Fetch other products from same farmer
      const { data: others } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', p.user_id)
        .eq('is_active', true)
        .neq('id', productId);
      setOtherProducts((others || []).map((o: any) => ({ ...o, photos: o.photos || [] })));
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  // Build photo list: use photos array, fallback to photo_url
  const allPhotos: string[] = product
    ? product.photos.length > 0
      ? product.photos.map(p => p.url)
      : product.photo_url
        ? [product.photo_url]
        : []
    : [];

  const getCertBadge = (cert: string) => {
    const c = CERTIFICATION_TYPES.find(t => t.value === cert);
    if (!c) return null;
    return (
      <span key={cert} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-amber-50 text-amber-800 border border-amber-200">
        {c.emoji} {c.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center py-16">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
            <Package className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="font-display text-2xl font-semibold mb-2">Producto no encontrado</h2>
          <p className="text-muted-foreground mb-6">Este producto no existe o ha sido desactivado.</p>
          <Link to="/explorar">
            <Button variant="earth">
              <ArrowLeft className="w-4 h-4 mr-2" /> Volver a Explorar
            </Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const categoryEmoji = product.product_type ? PRODUCT_CATEGORY_EMOJIS[product.product_type] : null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="bg-muted/30 border-b">
          <div className="container max-w-4xl py-3">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver a resultados
            </button>
          </div>
        </div>

        <div className="container max-w-4xl py-6 md:py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">

            {/* LEFT: Photos */}
            <div>
              {allPhotos.length > 0 ? (
                <div className="space-y-3">
                  {/* Main photo */}
                  <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted border-2 border-border">
                    <img
                      src={allPhotos[currentPhoto]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    {allPhotos.length > 1 && (
                      <>
                        <button
                          onClick={() => setCurrentPhoto(i => (i - 1 + allPhotos.length) % allPhotos.length)}
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-10 h-10 flex items-center justify-center transition-colors"
                        >
                          <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                          onClick={() => setCurrentPhoto(i => (i + 1) % allPhotos.length)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-10 h-10 flex items-center justify-center transition-colors"
                        >
                          <ChevronRight className="w-6 h-6" />
                        </button>
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                          {allPhotos.map((_, i) => (
                            <button
                              key={i}
                              onClick={() => setCurrentPhoto(i)}
                              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                                i === currentPhoto ? 'bg-white' : 'bg-white/50'
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                  {/* Thumbnails */}
                  {allPhotos.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {allPhotos.map((url, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentPhoto(i)}
                          className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${
                            i === currentPhoto ? 'border-primary' : 'border-transparent'
                          }`}
                        >
                          <img src={url} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* No photos placeholder */
                <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/5 to-primary/15 border-2 border-dashed border-primary/20 flex flex-col items-center justify-center">
                  {categoryEmoji ? (
                    <span className="text-7xl mb-3">{categoryEmoji}</span>
                  ) : (
                    <Leaf className="w-16 h-16 text-primary/30 mb-3" />
                  )}
                  <p className="text-muted-foreground text-sm">Sin fotos disponibles</p>
                </div>
              )}
            </div>

            {/* RIGHT: Product info */}
            <div className="space-y-5">
              {/* Category badge */}
              {product.product_type && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary">
                  {categoryEmoji && <span>{categoryEmoji}</span>}
                  {product.product_type}
                </span>
              )}

              {/* Product name */}
              <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground leading-tight">
                {product.name}
              </h1>

              {/* Season */}
              {product.season && (
                <p className="text-muted-foreground flex items-center gap-2">
                  🗓️ Temporada: <span className="font-medium text-foreground">{product.season}</span>
                </p>
              )}

              {/* Certifications */}
              {product.certifications && product.certifications.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {product.certifications.map(cert => getCertBadge(cert))}
                </div>
              )}

              {/* Variations (prices) */}
              {variations.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Variedades y precios
                  </h3>
                  <div className="space-y-1.5">
                    {variations.map(v => (
                      <div
                        key={v.id}
                        className="flex items-center justify-between bg-muted/50 rounded-lg px-4 py-3"
                      >
                        <div className="flex items-center gap-2 text-sm">
                          {v.variety && <span>🌱 {v.variety}</span>}
                          {v.variety && v.packaging && <span className="text-muted-foreground">·</span>}
                          {v.packaging && <span>📦 {v.packaging}</span>}
                          {!v.variety && !v.packaging && <span className="text-muted-foreground">Estándar</span>}
                        </div>
                        {v.net_price != null && (
                          <span className="text-lg font-bold text-primary">
                            {v.net_price} €{v.unit ? `/${v.unit}` : ''}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Divider */}
              <hr className="border-border" />

              {/* Farmer info */}
              {farmer && (
                <div className="bg-primary/5 rounded-xl p-5 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-earth flex items-center justify-center flex-shrink-0">
                      <User className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-semibold">{farmer.farm_name}</h3>
                      {farmer.approximate_location && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {farmer.approximate_location}
                          {farmer.postal_code && <span className="text-xs">({farmer.postal_code})</span>}
                        </p>
                      )}
                    </div>
                  </div>

                  {farmer.presentation && (
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {farmer.presentation}
                    </p>
                  )}

                  {/* Contact details */}
                  <div className="space-y-2 text-sm">
                    {contact?.contact_email && (
                      <a href={`mailto:${contact.contact_email}`} className="flex items-center gap-2 text-primary hover:underline">
                        <Mail className="w-4 h-4" /> {contact.contact_email}
                      </a>
                    )}
                    {contact?.contact_phone && (
                      <a href={`tel:${contact.contact_phone}`} className="flex items-center gap-2 text-primary hover:underline">
                        <Phone className="w-4 h-4" /> {contact.contact_phone}
                      </a>
                    )}
                    {farmer.contact_web && (
                      <a
                        href={farmer.contact_web.startsWith('http') ? farmer.contact_web : `https://${farmer.contact_web}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-primary hover:underline"
                      >
                        <Globe className="w-4 h-4" /> {farmer.contact_web}
                      </a>
                    )}
                  </div>

                  {/* Message button */}
                  {user && user.id !== farmer.user_id && (
                    <Button
                      variant="earth"
                      className="w-full"
                      onClick={() => navigate(`/mensajes?con=${farmer.user_id}`)}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" /> Enviar mensaje
                    </Button>
                  )}
                  {!user && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => navigate('/auth')}
                    >
                      Inicia sesión para contactar
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Other products from same farmer */}
          {otherProducts.length > 0 && (
            <div className="mt-10 pt-8 border-t border-border">
              <h2 className="font-display text-xl font-semibold mb-4">
                Más productos de {farmer?.farm_name}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {otherProducts.map(op => {
                  const opEmoji = op.product_type ? PRODUCT_CATEGORY_EMOJIS[op.product_type] : null;
                  const opPhoto = op.photos?.length > 0 ? op.photos[0].url : op.photo_url;
                  return (
                    <Link
                      key={op.id}
                      to={`/producto/${op.id}`}
                      className="group rounded-xl overflow-hidden border border-border hover:shadow-md transition-shadow"
                    >
                      <div className="aspect-square bg-muted overflow-hidden">
                        {opPhoto ? (
                          <img src={opPhoto} alt={op.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-primary/5">
                            {opEmoji ? <span className="text-3xl">{opEmoji}</span> : <Leaf className="w-8 h-8 text-primary/30" />}
                          </div>
                        )}
                      </div>
                      <div className="p-2.5">
                        <p className="text-sm font-medium truncate">{op.name}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
