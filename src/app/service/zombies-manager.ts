import { HttpClient } from '@angular/common/http';
import { computed, effect, inject, Injectable, signal, Signal, WritableSignal } from '@angular/core';
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
  public zombieNameSearch: WritableSignal<string>;
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

    this.retrieveZombiesNames(); // Obtenim el nom de tots els zombies al carregar el service

    // Una vegada la carrega de noms hagi conclós crida a retrievePlantsObjects()
    effect(() => {
      if(this._areZombiesNamesLoaded()) this.retrieveZombiesObjects(this.FIRST_ELEMENT); // Iniciem la crida de peticions pel primer element
    });
  }

  private retrieveZombiesNames() {
    
    const subscription = this._httpClient.get<string[]>(this.BASE_URL + this.ZOMBIES_ENDPOINT).subscribe({

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
    let subscription = this._httpClient.get<Zombie>(this.BASE_URL + this.ZOMBIES_ENDPOINT + zombieEndPoint).subscribe({
      
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
    newZombie.image = this.PUBLIC_URL + value.image;

    if (value.toughness !== undefined) newZombie.toughness = value.toughness.toString();
    else if (value.Toughness !== undefined) newZombie.toughness = value.Toughness.toString();

    if (value.speed !== undefined) newZombie.speed = value.speed.toString();
    else if (value.Speed !== undefined) newZombie.speed = value.Speed.toString();

    if (value.stamina !== undefined) newZombie.stamina = value.stamina.toString();
    else if (value.Stamina !== undefined) newZombie.stamina = value.Stamina.toString();

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
      let subscription = this._httpClient.get<Zombie>(this.BASE_URL + this.ZOMBIES_ENDPOINT + zombieEndPoint).subscribe({
      
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
}
