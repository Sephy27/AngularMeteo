import { Component, input } from '@angular/core';
import { Ville } from '../../models/ville';
import {
  ConditionMeteo,
  DonneesMeteoActuelle
} from '../../models/meteo';

@Component({
  selector: 'app-meteo-actuelle',
  imports: [],
  templateUrl: './meteo-actuelle.html',
  styleUrl: './meteo-actuelle.css'
})
export class MeteoActuelle {
  ville = input.required<Ville>();
  meteo = input.required<DonneesMeteoActuelle>();
  condition = input.required<ConditionMeteo>();
  leverSoleil = input.required<string>();
  coucherSoleil = input.required<string>();

  formaterHeure(dateHeure: string): string {
    return dateHeure
      ? dateHeure.slice(11, 16)
      : '--:--';
  }
}
