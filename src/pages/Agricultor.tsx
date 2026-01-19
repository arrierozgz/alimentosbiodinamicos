import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/agricultor/ProductCard';
import { ProductForm } from '@/components/agricultor/ProductForm';
import { ExportDataButton } from '@/components/ExportDataButton';
import { Plus, Leaf, LogOut, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  photo_url: string | null;
  season: string | null;
  is_active: boolean;
  product_type: string | null;
}

export default function Agricultor() {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProducts();
    }
  }, [user]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: isActive })
        .eq('id', id);

      if (error) throw error;
      
      setProducts(products.map(p => 
        p.id === id ? { ...p, is_active: isActive } : p
      ));
      
      toast.success(isActive ? 'Producto activado' : 'Producto en pausa');
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Error al actualizar');
    }
  };

  const handleSaveProduct = async (data: { name: string; season: string; product_type: string; photo_url: string }) => {
    setSaving(true);
    try {
      if (editingProduct) {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update({
            name: data.name,
            season: data.season || null,
            product_type: data.product_type || null,
            photo_url: data.photo_url || null,
          })
          .eq('id', editingProduct.id);

        if (error) throw error;
        toast.success('Producto actualizado');
      } else {
        // Create new product
        const { error } = await supabase
          .from('products')
          .insert({
            user_id: user?.id,
            name: data.name,
            season: data.season || null,
            product_type: data.product_type || null,
            photo_url: data.photo_url || null,
          });

        if (error) throw error;
        toast.success('Producto creado');
      }

      setFormOpen(false);
      setEditingProduct(null);
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingProduct(null);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Leaf className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-lg font-semibold">Mi Huerta</h1>
              <p className="text-xs text-muted-foreground">Gestiona tus productos</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ExportDataButton variant="compact" />
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Add Product Button */}
        <Button
          variant="earth"
          size="xl"
          className="w-full mb-6 h-16 text-lg gap-3"
          onClick={() => setFormOpen(true)}
        >
          <Plus className="w-6 h-6" />
          Añadir Producto
        </Button>

        {/* Products List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Leaf className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="font-display text-xl font-semibold text-foreground mb-2">
              Sin productos aún
            </h3>
            <p className="text-muted-foreground">
              Añade tu primer producto para empezar
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onToggleActive={handleToggleActive}
                onEdit={handleEdit}
              />
            ))}
          </div>
        )}
      </main>

      {/* Product Form Modal */}
      <ProductForm
        open={formOpen}
        onClose={handleCloseForm}
        onSave={handleSaveProduct}
        initialData={editingProduct ? {
          id: editingProduct.id,
          name: editingProduct.name,
          season: editingProduct.season || '',
          product_type: editingProduct.product_type || '',
          photo_url: editingProduct.photo_url || '',
        } : undefined}
        loading={saving}
      />
    </div>
  );
}
