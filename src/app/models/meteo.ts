export interface DonneesMeteoActuelle {
  time: string;
  temperature_2m: number;
  apparent_temperature: number;
  relative_humidity_2m: number;
  weather_code: number;
  wind_speed_10m: number;
  surface_pressure: number;
  is_day: number;
}

export interface ReponseMeteo {
  current: DonneesMeteoActuelle;
  hourly: DonneesMeteoHoraires;
  daily: DonneesMeteoJournalieres;
}

export interface DonneesMeteoHoraires {
  time: string[];
  temperature_2m: number[];
  apparent_temperature: number[];
  relative_humidity_2m: number[];
  weather_code: number[];
  precipitation_probability: number[];
  wind_speed_10m: number[];
  is_day: number[];
}

export interface PrevisionHoraire {
  heure: string;
  temperature: number;
  codeMeteo: number;
  risquePluie: number;
  temperatureRessentie: number;
  humidite: number;
  vitesseVent: number;
  estJour: boolean;
}

export interface DonneesMeteoJournalieres {
  time: string[];
  weather_code: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  precipitation_probability_max: number[];
  sunrise: string[];
  sunset: string[];
}

export interface PrevisionJournaliere {
  date: string;
  jour: string;
  dateFormatee: string;
  temperatureMax: number;
  temperatureMin: number;
  codeMeteo: number;
  risquePluie: number;
}
export interface ConditionMeteo {
  texte: string;
  icone: string;
}
