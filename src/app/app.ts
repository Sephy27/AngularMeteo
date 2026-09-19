import { Component, inject, signal } from '@angular/core';
import { MeteoService } from './services/meteo';
import { Ville } from './models/ville';
import {
  PrevisionHoraire,
  PrevisionJournaliere,
  ReponseMeteo
} from './models/meteo';
import { MeteoActuelle } from
  './components/meteo-actuelle/meteo-actuelle';

import { obtenirConditionMeteo } from
  './utils/conditions-meteo';
import { PrevisionsHoraires } from
  './components/previsions-horaires/previsions-horaires';
import { PrevisionsJournalieres } from
  './components/previsions-journalieres/previsions-journalieres';
import { RechercheVille } from
  './components/recherche-ville/recherche-ville';


@Component({
  selector: 'app-root',
  imports: [
    RechercheVille,
    PrevisionsHoraires,
    MeteoActuelle,
    PrevisionsJournalieres
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private readonly meteoService = inject(MeteoService);
  readonly conditionMeteo = obtenirConditionMeteo;

  villeRecherchee = '';

  resultats = signal<Ville[]>([]);
  chargement = signal(false);
  erreur = signal('');
  chargementPosition = signal(false);
  villeSelectionnee = signal<Ville | null>(null);
  meteo = signal<ReponseMeteo | null>(null);
  chargementMeteo = signal(false);

  previsionsHoraires = signal<PrevisionHoraire[]>([]);
  previsionsJournalieres = signal<PrevisionJournaliere[]>([]);

  rechercher(): void {
    const nom = this.villeRecherchee.trim();

    if (nom.length < 2) {
      this.erreur.set('Entre au moins deux caractères.');
      this.resultats.set([]);
      return;
    }

    this.villeSelectionnee.set(null);
    this.meteo.set(null);
    this.previsionsHoraires.set([]);
    this.previsionsJournalieres.set([]);

    this.chargement.set(true);
    this.erreur.set('');
    this.resultats.set([]);

    this.meteoService.rechercherVilles(nom).subscribe({
      next: (reponse) => {
        const villes = reponse.results ?? [];

        this.resultats.set(villes);
        this.chargement.set(false);

        if (villes.length === 0) {
          this.erreur.set('Aucune ville trouvée.');
        }
      },

      error: () => {
        this.erreur.set(
          'Impossible de récupérer les villes.'
        );

        this.resultats.set([]);
        this.chargement.set(false);
      }
    });
  }

 utiliserPosition(): void {
    if (!navigator.geolocation) {
      this.erreur.set(
        'La géolocalisation n’est pas disponible.'
      );
      return;
    }

    this.chargementPosition.set(true);
    this.erreur.set('');
    this.resultats.set([]);

    navigator.geolocation.getCurrentPosition(
      position => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        this.meteoService
          .obtenirLocalisation(latitude, longitude)
          .subscribe({
            next: localisation => {
              const ville: Ville = {
                id: -1,

                name:
                  localisation.city ||
                  localisation.locality ||
                  'Ma position',

                latitude,
                longitude,

                admin1:
                  localisation.principalSubdivision ||
                  'Position actuelle',

                country:
                  localisation.countryName || ''
              };

              this.chargementPosition.set(false);
              this.choisirVille(ville);
            },

            error: () => {
              // Même si le nom de la ville est introuvable,
              // on charge quand même la météo avec les coordonnées.
              const ville: Ville = {
                id: -1,
                name: 'Ma position',
                latitude,
                longitude,
                admin1: 'Position actuelle',
                country: ''
              };

              this.chargementPosition.set(false);
              this.choisirVille(ville);
            }
          });
      },

      erreurPosition => {
        this.chargementPosition.set(false);

        switch (erreurPosition.code) {
          case 1:
            this.erreur.set(
              'L’autorisation de localisation a été refusée.'
            );
            break;

          case 2:
            this.erreur.set(
              'Votre position est actuellement indisponible.'
            );
            break;

          case 3:
            this.erreur.set(
              'La localisation a pris trop de temps.'
            );
            break;

          default:
            this.erreur.set(
              'Impossible de récupérer votre position.'
            );
        }
      },

      {
        enableHighAccuracy: false,
        timeout: 10_000,
        maximumAge: 300_000
      }
    );
  }

  choisirVille(ville: Ville): void {
    this.villeRecherchee = ville.name;
    this.resultats.set([]);

    this.villeSelectionnee.set(ville);
    this.meteo.set(null);
    this.previsionsHoraires.set([]);
    this.previsionsJournalieres.set([]);

    this.chargementMeteo.set(true);
    this.erreur.set('');

    this.meteoService
      .obtenirMeteoActuelle(
        ville.latitude,
        ville.longitude
      )
      .subscribe({
        next: (reponse) => {
          this.meteo.set(reponse);

          this.previsionsHoraires.set(
            this.extrairePrevisionsHoraires(reponse)
          );

          this.previsionsJournalieres.set(
            this.extrairePrevisionsJournalieres(reponse)
          );

          this.chargementMeteo.set(false);
        },

        error: () => {
          this.erreur.set(
            'Impossible de récupérer la météo.'
          );

          this.meteo.set(null);
          this.previsionsHoraires.set([]);
          this.previsionsJournalieres.set([]);
          this.chargementMeteo.set(false);
        }
      });
  }



  private extrairePrevisionsHoraires(
    reponse: ReponseMeteo
  ): PrevisionHoraire[] {
    const premiereHeure =
      reponse.hourly.time.findIndex(
        heure => heure >= reponse.current.time
      );

    if (premiereHeure === -1) {
      return [];
    }

    return reponse.hourly.time
      .slice(premiereHeure, premiereHeure + 12)
      .map((heure, index) => {
        const position = premiereHeure + index;

        return {
          heure,
          temperature:
            reponse.hourly.temperature_2m[position] ?? 0,
          codeMeteo:
            reponse.hourly.weather_code[position] ?? 0,
          risquePluie:
            reponse.hourly
              .precipitation_probability[position] ?? 0,
          temperatureRessentie:
            reponse.hourly.apparent_temperature[position] ?? 0,
          humidite:
            reponse.hourly.relative_humidity_2m[position] ?? 0,
          vitesseVent:
            reponse.hourly.wind_speed_10m[position] ?? 0,
          estJour:
            (reponse.hourly.is_day[position] ?? 1) === 1,
        };
      });
  }

  private extrairePrevisionsJournalieres(
    reponse: ReponseMeteo
  ): PrevisionJournaliere[] {
    return reponse.daily.time.map((date, index) => {
      const dateLocale = new Date(
        `${date}T12:00:00`
      );

      let jour = index === 0
        ? "Aujourd'hui"
        : new Intl.DateTimeFormat('fr-FR', {
            weekday: 'long'
          }).format(dateLocale);

      jour =
        jour.charAt(0).toUpperCase() +
        jour.slice(1);

      const dateFormatee =
        new Intl.DateTimeFormat('fr-FR', {
          day: 'numeric',
          month: 'short'
        }).format(dateLocale);

      return {
        date,
        jour,
        dateFormatee,

        temperatureMax:
          reponse.daily.temperature_2m_max[index] ?? 0,

        temperatureMin:
          reponse.daily.temperature_2m_min[index] ?? 0,

        codeMeteo:
          reponse.daily.weather_code[index] ?? 0,

        risquePluie:
          reponse.daily
            .precipitation_probability_max[index] ?? 0
      };
    });
  }
}
