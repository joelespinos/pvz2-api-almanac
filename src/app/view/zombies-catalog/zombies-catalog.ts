import { ChangeDetectionStrategy, Component, inject, Signal, WritableSignal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ZombiesManager } from '../../service/zombies-manager';
import { Zombie } from '../../model/zombie';
import { FormsModule } from '@angular/forms';
import { DropDownFilter } from '../../model/drop-down-filter';

@Component({
  selector: 'app-zombies-catalog',
  imports: [RouterModule, FormsModule],
  templateUrl: './zombies-catalog.html',
  styleUrl: './zombies-catalog.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ZombiesCatalog {

  private _zombiesManager: ZombiesManager = inject(ZombiesManager);

  public filteredZombiesAlmanac: Signal<Zombie[]>;
  private _zombieNameSearch: WritableSignal<string>;

  public toughnessFilters: Signal<DropDownFilter[]>;
  public toughnessFilterSelected: WritableSignal<string>;
  
  public speedFilters: Signal<DropDownFilter[]>;
  public speedFilterSelected: WritableSignal<string>;
  
  public staminaFilters: Signal<DropDownFilter[]>;
  public staminaFilterSelected: WritableSignal<string>;

  constructor() {
    this.filteredZombiesAlmanac = this._zombiesManager.filteredZombiesAlmanac;
    this._zombieNameSearch = this._zombiesManager.zombieNameSearch;

    this.toughnessFilters = this._zombiesManager.toughnessFilterValues;
    this.toughnessFilterSelected = this._zombiesManager.toughnessFilterSelected;

    this.speedFilters = this._zombiesManager.speedFilterValues;
    this.speedFilterSelected = this._zombiesManager.speedFilterSelected;
    
    this.staminaFilters = this._zombiesManager.staminaFilterValues;
    this.staminaFilterSelected = this._zombiesManager.staminaFilterSelected;
  }

  public get zombieNameSearch(): WritableSignal<string> {
    return this._zombieNameSearch;
  }

  public areAnyResultsInSearch(): boolean {
    return this._zombiesManager.areAnyResultsInSearch(this.zombieNameSearch());
  }

  public cleanAllFilters(): void {
    this._zombiesManager.cleanAllFilters();
  }
}
