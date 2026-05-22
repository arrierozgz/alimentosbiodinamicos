import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Leaf, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PRODUCT_CATEGORY_EMOJIS } from "@/lib/catalogo";
import ProducerMapPreview from "@/components/map/ProducerMapPreview";

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

const HeroSection = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
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

      <div className="container relative py-12 md:py-16 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
          <div className="min-w-0 text-center lg:text-left">
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
            <div className="w-full max-w-full sm:max-w-lg mx-auto lg:mx-0 mb-6 animate-fade-up" style={{ animationDelay: "0.3s" }}>
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
          </div>

          <div className="min-w-0 animate-fade-up" style={{ animationDelay: "0.4s" }}>
            <ProducerMapPreview compact scrollWheelZoom={false} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
