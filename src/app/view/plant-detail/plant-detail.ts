import { Component, computed, inject, input, InputSignal, Signal } from '@angular/core';
import { Plant } from '../../model/plant';
import { PlantsManager } from '../../service/plants-manager';

@Component({
  selector: 'app-plant-detail',
  imports: [],
  templateUrl: './plant-detail.html',
  styleUrl: './plant-detail.css',
})
export class PlantDetail {
  public name: InputSignal<string> = input.required<string>();

  private _plantsManager: PlantsManager = inject(PlantsManager);

  private _selectedPlant: Signal<Plant>;

  constructor() {
    this._selectedPlant = computed(() => {
      return this._plantsManager.getPlantByName(this.name());
    });
  }

  get selectedPlant(): Signal<Plant> {
    return this._selectedPlant;
  }
}
