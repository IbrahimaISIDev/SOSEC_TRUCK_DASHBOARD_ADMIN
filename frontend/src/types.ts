// types.ts - Fichier pour centraliser vos définitions de types

// Interface Camion commune
export interface Camion {
  id: string;
  nom: string;
  type: string;
  immatriculation?: string;
  assuranceDetails?: object;
  assuranceExpiration?: string;
  driverId?: string;
  syncStatus?: string;
  time?: string;
  createdAt: string;
  updatedAt: string;
}

// Interface Chauffeur commune
export interface Chauffeur {
  id: string;
  nom: string;
  email: string;
  role: 'admin' | 'driver';
  password?: string;
  permisNumero?: string;
  permisDelivrance?: Date | null;
  permisExpiration?: Date | null;
  permisLieu?: string;
  permisCategorie?: string;
  camionId?: string;
  camion?: Camion;
}

// Autres types utilisés dans votre application
export interface DecodedToken {
  id: string;
  role: string;
}
