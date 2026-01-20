import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Leaf, Save, X, AlertCircle } from 'lucide-react';

// Lista blanca de dominios de imagen seguros
const ALLOWED_IMAGE_DOMAINS = [
  'images.unsplash.com',
  'unsplash.com',
  'i.imgur.com',
  'imgur.com',
  'cloudinary.com',
  'res.cloudinary.com',
  'storage.googleapis.com',
  'firebasestorage.googleapis.com',
  'tbwsgyyaxvrbgggwmmka.supabase.co', // Supabase Storage del proyecto
];

// Extensiones de imagen válidas
const VALID_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.avif'];

// Función para validar y sanitizar URL de imagen
const validateImageUrl = (url: string): { isValid: boolean; error?: string; sanitizedUrl?: string } => {
  if (!url || url.trim() === '') {
    return { isValid: true, sanitizedUrl: '' }; // Vacío es válido (opcional)
  }

  const trimmedUrl = url.trim();
  
  // Validar longitud máxima
  if (trimmedUrl.length > 2048) {
    return { isValid: false, error: 'La URL es demasiado larga (máximo 2048 caracteres)' };
  }

  // Validar formato URL
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(trimmedUrl);
  } catch {
    return { isValid: false, error: 'Formato de URL inválido' };
  }

  // Solo permitir HTTPS (más seguro)
  if (parsedUrl.protocol !== 'https:') {
    return { isValid: false, error: 'Solo se permiten URLs seguras (HTTPS)' };
  }

  // Verificar que el dominio esté en la lista blanca
  const hostname = parsedUrl.hostname.toLowerCase();
  const isAllowedDomain = ALLOWED_IMAGE_DOMAINS.some(domain => 
    hostname === domain || hostname.endsWith('.' + domain)
  );

  if (!isAllowedDomain) {
    return { 
      isValid: false, 
      error: 'Dominio no permitido. Usa Unsplash, Imgur, Cloudinary o Supabase Storage' 
    };
  }

  // Verificar extensión de imagen (si tiene)
  const pathname = parsedUrl.pathname.toLowerCase();
  const hasValidExtension = VALID_IMAGE_EXTENSIONS.some(ext => pathname.endsWith(ext));
  const hasNoExtension = !pathname.includes('.') || pathname.endsWith('/');
  
  // Permitir URLs sin extensión (algunas CDNs usan query params) o con extensión válida
  if (!hasValidExtension && !hasNoExtension) {
    const extension = pathname.substring(pathname.lastIndexOf('.'));
    if (!VALID_IMAGE_EXTENSIONS.includes(extension)) {
      return { 
        isValid: false, 
        error: 'El archivo no parece ser una imagen válida (jpg, png, gif, webp, svg)' 
      };
    }
  }

  // Sanitizar: eliminar caracteres potencialmente peligrosos
  const sanitizedUrl = trimmedUrl
    .replace(/[<>'"]/g, '') // Eliminar caracteres HTML/JS peligrosos
    .replace(/javascript:/gi, '') // Prevenir XSS
    .replace(/data:/gi, ''); // Prevenir data URIs

  return { isValid: true, sanitizedUrl };
};

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
  const [urlError, setUrlError] = useState<string | null>(null);

  const handlePhotoUrlChange = (url: string) => {
    setFormData({ ...formData, photo_url: url });
    
    // Validar URL en tiempo real
    if (url.trim()) {
      const validation = validateImageUrl(url);
      setUrlError(validation.error || null);
    } else {
      setUrlError(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar y sanitizar URL antes de enviar
    const validation = validateImageUrl(formData.photo_url);
    if (!validation.isValid) {
      setUrlError(validation.error || 'URL inválida');
      return;
    }
    
    onSave({
      ...formData,
      photo_url: validation.sanitizedUrl || ''
    });
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
              onChange={(e) => handlePhotoUrlChange(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className={`h-12 text-base ${urlError ? 'border-destructive focus-visible:ring-destructive' : ''}`}
            />
            {urlError && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="w-4 h-4" />
                <span>{urlError}</span>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Dominios permitidos: Unsplash, Imgur, Cloudinary, Supabase Storage
            </p>
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
              disabled={loading || !formData.name.trim() || !!urlError}
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
