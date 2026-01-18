import { Component, inject, Signal, WritableSignal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ZombiesManager } from '../../service/zombies-manager';
import { Zombie } from '../../model/zombie';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-zombies-catalog',
  imports: [RouterModule, FormsModule],
  templateUrl: './zombies-catalog.html',
  styleUrl: './zombies-catalog.css',
})
export class ZombiesCatalog {

  private _zombiesManager: ZombiesManager = inject(ZombiesManager);

  public filteredZombiesAlmanac: Signal<Zombie[]>;
  private _zombieNameSearch: WritableSignal<string>;

  constructor() {
    this.filteredZombiesAlmanac = this._zombiesManager.filteredZombiesAlmanac;
    this._zombieNameSearch = this._zombiesManager.zombieNameSearch;
  }

  public get zombieNameSearch(): WritableSignal<string> {
    return this._zombieNameSearch;
  }

  public areAnyResultsInSearch(): boolean {
    return this._zombiesManager.areAnyResultsInSearch(this.zombieNameSearch());
  }
}
