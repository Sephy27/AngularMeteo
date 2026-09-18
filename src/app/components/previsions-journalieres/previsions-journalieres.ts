import { Component, input } from '@angular/core';
import { PrevisionJournaliere } from '../../models/meteo';
import { obtenirConditionMeteo } from
  '../../utils/conditions-meteo';

@Component({
  selector: 'app-previsions-journalieres',
  imports: [],
  templateUrl: './previsions-journalieres.html',
  styleUrl: './previsions-journalieres.css'
})
export class PrevisionsJournalieres {
  previsions = input.required<PrevisionJournaliere[]>();

  readonly conditionMeteo = obtenirConditionMeteo;
}