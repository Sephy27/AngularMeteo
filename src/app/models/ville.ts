export interface Ville {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
}

export interface ReponseGeocodage {
  results?: Ville[];
}