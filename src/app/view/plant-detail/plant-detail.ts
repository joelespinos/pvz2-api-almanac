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
  private _arePlantsLoaded: Signal<boolean>;

  constructor() {
    this._selectedPlant = computed(() => {
      return this._plantsManager.getPlantByName(this.name());
    });
    this._arePlantsLoaded = this._plantsManager.arePlantsObjectsLoaded;
  }

  get selectedPlant(): Signal<Plant> {
    return this._selectedPlant;
  }

  get arePlantsLoaded(): Signal<boolean> {
    return this._arePlantsLoaded;
  }
}
