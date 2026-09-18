import {
  Component,
  input,
  model,
  output
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Ville } from '../../models/ville';

@Component({
  selector: 'app-recherche-ville',
  imports: [FormsModule],
  templateUrl: './recherche-ville.html',
  styleUrl: './recherche-ville.css'
})
export class RechercheVille {
  villeRecherchee = model('');

  resultats = input.required<Ville[]>();
  chargement = input(false);
  chargementPosition = input(false);
  erreur = input('');

  rechercheDemandee = output<void>();
  positionDemandee = output<void>();
  villeChoisie = output<Ville>();

  lancerRecherche(): void {
    this.rechercheDemandee.emit();
  }

  demanderPosition(): void {
    this.positionDemandee.emit();
  }

  choisirVille(ville: Ville): void {
    this.villeChoisie.emit(ville);
  }
}