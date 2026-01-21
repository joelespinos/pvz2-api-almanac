import { HttpClient } from '@angular/common/http';
import { computed, effect, inject, Injectable, signal, Signal, WritableSignal } from '@angular/core';
import { Zombie, DEFAULT_ZOMBIE } from '../model/zombie';
import { DropDownFilter, DEFAULT_DROPDOWN_FILTER } from '../model/drop-down-filter';
import { API_CONFIG } from '../config/api-config';

@Injectable({
  providedIn: 'root',
})
export class ZombiesManager {
  private readonly FIRST_ELEMENT: number = 0;
  private readonly DEFAULT_SEARCH_VALUE: string = "";

  private _httpClient: HttpClient = inject(HttpClient);

  private _zombiesNames: WritableSignal<string[]>;
  private _areZombiesNamesLoaded: WritableSignal<boolean>;
  private _zombiesAlmanac: WritableSignal<Zombie[]>;
  private _filteredZombiesAlmanac: Signal<Zombie[]>;
  private _zombieNameSearch: WritableSignal<string>;

  private _toughnessFilterValues: WritableSignal<DropDownFilter[]>;         // Contindra tots els valors del dropdown de toughness
  private _toughnessFilterSelected: WritableSignal<string>;                 // Filtre de toughness seleccionat
  
  private _speedFilterValues: WritableSignal<DropDownFilter[]>;             // Contindra tots els valors del dropdown de speed
  private _speedFilterSelected: WritableSignal<string>;                     // Filtre de speed seleccionat
  
  private _staminaFilterValues: WritableSignal<DropDownFilter[]>;           // Contindra tots els valors del dropdown de stamina
  private _staminaFilterSelected: WritableSignal<string>;                   // Filtre de stamina seleccionat

  private _selectedZombie: WritableSignal<Zombie>;
  private _previousZombieName: Signal<string>;
  private _nextZombieName: Signal<string>;

  // Getters Publics
  public zombiesAlmanac: Signal<Zombie[]>;
  public filteredZombiesAlmanac: Signal<Zombie[]>;
  public zombieNameSearch: WritableSignal<string>;

  public toughnessFilterValues: Signal<DropDownFilter[]>;
  public toughnessFilterSelected: WritableSignal<string>;

  public speedFilterValues: Signal<DropDownFilter[]>;
  public speedFilterSelected: WritableSignal<string>;

  public staminaFilterValues: Signal<DropDownFilter[]>;
  public staminaFilterSelected: WritableSignal<string>;

  public selectedZombie: Signal<Zombie>;
  public previousZombieName: Signal<string>;
  public nextZombieName: Signal<string>;

  constructor() {
    this._zombiesNames = signal<string[]>([]);
    this._areZombiesNamesLoaded = signal<boolean>(false);
    this._zombiesAlmanac = signal<Zombie[]>([]);
    this._zombieNameSearch = signal<string>(this.DEFAULT_SEARCH_VALUE);

    this._toughnessFilterValues = signal<DropDownFilter[]>([DEFAULT_DROPDOWN_FILTER]);
    this._toughnessFilterSelected = signal<string>(DEFAULT_DROPDOWN_FILTER.value);

    this._speedFilterValues = signal<DropDownFilter[]>([DEFAULT_DROPDOWN_FILTER]);
    this._speedFilterSelected = signal<string>(DEFAULT_DROPDOWN_FILTER.value);

    this._staminaFilterValues = signal<DropDownFilter[]>([DEFAULT_DROPDOWN_FILTER]);
    this._staminaFilterSelected = signal<string>(DEFAULT_DROPDOWN_FILTER.value);
    
    this._selectedZombie = signal<Zombie>(DEFAULT_ZOMBIE);

    // Computed de filtratge
    this._filteredZombiesAlmanac = computed(() => {
      return this._zombiesAlmanac().filter(zombie => zombie.name.toUpperCase().includes(this._zombieNameSearch().toUpperCase().trim()) &&
                                            zombie.toughness.includes(this.toughnessFilterSelected()) &&
                                            zombie.speed.includes(this.speedFilterSelected()) &&
                                            zombie.stamina.includes(this.staminaFilterSelected()));
    });

    // Segons el zombie actual, actualizem el nom de l'anterior
    this._previousZombieName = computed(() => { return this.getPreviousZombieName() });

    // Segons el zombie actual, actualizem el nom del següent
    this._nextZombieName = computed(() => { return this.getNextZombieName() });

    // Getters publics
    this.zombiesAlmanac = this._zombiesAlmanac.asReadonly();
    this.filteredZombiesAlmanac = this._filteredZombiesAlmanac;
    this.zombieNameSearch = this._zombieNameSearch;

    this.toughnessFilterValues = this._toughnessFilterValues.asReadonly();
    this.toughnessFilterSelected = this._toughnessFilterSelected;

    this.speedFilterValues = this._speedFilterValues.asReadonly();
    this.speedFilterSelected = this._speedFilterSelected;

    this.staminaFilterValues = this._staminaFilterValues.asReadonly();
    this.staminaFilterSelected = this._staminaFilterSelected;

    this.selectedZombie = this._selectedZombie.asReadonly();
    this.previousZombieName = this._previousZombieName;
    this.nextZombieName = this._nextZombieName;

    this.retrieveZombiesNames(); // Obtenim el nom de tots els zombies al carregar el service

    // Una vegada la carrega de noms hagi conclós crida a retrievePlantsObjects()
    effect(() => {
      if(this._areZombiesNamesLoaded()) this.retrieveZombiesObjects(this.FIRST_ELEMENT); // Iniciem la crida de peticions pel primer element
    });
  }

  private retrieveZombiesNames() {
    
    const subscription = this._httpClient.get<string[]>(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.ZOMBIES_ENDPOINT,
      { headers: API_CONFIG.HEADERS }
    ).subscribe({

      next: (value: any) => {
        this._zombiesNames.set(value);
      },

      error: (error) => {
        console.error(error);
      },

      complete: () => {
        subscription.unsubscribe();
        this._areZombiesNamesLoaded.set(true);
      }

    });
  }

  private retrieveZombiesObjects(numElement: number): void {
    let zombieEndPoint = "/" + this._zombiesNames()[numElement];
    let subscription = this._httpClient.get<Zombie>(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.ZOMBIES_ENDPOINT + zombieEndPoint,
      { headers: API_CONFIG.HEADERS }
    ).subscribe({
      
      next: (value) => {
        let zombieToAdd = this.parseValueToZombie(value);
        zombieToAdd.apiName = this._zombiesNames()[numElement];

        this._zombiesAlmanac.update(zombies => [...zombies, zombieToAdd]);
      },

      error: (error) => {
        console.error(error);
      },

      complete: () => {
        subscription.unsubscribe();

        if (this._zombiesNames().length != this._zombiesAlmanac().length)
          this.retrieveZombiesObjects(numElement + 1);
      },
    });
  }

  private parseValueToZombie(value: any): Zombie {
    let newZombie = this.createDefaultZombie();

    newZombie.name = value.name;
    newZombie.image = API_CONFIG.PUBLIC_URL + value.image;

    if (value.toughness !== undefined) newZombie.toughness = value.toughness.toString();
    else if (value.Toughness !== undefined) newZombie.toughness = value.Toughness.toString();

    // Si l'atribut toughness del zombie encara no esta dins de la llista de filtres, s'afegeix
    if (!this._toughnessFilterValues().some(filterValue => filterValue.value == newZombie.toughness)) {
      this._toughnessFilterValues.update(values => [...values, {
        label: newZombie.toughness.toUpperCase(), 
        value: newZombie.toughness
      }]);
    }

    if (value.speed !== undefined) newZombie.speed = value.speed.toString();
    else if (value.Speed !== undefined) newZombie.speed = value.Speed.toString();

    if (!this._speedFilterValues().some(filterValue => filterValue.value == newZombie.speed)) {
      this._speedFilterValues.update(values => [...values, {
        label: newZombie.speed.toUpperCase(), 
        value: newZombie.speed
      }]);
    }

    if (value.stamina !== undefined) newZombie.stamina = value.stamina.toString();
    else if (value.Stamina !== undefined) newZombie.stamina = value.Stamina.toString();

    if (!this._staminaFilterValues().some(filterValue => filterValue.value == newZombie.stamina)) {
      this._staminaFilterValues.update(values => [...values, {
        label: newZombie.stamina.toUpperCase(), 
        value: newZombie.stamina
      }]);
    }

    if (value.description !== undefined) newZombie.description = value.description;

    return newZombie;
  }

  private createDefaultZombie(): Zombie {
    return { ...DEFAULT_ZOMBIE };
  }

  public getZombieObjectByName(name: string): void {
    let zombieAlreadyLoaded = this._zombiesAlmanac().find(zombie => zombie.apiName == name);

    if (zombieAlreadyLoaded !== undefined) {
      this._selectedZombie.set(zombieAlreadyLoaded);
    
    } else {
      let zombieEndPoint = "/" + name;
      let subscription = this._httpClient.get<Zombie>(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.ZOMBIES_ENDPOINT + zombieEndPoint,
        { headers: API_CONFIG.HEADERS }
      ).subscribe({
      
        next: (value) => {
          this._selectedZombie.set(this.parseValueToZombie(value));
        },

        error: (error) => {
          console.error(error);
        },

        complete: () => {
          subscription.unsubscribe();
        },
      });
    }
  }

  public areAnyResultsInSearch(search: string): boolean {
    let searchedZombie = this._filteredZombiesAlmanac().find(zombie => zombie.name.toUpperCase().includes(search.toUpperCase().trim()));
    if (searchedZombie != undefined) return true;
    else return false;
  }

  public getPreviousZombieName(): string {
    let previousZombieName: string = "";
    let indexZombie: number = this._filteredZombiesAlmanac().findIndex(zombie => zombie.apiName == this._selectedZombie().apiName);

    if (indexZombie != -1) {
      if (indexZombie == this.FIRST_ELEMENT) previousZombieName = this._filteredZombiesAlmanac()[this._filteredZombiesAlmanac().length - 1].apiName;
      else previousZombieName = this._filteredZombiesAlmanac()[indexZombie - 1].apiName;
    }

    return previousZombieName;
  }

  public getNextZombieName(): string {
    let nextZombieName: string = "";
    let indexZombie: number = this._filteredZombiesAlmanac().findIndex(zombie => zombie.apiName == this._selectedZombie().apiName);

    if (indexZombie != -1) {
      if (indexZombie == this._filteredZombiesAlmanac().length - 1) nextZombieName = this._filteredZombiesAlmanac()[this.FIRST_ELEMENT].apiName;
      else nextZombieName = this._filteredZombiesAlmanac()[indexZombie + 1].apiName;
    }

    return nextZombieName;
  }

  public cleanAllFilters(): void {
    this._toughnessFilterSelected.set(DEFAULT_DROPDOWN_FILTER.value);
    this._speedFilterSelected.set(DEFAULT_DROPDOWN_FILTER.value);
    this._staminaFilterSelected.set(DEFAULT_DROPDOWN_FILTER.value);
  }
}
