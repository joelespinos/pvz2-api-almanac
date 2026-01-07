import { Component, computed, effect, inject, input, InputSignal, Signal } from '@angular/core';
import { Plant } from '../../model/plant';
import { PlantsManager } from '../../service/plants-manager';

@Component({
  selector: 'app-plant-detail',
  imports: [],
  templateUrl: './plant-detail.html',
  styleUrl: './plant-detail.css',
})
export class PlantDetail {
  public apiName: InputSignal<string> = input.required<string>();

  private _plantsManager: PlantsManager = inject(PlantsManager);

  private _selectedPlant: Signal<Plant>;

  constructor() {
    this._selectedPlant = this._plantsManager.selectedPlant;

    effect (() => {
      this._plantsManager.getPlantObjectByName(this.apiName());
    });
  }

  get selectedPlant(): Signal<Plant> {
    return this._selectedPlant;
  }
}
