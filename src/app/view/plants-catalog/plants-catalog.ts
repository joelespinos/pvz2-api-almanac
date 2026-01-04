import { Component, inject, Signal } from '@angular/core';
import { PlantsManager } from '../../service/plants-manager';
import { Plant } from '../../model/plant';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-plants-catalog',
  imports: [RouterModule],
  templateUrl: './plants-catalog.html',
  styleUrl: './plants-catalog.css',
})
export class PlantsCatalog {

  private _plantsManager: PlantsManager = inject(PlantsManager);

  public plantsAlmanac: Signal<Plant[]>;

  constructor() {
    this.plantsAlmanac = this._plantsManager.plantsAlmanac;
  }

}
