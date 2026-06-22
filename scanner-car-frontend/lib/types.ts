// Tipos para la API de códigos OBD2

export interface OBDSymptom {
  id: number;
  symptom: string;
}

export interface OBDCause {
  id: number;
  cause: string;
}

export interface OBDSolution {
  id: number;
  solution: string;
}

export interface OBDCategory {
  id: number;
  code: string;
  name: string;
  description?: string;
  icon?: string;
  _count?: { codes: number };
}

export interface Manufacturer {
  id: number;
  slug: string;
  name: string;
  isGeneric: boolean;
  country?: string | null;
  logoUrl?: string | null;
  _count?: { codes: number };
}

export interface VehicleType {
  id: number;
  type: string;
  name: string;
}

export interface CodeVehicleCompat {
  id: number;
  vehicleType: VehicleType;
}

export interface ManufacturerRef {
  slug: string;
  name: string;
  isGeneric: boolean;
}

export interface OBDCode {
  id: number;
  code: string;
  title: string;
  description?: string;
  severity: 'Baja' | 'Moderada' | 'Crítica/No conducir';
  categoryId?: number;
  category?: OBDCategory;
  manufacturerId?: number;
  manufacturer?: Manufacturer;
  symptoms?: OBDSymptom[];
  causes?: OBDCause[];
  solutions?: OBDSolution[];
  vehicleCompat?: CodeVehicleCompat[];
  // Otras marcas (o el genérico SAE) que también definen este código.
  otherManufacturers?: ManufacturerRef[];
  // En resultados de búsqueda: cuántas variantes por marca existen del código.
  variantCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Una variante de un código en un fabricante concreto (endpoint /variants).
export interface CodeVariant {
  code: string;
  title: string;
  manufacturer: ManufacturerRef;
}

export interface SearchResult {
  code: string;
  title: string;
  severity: string;
}

export const CATEGORIES = {
  P: { name: 'Powertrain (Motor y Transmisión)', shortName: 'Motor (P)', color: 'red' },
  B: { name: 'Body (Carrocería)', shortName: 'Carrocería (B)', color: 'blue' },
  C: { name: 'Chassis (Chasis)', shortName: 'Chasis (C)', color: 'green' },
  U: { name: 'Network (Red de Comunicación)', shortName: 'Red (U)', color: 'purple' },
} as const;

export type CategoryKey = keyof typeof CATEGORIES;

export function getCategoryInfo(code: string): (typeof CATEGORIES)[CategoryKey] {
  const prefix = code.charAt(0).toUpperCase() as CategoryKey;
  return CATEGORIES[prefix] || CATEGORIES.P;
}
