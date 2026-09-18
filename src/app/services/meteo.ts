import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ReponseGeocodage, LocalisationInverse } from '../models/ville';
import { ReponseMeteo } from '../models/meteo';

@Injectable({
  providedIn: 'root'
})
export class MeteoService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    'https://geocoding-api.open-meteo.com/v1/search';

  private readonly urlGeocodageInverse =
  'https://api.bigdatacloud.net/data/reverse-geocode-client';

  rechercherVilles(nom: string): Observable<ReponseGeocodage> {
    const params = new HttpParams()
      .set('name', nom)
      .set('count', 5)
      .set('language', 'fr')
      .set('format', 'json');

    return this.http.get<ReponseGeocodage>(this.apiUrl, { params });
  }
  private readonly previsionsUrl =
  'https://api.open-meteo.com/v1/forecast';

obtenirMeteoActuelle(
  latitude: number,
  longitude: number
): Observable<ReponseMeteo> {
  const params = new HttpParams()
    .set('latitude', latitude)
    .set('longitude', longitude)
    .set(
      'current',
      'temperature_2m,apparent_temperature,is_day,relative_humidity_2m,weather_code,wind_speed_10m,surface_pressure'
    )
    .set(
      'hourly',
      'temperature_2m,weather_code,is_day,precipitation_probability'
    )
    .set(
      'daily',
      'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max'
    )
    .set(
      'daily',
      'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset'
    )
    .set('forecast_days', 7)
    .set('timezone', 'auto');

  return this.http.get<ReponseMeteo>(
    this.previsionsUrl,
    { params }
  );
}
obtenirLocalisation(
  latitude: number,
  longitude: number
): Observable<LocalisationInverse> {
  const params = new HttpParams()
    .set('latitude', latitude)
    .set('longitude', longitude)
    .set('localityLanguage', 'fr');

  return this.http.get<LocalisationInverse>(
    this.urlGeocodageInverse,
    { params }
  );
}
}