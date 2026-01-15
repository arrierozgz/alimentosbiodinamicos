import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Pencil, Leaf, ImageIcon } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  photo_url: string | null;
  season: string | null;
  is_active: boolean;
}

interface ProductCardProps {
  product: Product;
  onToggleActive: (id: string, isActive: boolean) => void;
  onEdit: (product: Product) => void;
}

export function ProductCard({ product, onToggleActive, onEdit }: ProductCardProps) {
  return (
    <Card className="overflow-hidden bg-card border-border hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4 p-4">
        {/* Photo */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-muted flex-shrink-0">
          {product.photo_url ? (
            <img 
              src={product.photo_url} 
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary/10">
              <Leaf className="w-8 h-8 text-primary/50" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-lg font-semibold text-foreground truncate">
            {product.name}
          </h3>
          {product.season && (
            <p className="text-sm text-muted-foreground mt-1">
              🗓️ {product.season}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col items-center gap-3">
          {/* Toggle Active */}
          <div className="flex flex-col items-center">
            <Switch
              checked={product.is_active}
              onCheckedChange={(checked) => onToggleActive(product.id, checked)}
              className="data-[state=checked]:bg-primary scale-125"
            />
            <span className={`text-xs mt-1 font-medium ${product.is_active ? 'text-primary' : 'text-muted-foreground'}`}>
              {product.is_active ? 'Activo' : 'Pausa'}
            </span>
          </div>
          
          {/* Edit Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => onEdit(product)}
            className="h-10 w-10 rounded-full"
          >
            <Pencil className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
