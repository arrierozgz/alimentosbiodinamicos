// Catálogo de referencia para Alimentos Biodinámicos
// Basado en categorías Demeter Internacional, adaptado a producción ibérica
// Los agricultores eligen de aquí al dar de alta sus productos

export const PRODUCT_CATEGORIES = [
  'Aceite',
  'Aguacate',
  'Carne',
  'Cereal',
  'Cosmética',
  'Detergente / Limpieza',
  'Embutido',
  'Fruta',
  'Fruto seco',
  'Hierba aromática',
  'Higiene personal',
  'Hortaliza',
  'Huevo',
  'Lácteo',
  'Legumbre',
  'Miel',
  'Oliva de mesa',
  'Pan / Panadería',
  'Seta / Trufa',
  'Textil',
  'Verdura',
  'Vino / Mosto',
  'Zumo',
  'Otro',
] as const;

export type ProductCategory = typeof PRODUCT_CATEGORIES[number];

export const PRODUCT_CATEGORY_EMOJIS: Record<string, string> = {
  'Aceite': '🫒',
  'Aguacate': '🥑',
  'Carne': '🥩',
  'Cereal': '🌾',
  'Cosmética': '🧴',
  'Detergente / Limpieza': '🧹',
  'Embutido': '🥓',
  'Fruta': '🍎',
  'Fruto seco': '🥜',
  'Hierba aromática': '🌿',
  'Higiene personal': '🧼',
  'Hortaliza': '🥕',
  'Huevo': '🥚',
  'Lácteo': '🧀',
  'Legumbre': '🫘',
  'Miel': '🍯',
  'Oliva de mesa': '🫒',
  'Pan / Panadería': '🍞',
  'Seta / Trufa': '🍄',
  'Textil': '🧵',
  'Verdura': '🥬',
  'Vino / Mosto': '🍷',
  'Zumo': '🧃',
  'Otro': '📦',
};

// Certificaciones — jerarquía definida por Carlos (3-mar-2026)
// ⚡ REGLA A FUEGO:
// - Ecológico: producción ecológica sin certificar
// - Ecológico certificado: ecológico + sello oficial
// - Biodinámico: método biodinámico, NO requiere ser ecológico
// - Demeter: biodinámico + ecológico certificado (la más exigente)
export const CERTIFICATION_TYPES = [
  { value: 'ecologico', label: 'Ecológico', emoji: '🟢', description: 'Producción ecológica' },
  { value: 'ecologico_certificado', label: 'Ecológico certificado', emoji: '🟢✅', description: 'Con sello oficial' },
  { value: 'biodinamico', label: 'Biodinámico', emoji: '🟣', description: 'Método biodinámico' },
  { value: 'demeter', label: 'Demeter', emoji: '🟡', description: 'Biodinámico + eco certificado' },
] as const;

export type CertificationType = typeof CERTIFICATION_TYPES[number]['value'];

// Envases comunes
export const PACKAGING_OPTIONS = [
  'Granel',
  'Bolsa 250g',
  'Bolsa 500g',
  'Bolsa 1kg',
  'Bolsa 2kg',
  'Botella 250ml',
  'Botella 500ml',
  'Botella 750ml',
  'Botella 1L',
  'Garrafa 2L',
  'Garrafa 5L',
  'Garrafa 10L',
  'Garrafa 20L',
  'Lata 250ml',
  'Lata 500ml',
  'Tarro 250g',
  'Tarro 500g',
  'Tarro 1kg',
  'Caja 1kg',
  'Caja 2kg',
  'Caja 5kg',
  'Caja 10kg',
  'Saco 25kg',
  'Unidad',
  'Docena',
  'Media docena',
  'Otro',
] as const;

// Temporadas
export const SEASONS = [
  'Todo el año',
  'Primavera',
  'Verano',
  'Otoño',
  'Invierno',
  'Primavera-Verano',
  'Otoño-Invierno',
] as const;
