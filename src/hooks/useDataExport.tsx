import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface ExportOptions {
  includeProducts?: boolean;
  includeVariations?: boolean;
  includePreparations?: boolean;
  includeProfile?: boolean;
  includeRoles?: boolean;
}

export function useDataExport() {
  const { user } = useAuth();
  const [exporting, setExporting] = useState(false);

  const exportData = async (options: ExportOptions = {}) => {
    if (!user) {
      toast.error('Debes iniciar sesión para exportar datos');
      return;
    }

    const {
      includeProducts = true,
      includeVariations = true,
      includePreparations = true,
      includeProfile = true,
      includeRoles = true,
    } = options;

    setExporting(true);

    try {
      const exportData: Record<string, unknown> = {
        exportDate: new Date().toISOString(),
        userId: user.id,
        email: user.email,
      };

      // Export roles
      if (includeRoles) {
        const { data: roles, error: rolesError } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', user.id);
        
        if (rolesError) throw rolesError;
        exportData.roles = roles || [];
      }

      // Export farmer profile
      if (includeProfile) {
        const { data: profile, error: profileError } = await supabase
          .from('farmer_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (profileError) throw profileError;
        exportData.farmerProfile = profile;
      }

      // Export products with variations
      if (includeProducts) {
        const { data: products, error: productsError } = await supabase
          .from('products')
          .select('*')
          .eq('user_id', user.id);
        
        if (productsError) throw productsError;
        exportData.products = products || [];

        // Export variations for each product
        if (includeVariations && products && products.length > 0) {
          const productIds = products.map(p => p.id);
          const { data: variations, error: variationsError } = await supabase
            .from('product_variations')
            .select('*')
            .in('product_id', productIds);
          
          if (variationsError) throw variationsError;
          exportData.productVariations = variations || [];
        }
      }

      // Export biodynamic preparations
      if (includePreparations) {
        const { data: preparations, error: preparationsError } = await supabase
          .from('biodynamic_preparations')
          .select('*')
          .eq('user_id', user.id);
        
        if (preparationsError) throw preparationsError;
        exportData.biodynamicPreparations = preparations || [];
      }

      // Export user preferences
      const { data: preferences, error: preferencesError } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (preferencesError) throw preferencesError;
      exportData.preferences = preferences;

      // Generate and download file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `biodinamicos-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Datos exportados correctamente');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Error al exportar los datos');
    } finally {
      setExporting(false);
    }
  };

  const exportProductsCSV = async () => {
    if (!user) {
      toast.error('Debes iniciar sesión para exportar datos');
      return;
    }

    setExporting(true);

    try {
      // Fetch products
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id);
      
      if (productsError) throw productsError;

      if (!products || products.length === 0) {
        toast.info('No tienes productos para exportar');
        setExporting(false);
        return;
      }

      // Fetch variations
      const productIds = products.map(p => p.id);
      const { data: variations, error: variationsError } = await supabase
        .from('product_variations')
        .select('*')
        .in('product_id', productIds);
      
      if (variationsError) throw variationsError;

      // Create CSV content
      const headers = [
        'Nombre Producto',
        'Tipo',
        'Temporada',
        'Certificaciones',
        'Activo',
        'Variedad',
        'Unidad',
        'Precio Neto',
        'Empaquetado',
      ];

      const rows: string[][] = [];

      for (const product of products) {
        const productVariations = variations?.filter(v => v.product_id === product.id) || [];
        
        if (productVariations.length === 0) {
          // Product without variations
          rows.push([
            product.name,
            product.product_type || '',
            product.season || '',
            (product.certifications || []).join(', '),
            product.is_active ? 'Sí' : 'No',
            '',
            '',
            '',
            '',
          ]);
        } else {
          // Product with variations
          for (const variation of productVariations) {
            rows.push([
              product.name,
              product.product_type || '',
              product.season || '',
              (product.certifications || []).join(', '),
              product.is_active ? 'Sí' : 'No',
              variation.variety || '',
              variation.unit || '',
              variation.net_price?.toString() || '',
              variation.packaging || '',
            ]);
          }
        }
      }

      // Build CSV string
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
      ].join('\n');

      // Download file
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `productos-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Productos exportados correctamente');
    } catch (error) {
      console.error('Error exporting products:', error);
      toast.error('Error al exportar los productos');
    } finally {
      setExporting(false);
    }
  };

  return {
    exporting,
    exportData,
    exportProductsCSV,
  };
}
