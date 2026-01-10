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
  private readonly DEFAULT_SEARCH_VALUE: string = "";
  private readonly DEFAULT_COST_FILTER_VALUE: string = "500";
  private readonly MIN_COST_FILTER_VALUE: Signal<string> = signal<string>("0");
  private readonly MAX_COST_FILTER_VALUE: Signal<string> = signal<string>("500");

  private _plantsManager: PlantsManager = inject(PlantsManager);

  public plantsAlmanac: Signal<Plant[]>;
  public familyFiltersList: Signal<PlantFamilyFilter[]>;
  private _plantNameSearch: WritableSignal<string>;
  private _costFilter: WritableSignal<string>;

  constructor() {
    this.plantsAlmanac = this._plantsManager.filteredPlantsAlmanac;
    this.familyFiltersList = this._plantsManager.familyFiltersList;
    this._plantNameSearch = signal<string>(this.DEFAULT_SEARCH_VALUE);
    this._costFilter = signal<string>(this.DEFAULT_COST_FILTER_VALUE);
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

  public isPlantNameInSearch(plantName: string): boolean {
    return this._plantsManager.isPlantNameInSearch(plantName, this.plantNameSearch());
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

}
