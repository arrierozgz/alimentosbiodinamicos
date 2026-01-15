import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Leaf, Save, X } from 'lucide-react';

interface ProductFormData {
  name: string;
  season: string;
  product_type: string;
  photo_url: string;
}

interface ProductFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: ProductFormData) => void;
  initialData?: ProductFormData & { id?: string };
  loading?: boolean;
}

const SEASONS = [
  'Todo el año',
  'Primavera',
  'Verano',
  'Otoño',
  'Invierno',
  'Primavera-Verano',
  'Otoño-Invierno',
];

const PRODUCT_TYPES = [
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
  'Otro',
];

export function ProductForm({ open, onClose, onSave, initialData, loading }: ProductFormProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    name: initialData?.name || '',
    season: initialData?.season || '',
    product_type: initialData?.product_type || '',
    photo_url: initialData?.photo_url || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const isEditing = !!initialData?.id;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-xl">
            <Leaf className="w-5 h-5 text-primary" />
            {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-base font-medium">
              Nombre del producto *
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: Tomates cherry"
              className="h-12 text-base"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="product_type" className="text-base font-medium">
              Tipo de producto
            </Label>
            <Select 
              value={formData.product_type} 
              onValueChange={(value) => setFormData({ ...formData, product_type: value })}
            >
              <SelectTrigger className="h-12 text-base">
                <SelectValue placeholder="Selecciona tipo" />
              </SelectTrigger>
              <SelectContent>
                {PRODUCT_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="season" className="text-base font-medium">
              Temporada
            </Label>
            <Select 
              value={formData.season} 
              onValueChange={(value) => setFormData({ ...formData, season: value })}
            >
              <SelectTrigger className="h-12 text-base">
                <SelectValue placeholder="Selecciona temporada" />
              </SelectTrigger>
              <SelectContent>
                {SEASONS.map((season) => (
                  <SelectItem key={season} value={season}>
                    {season}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="photo_url" className="text-base font-medium">
              URL de la foto (opcional)
            </Label>
            <Input
              id="photo_url"
              type="url"
              value={formData.photo_url}
              onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
              placeholder="https://..."
              className="h-12 text-base"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 h-12 text-base"
            >
              <X className="w-5 h-5 mr-2" />
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="earth"
              className="flex-1 h-12 text-base"
              disabled={loading || !formData.name.trim()}
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Guardar
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
