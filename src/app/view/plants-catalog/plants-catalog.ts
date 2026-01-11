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
  private readonly MIN_COST_FILTER_VALUE: Signal<string> = signal<string>("0");
  private readonly MAX_COST_FILTER_VALUE: Signal<string> = signal<string>("500");

  private _plantsManager: PlantsManager = inject(PlantsManager);

  public plantsAlmanac: Signal<Plant[]>;                  // Llista d'objectes Plant ja filtrada
  public familyFiltersList: Signal<PlantFamilyFilter[]>;  // Array dels objectes de filtres de familia
  private _familyFilterSelected: Signal<string>;          // Nom del filtre de familia seleccionat
  private _plantNameSearch: WritableSignal<string>;
  private _costFilter: WritableSignal<string>;

  constructor() {
    this.plantsAlmanac = this._plantsManager.filteredPlantsAlmanac;
    this.familyFiltersList = this._plantsManager.familyFiltersList;
    this._familyFilterSelected = this._plantsManager.familyFilter;
    this._plantNameSearch = this._plantsManager.plantNameSearch;
    this._costFilter = this._plantsManager.costFilterValue;
  }

  public get plantNameSearch(): WritableSignal<string> {
    return this._plantNameSearch;
  }

  public get costFilter(): WritableSignal<string> {
    return this._costFilter;
  }

  public get minCostValue(): Signal<string> {
    return this.MIN_COST_FILTER_VALUE;
  }

  public get maxCostValue(): Signal<string> {
    return this.MAX_COST_FILTER_VALUE;
  }

  public areAnyResultsInSearch(): boolean {
    return this._plantsManager.areAnyResultsInSearch(this.plantNameSearch());
  }

  public setFamilyFilter(searchFamily: string): void {
    this._plantsManager.setFamilyFilter(searchFamily);
  }

  public setCostFilter(): void {
    this._plantsManager.setCostFilter(this._costFilter());
  }

  public getFamilyFilterStyle(familyFilterName: string): string {
    return this._plantsManager.getFamilyFilterStyle(familyFilterName);
  }

  public cleanAllFilters(): void {
    this._plantsManager.cleanAllFilters();
  }
}
