import { Component, inject, signal, Signal, WritableSignal } from '@angular/core';
import { PlantsManager } from '../../service/plants-manager';
import { Plant } from '../../model/plant';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PlantFamilyFilter } from '../../model/plant-family-filter';

@Component({
  selector: 'app-plants-catalog',
  imports: [RouterModule, FormsModule],
  templateUrl: './plants-catalog.html',
  styleUrl: './plants-catalog.css',
})
export class PlantsCatalog {

  private _plantsManager: PlantsManager = inject(PlantsManager);

  public plantsAlmanac: Signal<Plant[]>;
  public familyFiltersList: Signal<PlantFamilyFilter[]>;
  private _plantNameSearch: WritableSignal<string>;

  constructor() {
    this.plantsAlmanac = this._plantsManager.filteredPlantsAlmanac;
    this.familyFiltersList = this._plantsManager.familyFiltersList;
    this._plantNameSearch = signal<string>("");
  }

  public get plantNameSearch(): WritableSignal<string> {
    return this._plantNameSearch;
  }

  public isPlantNameInSearch(plantName: string): boolean {
    return this._plantsManager.isPlantNameInSearch(plantName, this.plantNameSearch());
  }

  public areAnyResultsInSearch(): boolean {
    return this._plantsManager.areAnyResultsInSearch(this.plantNameSearch());
  }

  public setFamilyFilter(searchFamily: string): void {
    return this._plantsManager.setFamilyFilter(searchFamily);
  }

}
