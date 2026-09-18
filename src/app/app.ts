import { Component, inject, signal } from '@angular/core';
import { MeteoService } from './services/meteo';
import { Ville } from './models/ville';
import {
  ConditionMeteo,
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
      .slice(premiereHeure, premiereHeure + 6)
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
              .precipitation_probability[position] ?? 0
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