import { Component, computed, effect, inject, input, InputSignal, Signal } from '@angular/core';
import { Plant } from '../../model/plant';
import { PlantsManager } from '../../service/plants-manager';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-plant-detail',
  imports: [RouterModule],
  templateUrl: './plant-detail.html',
  styleUrl: './plant-detail.css',
})
export class PlantDetail {
  public apiName: InputSignal<string> = input.required<string>();

  private _plantsManager: PlantsManager = inject(PlantsManager);

  private _selectedPlant: Signal<Plant>;
  private _previousPlantName: Signal<string>;
  private _nextPlantName: Signal<string>;

  constructor() {
    this._selectedPlant = this._plantsManager.selectedPlant;
    this._previousPlantName = this._plantsManager.previousPlant;
    this._nextPlantName = this._plantsManager.nextPlant;

    effect (() => {
      this._plantsManager.getPlantObjectByName(this.apiName());
    });
  }

  get selectedPlant(): Signal<Plant> {
    return this._selectedPlant;
  }

  get previousPlantName(): Signal<string> {
    return this._previousPlantName;
  }

  get nextPlantName(): Signal<string> {
    return this._nextPlantName;
  }
}
