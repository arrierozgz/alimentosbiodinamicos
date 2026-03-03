import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Search, Leaf, MapPin, Filter, User, ShoppingBasket,
  Loader2, X, Mail, Phone, Globe, Package, Award, MessageCircle,
} from 'lucide-react';
import {
  PRODUCT_CATEGORIES, PRODUCT_CATEGORY_EMOJIS,
  CERTIFICATION_TYPES, PACKAGING_OPTIONS,
} from '@/lib/catalogo';

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
  is_active: boolean;
  certifications: string[] | null;
  user_id: string;
  variations?: ProductVariation[];
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

export default function Explorar() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const initialMode = searchParams.get('modo') || '';

  const [farmers, setFarmers] = useState<FarmerProfile[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [variations, setVariations] = useState<ProductVariation[]>([]);
  const [contacts, setContacts] = useState<FarmerContact[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterVariety, setFilterVariety] = useState('');
  const [filterPackaging, setFilterPackaging] = useState('');
  const [filterCertification, setFilterCertification] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [showFilters, setShowFilters] = useState(initialMode === 'producto' || initialMode === 'cercania');
  const [expandedFarmer, setExpandedFarmer] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  // Auto-focus location filter if mode=cercania
  useEffect(() => {
    if (initialMode === 'cercania') {
      setShowFilters(true);
    }
  }, [initialMode]);

  const fetchData = async () => {
    try {
      const [profilesRes, productsRes, variationsRes, contactsRes] = await Promise.all([
        supabase.from('farmer_profiles_public' as any).select('*'),
        supabase.from('products').select('*').eq('is_active', true),
        supabase.from('product_variations').select('*'),
        supabase.from('farmer_contact_details' as any).select('*'),
      ]);

      setFarmers((profilesRes.data || []) as any);
      setProducts((productsRes.data || []) as any);
      setVariations((variationsRes.data || []) as any);
      setContacts((contactsRes.data || []) as any);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Enrich products with variations
  const enrichedProducts = useMemo(() => {
    return products.map(p => ({
      ...p,
      variations: variations.filter(v => v.product_id === p.id),
    }));
  }, [products, variations]) as (Product & { variations: (ProductVariation & { product_id?: string })[] })[];

  // Available varieties for selected category
  const availableVarieties = useMemo(() => {
    let filtered = enrichedProducts;
    if (filterCategory) {
      filtered = filtered.filter(p => p.product_type === filterCategory);
    }
    const varieties = new Set<string>();
    filtered.forEach(p => {
      p.variations?.forEach(v => {
        if (v.variety) varieties.add(v.variety);
      });
    });
    return [...varieties].sort();
  }, [enrichedProducts, filterCategory]);

  // Available packaging for selected category+variety
  const availablePackaging = useMemo(() => {
    let filtered = enrichedProducts;
    if (filterCategory) {
      filtered = filtered.filter(p => p.product_type === filterCategory);
    }
    if (filterVariety) {
      filtered = filtered.filter(p =>
        p.variations?.some(v => v.variety === filterVariety)
      );
    }
    const packaging = new Set<string>();
    filtered.forEach(p => {
      p.variations?.forEach(v => {
        if (v.packaging) packaging.add(v.packaging);
      });
    });
    return [...packaging].sort();
  }, [enrichedProducts, filterCategory, filterVariety]);

  // Available locations
  const availableLocations = useMemo(() => {
    const locs = farmers
      .map(f => f.approximate_location)
      .filter(Boolean) as string[];
    return [...new Set(locs)].sort();
  }, [farmers]);

  // Filter results — returns farmer IDs that match
  const filteredResults = useMemo(() => {
    // Build set of matching product user_ids
    let matchingProducts = enrichedProducts;

    if (filterCategory) {
      matchingProducts = matchingProducts.filter(p => p.product_type === filterCategory);
    }
    if (filterCertification) {
      matchingProducts = matchingProducts.filter(p =>
        p.certifications?.includes(filterCertification)
      );
    }
    if (filterVariety) {
      matchingProducts = matchingProducts.filter(p =>
        p.variations?.some(v => v.variety === filterVariety)
      );
    }
    if (filterPackaging) {
      matchingProducts = matchingProducts.filter(p =>
        p.variations?.some(v => v.packaging === filterPackaging)
      );
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      matchingProducts = matchingProducts.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.product_type?.toLowerCase().includes(term) ||
        p.variations?.some(v => v.variety?.toLowerCase().includes(term))
      );
    }

    const productUserIds = new Set(matchingProducts.map(p => p.user_id));

    // Filter farmers
    let matchedFarmers = farmers;
    if (filterCategory || filterCertification || filterVariety || filterPackaging || searchTerm) {
      matchedFarmers = matchedFarmers.filter(f => productUserIds.has(f.user_id));
    }

    if (filterLocation) {
      const locTerm = filterLocation.toLowerCase();
      matchedFarmers = matchedFarmers.filter(f =>
        f.approximate_location?.toLowerCase().includes(locTerm) ||
        f.postal_code?.startsWith(filterLocation)
      );
    }

    if (searchTerm && !filterCategory) {
      // Also match farmer name/location
      const term = searchTerm.toLowerCase();
      const farmerNameMatches = farmers.filter(f =>
        f.farm_name.toLowerCase().includes(term) ||
        f.approximate_location?.toLowerCase().includes(term)
      );
      const combined = new Set([
        ...matchedFarmers.map(f => f.id),
        ...farmerNameMatches.map(f => f.id),
      ]);
      matchedFarmers = farmers.filter(f => combined.has(f.id));
    }

    return {
      farmers: matchedFarmers,
      products: matchingProducts,
    };
  }, [farmers, enrichedProducts, searchTerm, filterCategory, filterVariety, filterPackaging, filterCertification, filterLocation]);

  const hasActiveFilters = filterCategory || filterVariety || filterPackaging || filterCertification || filterLocation;

  const clearFilters = () => {
    setFilterCategory('');
    setFilterVariety('');
    setFilterPackaging('');
    setFilterCertification('');
    setFilterLocation('');
    setSearchTerm('');
  };

  const getContact = (userId: string) => contacts.find(c => c.user_id === userId);
  const getFarmerProducts = (userId: string) => enrichedProducts.filter(p => p.user_id === userId);

  const getCertBadge = (cert: string) => {
    const c = CERTIFICATION_TYPES.find(t => t.value === cert);
    if (!c) return null;
    return (
      <span key={cert} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-muted">
        {c.emoji} {c.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Search hero */}
        <section className="bg-gradient-natural py-8 md:py-12">
          <div className="container max-w-3xl text-center">
            <h1 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-2">
              Listín de productores
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              Directorio de alimentos ecológicos, biodinámicos y Demeter
            </p>

            {/* Search bar */}
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar productor, producto o ubicación..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-14 text-lg rounded-xl border-2"
                autoFocus={initialMode === 'cercania'}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            <Button
              variant={showFilters || hasActiveFilters ? 'earth' : 'outline'}
              size="lg"
              className="gap-2 rounded-xl"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-5 h-5" />
              Filtros avanzados
              {hasActiveFilters && (
                <span className="ml-1 bg-white/20 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                  {[filterCategory, filterVariety, filterPackaging, filterCertification, filterLocation].filter(Boolean).length}
                </span>
              )}
            </Button>

            {/* Filter panel — cascading */}
            {showFilters && (
              <div className="mt-4 bg-white rounded-xl border-2 border-border p-5 text-left animate-fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Ubicación */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      Ubicación
                    </label>
                    <Input
                      type="text"
                      placeholder="Ciudad, provincia o CP..."
                      value={filterLocation}
                      onChange={(e) => setFilterLocation(e.target.value)}
                      className="h-11 text-base rounded-lg"
                      autoFocus={initialMode === 'cercania'}
                    />
                    {availableLocations.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {availableLocations.slice(0, 6).map((loc) => (
                          <button
                            key={loc}
                            onClick={() => setFilterLocation(filterLocation === loc ? '' : loc)}
                            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                              filterLocation === loc
                                ? 'bg-primary text-white'
                                : 'bg-muted hover:bg-muted/80 text-foreground'
                            }`}
                          >
                            📍 {loc}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Producto (categoría) */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                      <ShoppingBasket className="w-4 h-4 text-green-600" />
                      Producto
                    </label>
                    <Select
                      value={filterCategory}
                      onValueChange={(v) => {
                        setFilterCategory(v === '__all__' ? '' : v);
                        setFilterVariety('');
                        setFilterPackaging('');
                      }}
                    >
                      <SelectTrigger className="h-11 text-base rounded-lg">
                        <SelectValue placeholder="Todos los productos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__all__">Todos</SelectItem>
                        {PRODUCT_CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {PRODUCT_CATEGORY_EMOJIS[cat] || ''} {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Variedad (depende de producto) */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                      <Leaf className="w-4 h-4 text-primary" />
                      Variedad
                    </label>
                    <Select
                      value={filterVariety}
                      onValueChange={(v) => {
                        setFilterVariety(v === '__all__' ? '' : v);
                        setFilterPackaging('');
                      }}
                      disabled={availableVarieties.length === 0}
                    >
                      <SelectTrigger className="h-11 text-base rounded-lg">
                        <SelectValue placeholder={availableVarieties.length ? 'Todas las variedades' : 'Sin variedades'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__all__">Todas</SelectItem>
                        {availableVarieties.map((v) => (
                          <SelectItem key={v} value={v}>🌱 {v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Envase (depende de variedad) */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                      <Package className="w-4 h-4 text-amber-600" />
                      Envase
                    </label>
                    <Select
                      value={filterPackaging}
                      onValueChange={(v) => setFilterPackaging(v === '__all__' ? '' : v)}
                      disabled={availablePackaging.length === 0}
                    >
                      <SelectTrigger className="h-11 text-base rounded-lg">
                        <SelectValue placeholder={availablePackaging.length ? 'Todos los envases' : 'Sin envases'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__all__">Todos</SelectItem>
                        {availablePackaging.map((p) => (
                          <SelectItem key={p} value={p}>📦 {p}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Certificación */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                      <Award className="w-4 h-4 text-amber-500" />
                      Certificación
                    </label>
                    <Select
                      value={filterCertification}
                      onValueChange={(v) => setFilterCertification(v === '__all__' ? '' : v)}
                    >
                      <SelectTrigger className="h-11 text-base rounded-lg">
                        <SelectValue placeholder="Todas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__all__">Todas</SelectItem>
                        {CERTIFICATION_TYPES.map((cert) => (
                          <SelectItem key={cert.value} value={cert.value}>
                            {cert.emoji} {cert.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {hasActiveFilters && (
                  <div className="mt-3 pt-3 border-t border-border flex justify-end">
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="text-destructive">
                      <X className="w-4 h-4 mr-1" /> Limpiar filtros
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Results */}
        <section className="py-8 md:py-12">
          <div className="container max-w-4xl">
            {loading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
              </div>
            ) : filteredResults.farmers.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingBasket className="w-10 h-10 text-muted-foreground" />
                </div>
                <h2 className="font-display text-2xl font-semibold mb-2">
                  {hasActiveFilters || searchTerm
                    ? 'No encontramos resultados'
                    : 'Aún no hay productores registrados'}
                </h2>
                <p className="text-muted-foreground text-lg mb-6">
                  {hasActiveFilters || searchTerm
                    ? 'Prueba con otra búsqueda o quita los filtros'
                    : 'Sé el primero en compartir tus productos'}
                </p>
                {hasActiveFilters && (
                  <Button variant="outline" onClick={clearFilters}>
                    <X className="w-4 h-4 mr-2" /> Limpiar filtros
                  </Button>
                )}
              </div>
            ) : (
              <>
                <p className="text-muted-foreground mb-6">
                  {filteredResults.farmers.length} productor{filteredResults.farmers.length !== 1 ? 'es' : ''} encontrado{filteredResults.farmers.length !== 1 ? 's' : ''}
                </p>

                <div className="space-y-4">
                  {filteredResults.farmers.map((farmer) => {
                    const farmerProducts = getFarmerProducts(farmer.user_id);
                    const contact = getContact(farmer.user_id);
                    const isExpanded = expandedFarmer === farmer.id;

                    return (
                      <Card
                        key={farmer.id}
                        className="overflow-hidden hover:shadow-elevated transition-shadow cursor-pointer"
                        onClick={() => setExpandedFarmer(isExpanded ? null : farmer.id)}
                      >
                        <div className="p-5">
                          {/* Header */}
                          <div className="flex items-start gap-4 mb-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-earth flex items-center justify-center flex-shrink-0">
                              <User className="w-6 h-6 text-primary-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-display text-lg font-semibold text-foreground truncate">
                                {farmer.farm_name}
                              </h3>
                              {farmer.approximate_location && (
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                  <MapPin className="w-3.5 h-3.5" />
                                  {farmer.approximate_location}
                                  {farmer.postal_code && <span className="text-xs">({farmer.postal_code})</span>}
                                </p>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {isExpanded ? '▲ cerrar' : '▼ ver más'}
                            </span>
                          </div>

                          {/* Products summary */}
                          {farmerProducts.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-2">
                              {farmerProducts.map((product) => (
                                <span
                                  key={product.id}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-primary/10 text-xs font-medium"
                                >
                                  {product.product_type && PRODUCT_CATEGORY_EMOJIS[product.product_type] && (
                                    <span>{PRODUCT_CATEGORY_EMOJIS[product.product_type]}</span>
                                  )}
                                  {product.name}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Certifications */}
                          {farmerProducts.some(p => p.certifications?.length) && (
                            <div className="flex flex-wrap gap-1.5 mb-2">
                              {[...new Set(farmerProducts.flatMap(p => p.certifications || []))].map(cert => getCertBadge(cert))}
                            </div>
                          )}

                          {/* Expanded details */}
                          {isExpanded && (
                            <div className="mt-4 pt-4 border-t border-border animate-fade-in space-y-4">
                              {/* Presentation */}
                              {farmer.presentation && (
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                  {farmer.presentation}
                                </p>
                              )}

                              {/* Products with variations */}
                              {farmerProducts.length > 0 && (
                                <div>
                                  <h4 className="text-sm font-semibold mb-2">Productos disponibles:</h4>
                                  <div className="space-y-2">
                                    {farmerProducts.map(product => (
                                      <div key={product.id} className="bg-muted/50 rounded-lg p-3">
                                        <div className="flex items-center gap-2 mb-1">
                                          {product.product_type && PRODUCT_CATEGORY_EMOJIS[product.product_type] && (
                                            <span className="text-lg">{PRODUCT_CATEGORY_EMOJIS[product.product_type]}</span>
                                          )}
                                          <span className="font-medium">{product.name}</span>
                                          {product.certifications?.map(cert => getCertBadge(cert))}
                                        </div>
                                        {product.season && (
                                          <p className="text-xs text-muted-foreground mb-1">🗓️ {product.season}</p>
                                        )}
                                        {product.variations && product.variations.length > 0 && (
                                          <div className="mt-2 space-y-1">
                                            {product.variations.map(v => (
                                              <div key={v.id} className="flex items-center justify-between text-sm bg-white/60 rounded px-2 py-1">
                                                <span>
                                                  {v.variety && <span className="text-muted-foreground">🌱 {v.variety}</span>}
                                                  {v.variety && v.packaging && <span className="mx-1 text-muted-foreground">·</span>}
                                                  {v.packaging && <span className="text-muted-foreground">📦 {v.packaging}</span>}
                                                </span>
                                                {v.net_price != null && (
                                                  <span className="font-semibold text-primary">{v.net_price} €</span>
                                                )}
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Contact info */}
                              <div className="bg-primary/5 rounded-lg p-4">
                                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                  <User className="w-4 h-4" /> Contacto
                                </h4>
                                <div className="space-y-1.5 text-sm">
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
                                  {!contact?.contact_email && !contact?.contact_phone && !farmer.contact_web && (
                                    <p className="text-muted-foreground text-xs">Este productor no ha publicado datos de contacto todavía.</p>
                                  )}
                                </div>
                                {user && user.id !== farmer.user_id && (
                                  <Button
                                    variant="earth" size="sm" className="w-full mt-3"
                                    onClick={(e) => { e.stopPropagation(); navigate(`/mensajes?con=${farmer.user_id}`); }}
                                  >
                                    <MessageCircle className="w-4 h-4 mr-2" /> Enviar mensaje
                                  </Button>
                                )}
                                {!user && (
                                  <Button
                                    variant="outline" size="sm" className="w-full mt-3"
                                    onClick={(e) => { e.stopPropagation(); navigate('/auth'); }}
                                  >
                                    Inicia sesión para contactar
                                  </Button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 bg-muted/30">
          <div className="container max-w-2xl text-center">
            <h2 className="font-display text-2xl font-semibold mb-3">
              ¿Eres productor ecológico o biodinámico?
            </h2>
            <p className="text-muted-foreground text-lg mb-6">
              Aparece en el listín. Sin comisiones, sin intermediarios.
            </p>
            <Link to="/auth">
              <Button variant="earth" size="xl" className="h-14 text-lg">
                Publicar mis productos
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
