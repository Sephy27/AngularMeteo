import { ConditionMeteo } from '../models/meteo';

const cheminIcone = (nom: string): string =>
  `/weather-icons/${nom}.svg`;

interface VarianteJourNuit {
  jour: string;
  nuit: string;
}

const VARIANTES_JOUR_NUIT: Partial<
  Record<number, VarianteJourNuit>
> = {
  0: {
    jour: 'clear-day',
    nuit: 'clear-night',
  },
  1: {
    jour: 'mostly-clear-day',
    nuit: 'mostly-clear-night',
  },
  2: {
    jour: 'partly-cloudy-day',
    nuit: 'partly-cloudy-night',
  },
  45: {
    jour: 'fog-day',
    nuit: 'fog-night',
  },
  48: {
    jour: 'fog-day',
    nuit: 'fog-night',
  },
};

const CONDITIONS_METEO: Record<number, ConditionMeteo> = {
  0: {
    texte: 'Ciel dégagé',
    icone: cheminIcone('clear-day'),
  },
  1: {
    texte: 'Principalement dégagé',
    icone: cheminIcone('mostly-clear-day'),
  },
  2: {
    texte: 'Partiellement nuageux',
    icone: cheminIcone('partly-cloudy-day'),
  },
  3: {
    texte: 'Couvert',
    icone: cheminIcone('overcast'),
  },

  45: {
    texte: 'Brouillard',
    icone: cheminIcone('fog'),
  },
  48: {
    texte: 'Brouillard givrant',
    icone: cheminIcone('fog'),
  },

  51: {
    texte: 'Bruine légère',
    icone: cheminIcone('drizzle'),
  },
  53: {
    texte: 'Bruine modérée',
    icone: cheminIcone('drizzle'),
  },
  55: {
    texte: 'Bruine forte',
    icone: cheminIcone('overcast-drizzle'),
  },

  56: {
    texte: 'Bruine verglaçante légère',
    icone: cheminIcone('sleet'),
  },
  57: {
    texte: 'Bruine verglaçante forte',
    icone: cheminIcone('extreme-sleet'),
  },

  61: {
    texte: 'Pluie légère',
    icone: cheminIcone('rain'),
  },
  63: {
    texte: 'Pluie modérée',
    icone: cheminIcone('rain'),
  },
  65: {
    texte: 'Pluie forte',
    icone: cheminIcone('extreme-rain'),
  },

  66: {
    texte: 'Pluie verglaçante légère',
    icone: cheminIcone('sleet'),
  },
  67: {
    texte: 'Pluie verglaçante forte',
    icone: cheminIcone('extreme-sleet'),
  },

  71: {
    texte: 'Neige légère',
    icone: cheminIcone('snow'),
  },
  73: {
    texte: 'Neige modérée',
    icone: cheminIcone('snow'),
  },
  75: {
    texte: 'Neige forte',
    icone: cheminIcone('extreme-snow'),
  },
  77: {
    texte: 'Grains de neige',
    icone: cheminIcone('snow'),
  },

  80: {
    texte: 'Averses légères',
    icone: cheminIcone('rain'),
  },
  81: {
    texte: 'Averses modérées',
    icone: cheminIcone('rain'),
  },
  82: {
    texte: 'Averses violentes',
    icone: cheminIcone('extreme-rain'),
  },

  85: {
    texte: 'Averses de neige légères',
    icone: cheminIcone('snow'),
  },
  86: {
    texte: 'Averses de neige fortes',
    icone: cheminIcone('extreme-snow'),
  },

  95: {
    texte: 'Orage',
    icone: cheminIcone('thunderstorms'),
  },
  96: {
    texte: 'Orage avec grêle',
    icone: cheminIcone('thunderstorms-hail'),
  },
  99: {
    texte: 'Orage violent avec grêle',
    icone: cheminIcone('extreme-thunderstorms-hail'),
  },
};

export function obtenirConditionMeteo(
  code: number,
  estJour = true,
): ConditionMeteo {
  const condition =
    CONDITIONS_METEO[code] ?? {
      texte: 'Conditions inconnues',
      icone: cheminIcone('not-available'),
    };

  const variante = VARIANTES_JOUR_NUIT[code];

  if (!variante) {
    return condition;
  }

  return {
    ...condition,
    icone: cheminIcone(
      estJour ? variante.jour : variante.nuit,
    ),
  };
}