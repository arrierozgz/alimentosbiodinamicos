import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Leaf, Save, X, Plus, Trash2 } from 'lucide-react';
import { PhotoUploader } from './PhotoUploader';
import {
  PRODUCT_CATEGORIES, PRODUCT_CATEGORY_EMOJIS,
  CERTIFICATION_TYPES, PACKAGING_OPTIONS, SEASONS,
} from '@/lib/catalogo';

interface Variation {
  id?: string;
  variety: string;
  packaging: string;
  net_price: string;
  unit: string;
}

export interface PhotoItem {
  url: string;
  thumb: string;
}

export interface ProductFormData {
  name: string;
  season: string;
  product_type: string;
  photo_url: string;
  photos: PhotoItem[];
  certifications: string[];
  variations: Variation[];
}

interface ProductFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: ProductFormData) => void;
  initialData?: ProductFormData & { id?: string };
  loading?: boolean;
}

const EMPTY_VARIATION: Variation = { variety: '', packaging: '', net_price: '', unit: 'kg' };

export function ProductForm({ open, onClose, onSave, initialData, loading }: ProductFormProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    season: '',
    product_type: '',
    photo_url: '',
    photos: [],
    certifications: [],
    variations: [{ ...EMPTY_VARIATION }],
  });

  useEffect(() => {
    if (initialData) {
      // Migrar photo_url antiguo a photos array
      let photos = initialData.photos || [];
      if (photos.length === 0 && initialData.photo_url) {
        photos = [{ url: initialData.photo_url, thumb: initialData.photo_url }];
      }
      setFormData({
        name: initialData.name || '',
        season: initialData.season || '',
        product_type: initialData.product_type || '',
        photo_url: initialData.photo_url || '',
        photos,
        certifications: initialData.certifications || [],
        variations: initialData.variations?.length
          ? initialData.variations
          : [{ ...EMPTY_VARIATION }],
      });
    } else {
      setFormData({
        name: '',
        season: '',
        product_type: '',
        photo_url: '',
        photos: [],
        certifications: [],
        variations: [{ ...EMPTY_VARIATION }],
      });
    }
  }, [initialData, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Sincronizar photo_url con la primera foto (compatibilidad)
    const data = {
      ...formData,
      photo_url: formData.photos.length > 0 ? formData.photos[0].url : '',
    };
    onSave(data);
  };

  const toggleCert = (cert: string) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.includes(cert)
        ? prev.certifications.filter(c => c !== cert)
        : [...prev.certifications, cert],
    }));
  };

  const updateVariation = (index: number, field: keyof Variation, value: string) => {
    const newVars = [...formData.variations];
    newVars[index] = { ...newVars[index], [field]: value };
    setFormData({ ...formData, variations: newVars });
  };

  const addVariation = () => {
    setFormData({ ...formData, variations: [...formData.variations, { ...EMPTY_VARIATION }] });
  };

  const removeVariation = (index: number) => {
    if (formData.variations.length <= 1) return;
    setFormData({ ...formData, variations: formData.variations.filter((_, i) => i !== index) });
  };

  const isEditing = !!initialData?.id;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="sm:max-w-lg max-h-[90vh] overflow-y-auto"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-xl">
            <Leaf className="w-5 h-5 text-primary" />
            {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          {/* Tipo de producto */}
          <div className="space-y-2">
            <Label className="text-base font-medium">Tipo de producto *</Label>
            <Select
              value={formData.product_type}
              onValueChange={(v) => setFormData({ ...formData, product_type: v })}
            >
              <SelectTrigger className="h-12 text-base">
                <SelectValue placeholder="Selecciona categoría" />
              </SelectTrigger>
              <SelectContent position="popper" className="max-h-[300px] overflow-y-auto z-[9999]">
                {PRODUCT_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {PRODUCT_CATEGORY_EMOJIS[cat] || ''} {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Nombre del producto */}
          <div className="space-y-2">
            <Label className="text-base font-medium">Nombre del producto *</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: Aceite de oliva virgen extra"
              className="h-12 text-base"
              required
            />
          </div>

          {/* Fotos (estilo Wallapop) */}
          <div className="space-y-2">
            <Label className="text-base font-medium">Fotos del producto</Label>
            <PhotoUploader
              photos={formData.photos}
              onChange={(photos) => setFormData({ ...formData, photos })}
              maxPhotos={5}
            />
          </div>

          {/* Certificaciones */}
          <div className="space-y-2">
            <Label className="text-base font-medium">Certificación</Label>
            <div className="grid grid-cols-2 gap-2">
              {CERTIFICATION_TYPES.map((cert) => (
                <button
                  key={cert.value}
                  type="button"
                  onClick={() => toggleCert(cert.value)}
                  className={`flex items-center gap-2 p-3 rounded-lg border-2 text-left transition-colors text-sm ${
                    formData.certifications.includes(cert.value)
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/30'
                  }`}
                >
                  <span className="text-lg">{cert.emoji}</span>
                  <div>
                    <div className="font-medium">{cert.label}</div>
                    <div className="text-xs text-muted-foreground">{cert.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Temporada */}
          <div className="space-y-2">
            <Label className="text-base font-medium">Temporada</Label>
            <Select
              value={formData.season}
              onValueChange={(v) => setFormData({ ...formData, season: v })}
            >
              <SelectTrigger className="h-12 text-base">
                <SelectValue placeholder="Selecciona temporada" />
              </SelectTrigger>
              <SelectContent position="popper" className="max-h-[300px] overflow-y-auto z-[9999]">
                {SEASONS.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Variaciones (variedad + envase + precio) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Variedades y formatos</Label>
              <Button type="button" variant="ghost" size="sm" onClick={addVariation}>
                <Plus className="w-4 h-4 mr-1" /> Añadir
              </Button>
            </div>

            {formData.variations.map((v, i) => (
              <div key={i} className="bg-muted/50 rounded-lg p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    Variación {i + 1}
                  </span>
                  {formData.variations.length > 1 && (
                    <Button
                      type="button" variant="ghost" size="sm"
                      className="text-destructive h-6 px-2"
                      onClick={() => removeVariation(i)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>

                <Input
                  value={v.variety}
                  onChange={(e) => updateVariation(i, 'variety', e.target.value)}
                  placeholder="Variedad (Ej: Picual, Arbequina, Hass...)"
                  className="h-10 text-sm"
                />

                <div className="grid grid-cols-3 gap-2">
                  <Select
                    value={v.packaging}
                    onValueChange={(val) => updateVariation(i, 'packaging', val)}
                  >
                    <SelectTrigger className="h-10 text-sm">
                      <SelectValue placeholder="Envase" />
                    </SelectTrigger>
                    <SelectContent position="popper" className="max-h-[300px] overflow-y-auto z-[9999]">
                      {PACKAGING_OPTIONS.map((p) => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={v.net_price}
                    onChange={(e) => updateVariation(i, 'net_price', e.target.value)}
                    placeholder="Precio €"
                    className="h-10 text-sm"
                  />

                  <Select
                    value={v.unit}
                    onValueChange={(val) => updateVariation(i, 'unit', val)}
                  >
                    <SelectTrigger className="h-10 text-sm">
                      <SelectValue placeholder="Unidad" />
                    </SelectTrigger>
                    <SelectContent position="popper" className="max-h-[300px] overflow-y-auto z-[9999]">
                      <SelectItem value="kg">por kg</SelectItem>
                      <SelectItem value="g">por g</SelectItem>
                      <SelectItem value="litro">por litro</SelectItem>
                      <SelectItem value="unidad">por unidad</SelectItem>
                      <SelectItem value="docena">por docena</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 h-12">
              <X className="w-5 h-5 mr-2" /> Cancelar
            </Button>
            <Button
              type="submit" variant="earth" className="flex-1 h-12"
              disabled={loading || !formData.name.trim() || !formData.product_type}
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" /> Guardar
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
