import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Leaf, MapPin, Filter, User, ShoppingBasket, Loader2, X } from 'lucide-react';

interface FarmerWithProducts {
  id: string;
  user_id: string;
  farm_name: string;
  presentation: string | null;
  approximate_location: string | null;
  postal_code: string | null;
  contact_web: string | null;
  activity_types: string[];
  products: {
    id: string;
    name: string;
    product_type: string | null;
    variety: string | null;
    season: string | null;
    photo_url: string | null;
    is_active: boolean;
  }[];
}

const PRODUCT_TYPES = [
  'Todos',
  'Verdura',
  'Fruta',
  'Cereal',
  'Legumbre',
  'Carne',
  'Lácteo',
  'Huevo',
  'Miel',
  'Aceite',
  'Vino',
  'Preparado',
];

const PRODUCT_TYPE_EMOJIS: Record<string, string> = {
  'Verdura': '🥬',
  'Fruta': '🍎',
  'Cereal': '🌾',
  'Legumbre': '🫘',
  'Carne': '🥩',
  'Lácteo': '🧀',
  'Huevo': '🥚',
  'Miel': '🍯',
  'Aceite': '🫒',
  'Vino': '🍷',
  'Preparado': '🧪',
};

export default function Explorar() {
  const [farmers, setFarmers] = useState<FarmerWithProducts[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('Todos');
  const [filterLocation, setFilterLocation] = useState('');
  const [availableLocations, setAvailableLocations] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('farmer_profiles_public' as any)
        .select('*');

      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true);

      if (profilesError) console.error('Error fetching profiles:', profilesError);
      if (productsError) console.error('Error fetching products:', productsError);

      const farmerProfiles = (profiles || []) as any[];
      const activeProducts = (products || []) as any[];

      setAllProducts(activeProducts);

      // Extract unique locations for filter
      const locations = farmerProfiles
        .map((p: any) => p.approximate_location)
        .filter(Boolean)
        .map((loc: string) => loc.trim());
      const uniqueLocations = [...new Set(locations)].sort();
      setAvailableLocations(uniqueLocations);

      const farmersWithProducts: FarmerWithProducts[] = farmerProfiles.map((profile: any) => ({
        ...profile,
        products: activeProducts.filter((p: any) => p.user_id === profile.user_id),
      }));

      setFarmers(farmersWithProducts);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter logic
  const filteredFarmers = farmers.filter((farmer) => {
    const matchesSearch =
      searchTerm === '' ||
      farmer.farm_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      farmer.approximate_location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      farmer.postal_code?.includes(searchTerm) ||
      farmer.products.some(
        (p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.variety?.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesType =
      filterType === 'Todos' ||
      farmer.products.some((p) => p.product_type === filterType);

    const matchesLocation =
      filterLocation === '' ||
      farmer.approximate_location?.toLowerCase().includes(filterLocation.toLowerCase()) ||
      farmer.postal_code?.startsWith(filterLocation);

    return matchesSearch && matchesType && matchesLocation;
  });

  // Orphan products
  const farmersUserIds = new Set(farmers.map((f) => f.user_id));
  const orphanProducts = allProducts.filter(
    (p) =>
      !farmersUserIds.has(p.user_id) &&
      (searchTerm === '' || p.name.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterType === 'Todos' || p.product_type === filterType)
  );

  const hasActiveFilters = filterType !== 'Todos' || filterLocation !== '';

  const clearFilters = () => {
    setFilterType('Todos');
    setFilterLocation('');
    setSearchTerm('');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero search */}
        <section className="bg-gradient-natural py-8 md:py-12">
          <div className="container max-w-3xl text-center">
            <h1 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-2">
              Encuentra alimentos biodinámicos
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              Busca por producto, agricultor o ubicación
            </p>

            {/* Main search bar */}
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar... (tomates, miel, Zaragoza...)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-14 text-lg rounded-xl border-2"
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

            {/* Filter toggle button */}
            <Button
              variant={showFilters || hasActiveFilters ? 'earth' : 'outline'}
              size="lg"
              className="gap-2 rounded-xl"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-5 h-5" />
              Filtros
              {hasActiveFilters && (
                <span className="ml-1 bg-white/20 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                  {(filterType !== 'Todos' ? 1 : 0) + (filterLocation ? 1 : 0)}
                </span>
              )}
            </Button>

            {/* Filter panel */}
            {showFilters && (
              <div className="mt-4 bg-white rounded-xl border-2 border-border p-4 text-left animate-fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Location filter */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      Ubicación
                    </label>
                    <Input
                      type="text"
                      placeholder="Ciudad, provincia o CP..."
                      value={filterLocation}
                      onChange={(e) => setFilterLocation(e.target.value)}
                      className="h-12 text-base rounded-lg"
                    />
                    {/* Quick location pills */}
                    {availableLocations.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {availableLocations.slice(0, 6).map((loc) => (
                          <button
                            key={loc}
                            onClick={() => setFilterLocation(loc)}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
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

                  {/* Product type filter */}
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                      <Leaf className="w-4 h-4 text-primary" />
                      Tipo de producto
                    </label>
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger className="h-12 text-base rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PRODUCT_TYPES.map((type) => (
                          <SelectItem key={type} value={type} className="text-base py-3">
                            {type !== 'Todos' && PRODUCT_TYPE_EMOJIS[type] ? `${PRODUCT_TYPE_EMOJIS[type]} ` : ''}
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {/* Quick product pills */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {PRODUCT_TYPES.filter(t => t !== 'Todos').slice(0, 6).map((type) => (
                        <button
                          key={type}
                          onClick={() => setFilterType(filterType === type ? 'Todos' : type)}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                            filterType === type
                              ? 'bg-primary text-white'
                              : 'bg-muted hover:bg-muted/80 text-foreground'
                          }`}
                        >
                          {PRODUCT_TYPE_EMOJIS[type]} {type}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {hasActiveFilters && (
                  <div className="mt-3 pt-3 border-t border-border flex justify-end">
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="text-destructive">
                      <X className="w-4 h-4 mr-1" />
                      Limpiar filtros
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
            ) : filteredFarmers.length === 0 && orphanProducts.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingBasket className="w-10 h-10 text-muted-foreground" />
                </div>
                <h2 className="font-display text-2xl font-semibold mb-2">
                  {searchTerm || hasActiveFilters
                    ? 'No encontramos resultados'
                    : 'Aún no hay agricultores registrados'}
                </h2>
                <p className="text-muted-foreground text-lg mb-6">
                  {searchTerm || hasActiveFilters
                    ? 'Prueba con otra búsqueda o quita los filtros'
                    : 'Sé el primero en compartir tus productos biodinámicos'}
                </p>
                {hasActiveFilters && (
                  <Button variant="outline" onClick={clearFilters} className="mb-4">
                    <X className="w-4 h-4 mr-2" />
                    Limpiar filtros
                  </Button>
                )}
                {!searchTerm && !hasActiveFilters && (
                  <Link to="/auth">
                    <Button variant="earth" size="xl" className="h-14 text-lg">
                      <Leaf className="w-5 h-5 mr-2" />
                      Registrarme como agricultor
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <p className="text-muted-foreground">
                    {filteredFarmers.length} agricultor{filteredFarmers.length !== 1 ? 'es' : ''} encontrado{filteredFarmers.length !== 1 ? 's' : ''}
                    {filteredFarmers.reduce((acc, f) => acc + f.products.length, 0) + orphanProducts.length > 0 && (
                      <span className="ml-1">
                        · {filteredFarmers.reduce((acc, f) => acc + f.products.length, 0) + orphanProducts.length} producto{(filteredFarmers.reduce((acc, f) => acc + f.products.length, 0) + orphanProducts.length) !== 1 ? 's' : ''}
                      </span>
                    )}
                  </p>
                  {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
                      <X className="w-4 h-4 mr-1" />
                      Limpiar
                    </Button>
                  )}
                </div>

                <div className="space-y-6">
                  {filteredFarmers.map((farmer) => (
                    <FarmerCard key={farmer.id} farmer={farmer} />
                  ))}
                </div>

                {orphanProducts.length > 0 && (
                  <div className="mt-8">
                    <h3 className="font-display text-xl font-semibold mb-4 text-muted-foreground">
                      Más productos disponibles
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {orphanProducts.map((product) => (
                        <Card key={product.id} className="p-4 flex items-center gap-4">
                          {product.photo_url ? (
                            <img
                              src={product.photo_url}
                              alt={product.name}
                              className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                              {product.product_type && PRODUCT_TYPE_EMOJIS[product.product_type] ? (
                                <span className="text-2xl">{PRODUCT_TYPE_EMOJIS[product.product_type]}</span>
                              ) : (
                                <Leaf className="w-6 h-6 text-primary" />
                              )}
                            </div>
                          )}
                          <div>
                            <h4 className="font-semibold text-lg">{product.name}</h4>
                            {product.variety && (
                              <p className="text-sm text-muted-foreground">🌱 {product.variety}</p>
                            )}
                            {product.season && (
                              <p className="text-sm text-muted-foreground">🗓️ {product.season}</p>
                            )}
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 bg-muted/30">
          <div className="container max-w-2xl text-center">
            <h2 className="font-display text-2xl font-semibold mb-3">
              ¿Eres agricultor biodinámico?
            </h2>
            <p className="text-muted-foreground text-lg mb-6">
              Comparte tus productos con consumidores que valoran la agricultura consciente. Sin comisiones, sin intermediarios.
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

function FarmerCard({ farmer }: { farmer: FarmerWithProducts }) {
  return (
    <Card className="overflow-hidden hover:shadow-elevated transition-shadow">
      <div className="p-6">
        {/* Farmer header */}
        <div className="flex items-start gap-4 mb-4">
          <div className="w-14 h-14 rounded-full bg-gradient-earth flex items-center justify-center flex-shrink-0">
            <User className="w-7 h-7 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display text-xl font-semibold text-foreground truncate">
              {farmer.farm_name}
            </h3>
            {farmer.approximate_location && (
              <p className="text-muted-foreground flex items-center gap-1 mt-1">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                {farmer.approximate_location}
                {farmer.postal_code && (
                  <span className="text-xs ml-1">({farmer.postal_code})</span>
                )}
              </p>
            )}
          </div>
        </div>

        {/* Presentation */}
        {farmer.presentation && (
          <p className="text-muted-foreground leading-relaxed mb-4 line-clamp-3">
            {farmer.presentation}
          </p>
        )}

        {/* Products */}
        {farmer.products.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {farmer.products.map((product) => (
              <span
                key={product.id}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-full bg-primary/10 text-sm font-medium text-foreground"
              >
                {product.product_type && PRODUCT_TYPE_EMOJIS[product.product_type] && (
                  <span>{PRODUCT_TYPE_EMOJIS[product.product_type]}</span>
                )}
                {product.name}
                {product.variety && (
                  <span className="text-xs text-muted-foreground ml-0.5">({product.variety})</span>
                )}
              </span>
            ))}
          </div>
        )}

        {/* Contact web */}
        {farmer.contact_web && (
          <div className="mt-4 pt-4 border-t border-border">
            <a
              href={farmer.contact_web.startsWith('http') ? farmer.contact_web : `https://${farmer.contact_web}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline text-sm"
            >
              🌐 {farmer.contact_web}
            </a>
          </div>
        )}
      </div>
    </Card>
  );
}
