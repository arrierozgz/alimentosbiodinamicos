import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Users, Leaf, MapPin, User, Search } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { PRODUCT_CATEGORY_EMOJIS } from "@/lib/catalogo";

interface ProductSuggestion {
  id: string;
  name: string;
  product_type: string | null;
  photo_url: string | null;
}

interface ProductVariationSuggestion {
  id: string;
  product_id: string;
  variety: string | null;
}

const normalizeSearch = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const fallbackVisualProducts: ProductSuggestion[] = [
  { id: "fallback-aceite", name: "Aceite biodinámico", product_type: "Aceite", photo_url: null },
  { id: "fallback-hortaliza", name: "Hortalizas de temporada", product_type: "Hortaliza", photo_url: null },
  { id: "fallback-fruta", name: "Fruta consciente", product_type: "Fruta", photo_url: null },
  { id: "fallback-cereal", name: "Cereales y pan", product_type: "Cereal", photo_url: null },
];

const HeroSection = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<ProductSuggestion[]>([]);
  const [variations, setVariations] = useState<ProductVariationSuggestion[]>([]);
  const hasSearch = !!searchTerm.trim();

  useEffect(() => {
    const fetchProducts = async () => {
      const [productsRes, variationsRes] = await Promise.all([
        supabase
          .from("products")
          .select("id,name,product_type,photo_url")
          .eq("is_active", true)
          .order("name", { ascending: true }),
        supabase
          .from("product_variations")
          .select("id,product_id,variety"),
      ]);

      setProducts((productsRes.data || []) as ProductSuggestion[]);
      setVariations((variationsRes.data || []) as ProductVariationSuggestion[]);
    };

    fetchProducts();
  }, []);

  const liveSuggestions = useMemo(() => {
    const term = normalizeSearch(searchTerm.trim());
    if (!term) return [];

    return products
      .map((product) => {
        const productVariations = variations.filter((variation) => variation.product_id === product.id);
        const searchable = normalizeSearch([
          product.name,
          product.product_type,
          ...productVariations.map((variation) => variation.variety),
        ].filter(Boolean).join(" "));

        return {
          ...product,
          variations: productVariations,
          matches: searchable.includes(term),
        };
      })
      .filter((product) => product.matches);
  }, [products, searchTerm, variations]);

  const visibleSuggestions = liveSuggestions.slice(0, 5);
  const featuredProducts = useMemo(() => {
    const withPhotos = products.filter((product) => product.photo_url).slice(0, 4);
    return withPhotos.length ? withPhotos : products.slice(0, 4);
  }, [products]);
  const visualProducts = featuredProducts.length ? featuredProducts : fallbackVisualProducts;

  const goToSearch = () => {
    const term = searchTerm.trim();
    navigate(`/explorar${term ? `?buscar=${encodeURIComponent(term)}` : ""}`);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-natural">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute top-1/2 -left-24 w-72 h-72 rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="container relative py-16 md:py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-up">
              <Leaf className="h-4 w-4" />
              {t('home.hero_badge')}
            </div>
            
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-foreground leading-tight mb-6 animate-fade-up" style={{ animationDelay: "0.1s" }}>
              {t('home.hero_title_1')}{" "}
              <span className="text-primary">{t('home.hero_title_2')}</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0 animate-fade-up" style={{ animationDelay: "0.2s" }}>
              {t('home.hero_description')}
            </p>

            {/* Search bar */}
            <div className="max-w-lg mx-auto lg:mx-0 mb-6 animate-fade-up" style={{ animationDelay: "0.3s" }}>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  goToSearch();
                }}
                className="relative"
              >
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={t('home.search_placeholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-28 h-14 text-lg rounded-xl border-2 shadow-card"
                />
                <Button
                  type="submit"
                  variant="earth"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg h-10"
                >
                  {t('home.search_button')}
                </Button>
              </form>
              {hasSearch && (
                <div className="mt-3 max-h-72 overflow-y-auto rounded-xl border-2 border-primary/20 bg-white text-left shadow-elevated">
                  {liveSuggestions.length > 0 ? (
                    <>
                      {visibleSuggestions.map((product) => {
                        const emoji = product.product_type ? PRODUCT_CATEGORY_EMOJIS[product.product_type] : null;
                        const varieties = product.variations
                          .map((variation) => variation.variety)
                          .filter(Boolean)
                          .slice(0, 2)
                          .join(", ");

                        return (
                          <Link
                            key={product.id}
                            to={`/producto/${product.id}`}
                            className="flex items-center gap-3 border-b border-border/60 px-4 py-3 transition-colors last:border-b-0 hover:bg-primary/5"
                          >
                            <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-primary/10">
                              {product.photo_url ? (
                                <img src={product.photo_url} alt="" className="h-full w-full object-cover" />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-lg">
                                  {emoji || <Leaf className="h-4 w-4 text-primary/60" />}
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold text-foreground">{product.name}</p>
                              <p className="truncate text-xs text-muted-foreground">
                                {[product.product_type, varieties].filter(Boolean).join(" · ")}
                              </p>
                            </div>
                          </Link>
                        );
                      })}
                      <button
                        type="button"
                        onClick={goToSearch}
                        className="w-full px-4 py-3 text-left text-sm font-semibold text-primary transition-colors hover:bg-primary/5"
                      >
                        Ver todos los resultados de "{searchTerm.trim()}"
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={goToSearch}
                      className="w-full px-4 py-3 text-left text-sm text-muted-foreground transition-colors hover:bg-primary/5"
                    >
                      No hay coincidencias directas. Buscar "{searchTerm.trim()}" en el listín
                    </button>
                  )}
                </div>
              )}
            </div>

            {!hasSearch && (
              <div className="lg:hidden -mx-2 mb-7 overflow-x-auto pb-2 animate-fade-up" style={{ animationDelay: "0.34s" }}>
                <div className="flex gap-3 px-2">
                  {visualProducts.slice(0, 3).map((product) => {
                    const emoji = product.product_type ? PRODUCT_CATEGORY_EMOJIS[product.product_type] : null;
                    return (
                      <div key={product.id} className="relative h-28 w-36 flex-shrink-0 overflow-hidden rounded-xl bg-primary/10 shadow-card">
                        {product.photo_url ? (
                          <img src={product.photo_url} alt={product.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-earth text-3xl text-primary-foreground">
                            {emoji || <Leaf className="h-8 w-8" />}
                          </div>
                        )}
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent p-2 pt-8">
                          <p className="truncate text-xs font-semibold text-white">{product.name}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {!hasSearch && (
              <>
                {/* Certification quick filters */}
                <div className="flex flex-wrap gap-3 justify-center lg:justify-start mb-8 animate-fade-up" style={{ animationDelay: "0.35s" }}>
                  <span className="text-sm text-muted-foreground self-center mr-1">{t('home.filter_by')}:</span>
                  <Link to="/explorar?cert=biodinamico">
                    <span className="px-4 py-2 rounded-full text-sm font-bold bg-amber-600 hover:bg-amber-700 text-white cursor-pointer transition-all hover:scale-105 shadow-sm">
                      BIODINÁMICO
                    </span>
                  </Link>
                  <Link to="/explorar?cert=demeter">
                    <span className="px-4 py-2 rounded-full text-sm font-semibold bg-green-700 hover:bg-green-800 text-white cursor-pointer transition-all hover:scale-105 shadow-sm">
                      demeter
                    </span>
                  </Link>
                  <Link to="/explorar?cert=ecologico">
                    <span className="px-4 py-2 rounded-full text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer transition-all hover:scale-105 shadow-sm">
                      ecológico
                    </span>
                  </Link>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-up" style={{ animationDelay: "0.4s" }}>
                  {!user && (
                    <Link to="/auth">
                      <Button variant="earth" size="xl" className="w-full sm:w-auto group text-lg h-16">
                        <User className="h-5 w-5" />
                        {t('home.hero_cta_access')}
                      </Button>
                    </Link>
                  )}
                  <Link to="/explorar">
                    <Button variant="outline" size="xl" className="w-full sm:w-auto group text-lg h-16">
                      {t('home.hero_cta_explore')}
                      <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>

          <div className="relative hidden lg:block animate-fade-up" style={{ animationDelay: "0.4s" }}>
            <div className="relative max-w-lg mx-auto">
              <div className="grid grid-cols-2 gap-4 rounded-3xl bg-white/60 p-4 shadow-elevated backdrop-blur">
                {visualProducts.map((product, index) => {
                  const emoji = product.product_type ? PRODUCT_CATEGORY_EMOJIS[product.product_type] : null;
                  const tileClassName = `group relative h-44 overflow-hidden rounded-2xl bg-primary/10 shadow-card transition-transform hover:-translate-y-1 ${
                    index % 2 === 1 ? "translate-y-8" : ""
                  }`;
                  const tileContent = (
                    <>
                      {product.photo_url ? (
                        <img
                          src={product.photo_url}
                          alt={product.name}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-earth text-4xl text-primary-foreground">
                          {emoji || <Leaf className="h-10 w-10" />}
                        </div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent p-3 pt-10">
                        <p className="truncate text-sm font-semibold text-white">{product.name}</p>
                      </div>
                    </>
                  );

                  return product.id.startsWith("fallback-") ? (
                    <div key={product.id} className={tileClassName}>
                      {tileContent}
                    </div>
                  ) : (
                    <Link
                      key={product.id}
                      to={`/producto/${product.id}`}
                      className={tileClassName}
                    >
                      {tileContent}
                    </Link>
                  );
                })}
              </div>
              
              <div className="absolute -top-4 right-4 bg-card rounded-2xl p-4 shadow-card animate-float">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{t('home.card_community')}</p>
                    <p className="text-sm text-muted-foreground">{t('home.card_growing')}</p>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-4 left-6 bg-card rounded-2xl p-4 shadow-card animate-float-delayed">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{t('home.card_nearby')}</p>
                    <p className="text-sm text-muted-foreground">{t('home.card_km0')}</p>
                  </div>
                </div>
              </div>

              <div className="absolute right-0 top-1/2 bg-card rounded-2xl p-4 shadow-card animate-float" style={{ animationDelay: "1s" }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-leaf/20 flex items-center justify-center">
                    <Leaf className="h-5 w-5 text-leaf" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{t('home.card_biodynamic')}</p>
                    <p className="text-sm text-muted-foreground">{t('home.card_certified')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
