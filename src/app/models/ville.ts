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
export interface LocalisationInverse {
  city?: string;
  locality?: string;
  principalSubdivision?: string;
  countryName?: string;
}