import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Leaf, MapPin, Filter, User, ShoppingBasket, Loader2 } from 'lucide-react';

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
};

export default function Explorar() {
  const [farmers, setFarmers] = useState<FarmerWithProducts[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('Todos');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch public farmer profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('farmer_profiles_public' as any)
        .select('*');

      // Fetch all active products
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true);

      if (profilesError) console.error('Error fetching profiles:', profilesError);
      if (productsError) console.error('Error fetching products:', productsError);

      const farmerProfiles = (profiles || []) as any[];
      const activeProducts = (products || []) as any[];

      setAllProducts(activeProducts);

      // Combine farmers with their products
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
      farmer.products.some((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType =
      filterType === 'Todos' ||
      farmer.products.some((p) => p.product_type === filterType);

    return matchesSearch && matchesType;
  });

  // Also show standalone products (from farmers without profile)
  const farmersUserIds = new Set(farmers.map((f) => f.user_id));
  const orphanProducts = allProducts.filter(
    (p) =>
      !farmersUserIds.has(p.user_id) &&
      (searchTerm === '' || p.name.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterType === 'Todos' || p.product_type === filterType)
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero search */}
        <section className="bg-gradient-natural py-10 md:py-16">
          <div className="container max-w-3xl text-center">
            <h1 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-3">
              Encuentra alimentos biodinámicos
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Busca por producto, agricultor o ubicación
            </p>

            {/* Search bar - BIG for fat fingers */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar... (tomates, miel, Zaragoza...)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-16 text-lg rounded-xl border-2"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="h-16 text-lg rounded-xl border-2 w-full sm:w-48">
                  <Filter className="w-5 h-5 mr-2" />
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
            </div>
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
                  {searchTerm || filterType !== 'Todos'
                    ? 'No encontramos resultados'
                    : 'Aún no hay agricultores registrados'}
                </h2>
                <p className="text-muted-foreground text-lg mb-6">
                  {searchTerm || filterType !== 'Todos'
                    ? 'Prueba con otra búsqueda o quita los filtros'
                    : 'Sé el primero en compartir tus productos biodinámicos'}
                </p>
                {!searchTerm && filterType === 'Todos' && (
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
                <p className="text-muted-foreground mb-6">
                  {filteredFarmers.length} agricultor{filteredFarmers.length !== 1 ? 'es' : ''} encontrado{filteredFarmers.length !== 1 ? 's' : ''}
                </p>

                <div className="space-y-6">
                  {filteredFarmers.map((farmer) => (
                    <FarmerCard key={farmer.id} farmer={farmer} />
                  ))}
                </div>

                {/* Orphan products */}
                {orphanProducts.length > 0 && (
                  <div className="mt-8">
                    <h3 className="font-display text-xl font-semibold mb-4 text-muted-foreground">
                      Más productos disponibles
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {orphanProducts.map((product) => (
                        <Card key={product.id} className="p-4 flex items-center gap-4">
                          <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                            {product.product_type && PRODUCT_TYPE_EMOJIS[product.product_type] ? (
                              <span className="text-2xl">{PRODUCT_TYPE_EMOJIS[product.product_type]}</span>
                            ) : (
                              <Leaf className="w-6 h-6 text-primary" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-semibold text-lg">{product.name}</h4>
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

const PRODUCT_TYPE_EMOJIS_CARD: Record<string, string> = {
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
};
