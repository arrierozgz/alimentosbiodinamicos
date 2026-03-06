import { useState, useRef } from 'react';
import { Camera, Plus, X, ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PhotoItem {
  url: string;
  thumb: string;
}

interface PhotoUploaderProps {
  photos: PhotoItem[];
  onChange: (photos: PhotoItem[]) => void;
  maxPhotos?: number;
}

export function PhotoUploader({ photos, onChange, maxPhotos = 5 }: PhotoUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const authData = localStorage.getItem('bio_auth');
  const token = authData ? JSON.parse(authData).token : null;

  const uploadFile = async (file: File): Promise<PhotoItem | null> => {
    const formData = new FormData();
    formData.append('photo', file);
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const remaining = maxPhotos - photos.length;
    if (remaining <= 0) return;

    setUploading(true);
    const newPhotos: PhotoItem[] = [];

    for (let i = 0; i < Math.min(files.length, remaining); i++) {
      const result = await uploadFile(files[i]);
      if (result) newPhotos.push(result);
    }

    onChange([...photos, ...newPhotos]);
    setUploading(false);
  };

  const removePhoto = async (index: number) => {
    const photo = photos[index];
    // Try to delete from server
    try {
      const filename = photo.url.split('/').pop();
      await fetch(`/api/upload/${filename}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch { /* ignore */ }
    onChange(photos.filter((_, i) => i !== index));
  };

  const slots = [];
  for (let i = 0; i < maxPhotos; i++) {
    if (i < photos.length) {
      // Photo slot
      slots.push(
        <div key={i} className="relative aspect-square rounded-xl overflow-hidden border-2 border-border group">
          <img
            src={photos[i].thumb || photos[i].url}
            alt={`Foto ${i + 1}`}
            className="w-full h-full object-cover"
          />
          {i === 0 && (
            <span className="absolute bottom-1 left-1 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded">
              PORTADA
            </span>
          )}
          <button
            type="button"
            onClick={() => removePhoto(i)}
            className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity active:opacity-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      );
    } else if (i === photos.length) {
      // Add button slot
      slots.push(
        <div key={i} className="aspect-square rounded-xl border-2 border-dashed border-primary/40 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? (
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          ) : (
            <>
              <Plus className="w-8 h-8 text-primary" />
              <span className="text-xs text-muted-foreground font-medium">Añadir foto</span>
            </>
          )}
        </div>
      );
    } else {
      // Empty slot
      slots.push(
        <div key={i} className="aspect-square rounded-xl border-2 border-dashed border-muted flex items-center justify-center">
          <ImageIcon className="w-6 h-6 text-muted" />
        </div>
      );
    }
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
        {slots}
      </div>

      {/* Action buttons for mobile */}
      {photos.length < maxPhotos && (
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => cameraInputRef.current?.click()}
            disabled={uploading}
          >
            <Camera className="w-4 h-4 mr-2" />
            Hacer foto
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <ImageIcon className="w-4 h-4 mr-2" />
            Galería
          </Button>
        </div>
      )}

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => { handleFiles(e.target.files); e.target.value = ''; }}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => { handleFiles(e.target.files); e.target.value = ''; }}
      />

      <p className="text-xs text-muted-foreground text-center">
        {photos.length}/{maxPhotos} fotos · La primera será la portada
      </p>
    </div>
  );
}
