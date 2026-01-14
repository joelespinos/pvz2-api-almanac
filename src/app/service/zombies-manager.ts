import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal, Signal, WritableSignal } from '@angular/core';
import { Zombie, DEFAULT_ZOMBIE } from '../model/zombie';

@Injectable({
  providedIn: 'root',
})
export class ZombiesManager {
  private readonly PUBLIC_URL: string = "https://pvz-2-api.vercel.app";
  private readonly BASE_URL: string = "/api";
  private readonly ZOMBIES_ENDPOINT: string = "/zombies";
  private readonly FIRST_ELEMENT: number = 0;
  private readonly DEFAULT_SEARCH_VALUE: string = "";

  private _httpClient: HttpClient = inject(HttpClient);

  private _zombiesNames: WritableSignal<string[]>;
  private _areZombiesNamesLoaded: WritableSignal<boolean>;
  private _zombiesAlmanac: WritableSignal<Zombie[]>;
  private _filteredZombiesAlmanac: Signal<Zombie[]>;
  private _zombieNameSearch: WritableSignal<string>;
  private _selectedZombie: WritableSignal<Zombie>;
  private _previousZombieName: Signal<string>;
  private _nextZombieName: Signal<string>;

  // Getters Publics
  public zombiesAlmanac: Signal<Zombie[]>;
  public filteredZombiesAlmanac: Signal<Zombie[]>;
  public zombieNameSearch: Signal<string>;
  public selectedZombie: Signal<Zombie>;
  public previousZombieName: Signal<string>;
  public nextZombieName: Signal<string>;

  constructor() {
    this._zombiesNames = signal<string[]>([]);
    this._areZombiesNamesLoaded = signal<boolean>(false);
    this._zombiesAlmanac = signal<Zombie[]>([]);
    this._zombieNameSearch = signal<string>(this.DEFAULT_SEARCH_VALUE);
    this._selectedZombie = signal<Zombie>(DEFAULT_ZOMBIE);

    // Computed de filtratge
    this._filteredZombiesAlmanac = computed(() => {
      return this._zombiesAlmanac().filter(zombie => zombie.name.toUpperCase().includes(this._zombieNameSearch().toUpperCase().trim()))
    });

    // Segons el zombie actual, actualizem el nom de l'anterior
    this._previousZombieName = computed(() => {
      let previousZombieName: string = "";
      let indexZombie: number = this._filteredZombiesAlmanac().findIndex(zombie => zombie.apiName == this._selectedZombie().apiName);

      if (indexZombie != -1) {
        if (indexZombie == this.FIRST_ELEMENT) previousZombieName = this._filteredZombiesAlmanac()[this._filteredZombiesAlmanac().length - 1].apiName;
        else previousZombieName = this._filteredZombiesAlmanac()[indexZombie - 1].apiName;
      }

      return previousZombieName;
    });

    // Segons el zombie actual, actualizem el nom del següent
    this._nextZombieName = computed(() => {
      let nextZombieName: string = "";
      let indexZombie: number = this._filteredZombiesAlmanac().findIndex(zombie => zombie.apiName == this._selectedZombie().apiName);

      if (indexZombie != -1) {
        if (indexZombie == this._filteredZombiesAlmanac().length - 1) nextZombieName = this._filteredZombiesAlmanac()[this.FIRST_ELEMENT].apiName;
        else nextZombieName = this._filteredZombiesAlmanac()[indexZombie + 1].apiName;
      }

      return nextZombieName;
    });

    // Getters publics
    this.zombiesAlmanac = this._zombiesAlmanac.asReadonly();
    this.filteredZombiesAlmanac = this._filteredZombiesAlmanac;
    this.zombieNameSearch = this._zombieNameSearch;
    this.selectedZombie = this._selectedZombie.asReadonly();
    this.previousZombieName = this._previousZombieName;
    this.nextZombieName = this._nextZombieName;

    // a partir de retrieveZombiesNames()
  }
}
