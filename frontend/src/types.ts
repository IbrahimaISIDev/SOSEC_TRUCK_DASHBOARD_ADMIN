// Interface Camion
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

// Interface Chauffeur
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

// Interface Mileage
export interface Mileage {
  id: string;
  camionId: string;
  driverId: string;
  date: string;
  distance: number;
  imageUrl?: string;
  syncStatus: string;
  extraData: { [key: string]: any };
  time?: string;
}

// Interface Ticket
export interface Ticket {
  id: string;
  type: 'weight' | 'fuel';
  ticketNum?: string;
  dateEntrance?: string;
  dateExit?: string;
  camionId?: string;
  truckId?: string;
  product?: string;
  netWeight?: number | string;
  driver: string;
  driverId?: string;
  imageUrl?: string;
  syncStatus: string;
  extraData?: string | { [key: string]: any };
  time?: string;
}
// Interface Expense
export interface Expense {
  id: string;
  driverId: string | null;
  driverName?: string; // Ajouté pour stocker le nom du chauffeur
  type: 'carburant' | 'huile' | 'reparations' | 'autres';
  entryType: 'manual' | 'scan';
  date: string;
  quantity?: number;
  amount: number;
  description?: string;
  location?: string;
  paymentMethod?: 'cash' | 'card' | 'mobileMoney';
  imageUrl?: string;
  syncStatus: string;
  time?: string;
}

// Interface DecodedToken
export interface DecodedToken {
  id: string;
  role: 'admin' | 'driver';
}

//Je veux également faire en sorte que lorsque je récupère les dépenses, le nom du chauffeur soit directement ajouté à l'objet Expense, sans avoir à faire une requête supplémentaire pour chaque dépense. Voici comment je vais procéder :