import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MeteoService } from './services/meteo';
import { Ville } from './models/ville';
import {
  PrevisionHoraire,
  PrevisionJournaliere,
  ReponseMeteo
} from './models/meteo';

interface ConditionMeteo {
  texte: string;
  icone: string;
}

const CONDITIONS_METEO: Record<number, ConditionMeteo> = {
  0: { texte: 'Ciel dégagé', icone: '☀️' },
  1: { texte: 'Principalement dégagé', icone: '🌤️' },
  2: { texte: 'Partiellement nuageux', icone: '⛅' },
  3: { texte: 'Couvert', icone: '☁️' },

  45: { texte: 'Brouillard', icone: '🌫️' },
  48: { texte: 'Brouillard givrant', icone: '🌫️' },

  51: { texte: 'Bruine légère', icone: '🌦️' },
  53: { texte: 'Bruine modérée', icone: '🌦️' },
  55: { texte: 'Bruine dense', icone: '🌧️' },
  56: { texte: 'Bruine verglaçante légère', icone: '🌧️' },
  57: { texte: 'Bruine verglaçante dense', icone: '🌧️' },

  61: { texte: 'Pluie faible', icone: '🌧️' },
  63: { texte: 'Pluie modérée', icone: '🌧️' },
  65: { texte: 'Pluie forte', icone: '🌧️' },
  66: { texte: 'Pluie verglaçante légère', icone: '🌧️' },
  67: { texte: 'Pluie verglaçante forte', icone: '🌧️' },

  71: { texte: 'Neige faible', icone: '🌨️' },
  73: { texte: 'Neige modérée', icone: '🌨️' },
  75: { texte: 'Neige forte', icone: '❄️' },
  77: { texte: 'Grains de neige', icone: '❄️' },

  80: { texte: 'Averses faibles', icone: '🌦️' },
  81: { texte: 'Averses modérées', icone: '🌧️' },
  82: { texte: 'Averses violentes', icone: '🌧️' },

  85: { texte: 'Averses de neige', icone: '🌨️' },
  86: { texte: 'Fortes averses de neige', icone: '🌨️' },

  95: { texte: 'Orage', icone: '⛈️' },
  96: { texte: 'Orage avec grêle légère', icone: '⛈️' },
  99: { texte: 'Orage avec forte grêle', icone: '⛈️' }
};

@Component({
  selector: 'app-root',
  imports: [FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private readonly meteoService = inject(MeteoService);

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

  conditionMeteo(code: number): ConditionMeteo {
    return CONDITIONS_METEO[code] ?? {
      texte: 'Conditions inconnues',
      icone: '❓'
    };
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