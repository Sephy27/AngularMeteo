import { Component, input } from '@angular/core';
import { PrevisionHoraire } from '../../models/meteo';
import { obtenirConditionMeteo } from
  '../../utils/conditions-meteo';

@Component({
  selector: 'app-previsions-horaires',
  imports: [],
  templateUrl: './previsions-horaires.html',
  styleUrl: './previsions-horaires.css'
})
export class PrevisionsHoraires {
  previsions = input.required<PrevisionHoraire[]>();
 

  readonly conditionMeteo = obtenirConditionMeteo;
}