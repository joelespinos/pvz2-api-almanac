import { HttpClient } from '@angular/common/http';
import { computed, effect, inject, Injectable, signal, Signal, WritableSignal } from '@angular/core';
import { Plant } from '../model/plant';
import { PlantFamilyFilter, PLANTS_FAMILY_FILTERS } from '../model/plant-family-filter';

@Injectable({
  providedIn: 'root',
})
export class PlantsManager {
  private readonly PUBLIC_URL: string = "https://pvz-2-api.vercel.app"
  private readonly BASE_URL: string = "/api";
  private readonly PLANTS_ENDPOINT: string = "plants"
  private readonly DEFAULT_DESCRIPTION: string = "There's no description yet...";
  
  private _httpClient: HttpClient = inject(HttpClient);

  private _plantsNames: WritableSignal<string[]>;
  private _arePlantsNameLoaded: WritableSignal<boolean>;          // Booleà per controlar el moment en que la carrega de noms de plantes ha acabat
  private _plantsAlmanac: WritableSignal<Plant[]>;                // Array que contindra tots els objectes Planta
  private _filteredPlantsAlmanac: Signal<Plant[]>;                // Llista filtrada d'acord amb els filtres actius
  private _familyFilter: WritableSignal<string>;                  // Filtre per familia
  private _familyFiltersList: WritableSignal<PlantFamilyFilter[]>;// Objectes de filtratge per familia
  
  // Getters publics
  public plantsAlmanac: Signal<Plant[]>;
  public filteredPlantsAlmanac: Signal<Plant[]>;                  // Llista filtrada d'acord amb els filtres actius
  public familyFiltersList: Signal<PlantFamilyFilter[]>;

  constructor() {
    this._plantsNames = signal<string[]>([]);
    this._arePlantsNameLoaded = signal<boolean>(false);
    this._plantsAlmanac = signal<Plant[]>([]);
    this._familyFilter = signal<string>("");
    this._familyFiltersList = signal<PlantFamilyFilter[]>(PLANTS_FAMILY_FILTERS);

    // Computed de filtratge
    this._filteredPlantsAlmanac = computed(() => {
      return this._plantsAlmanac().filter(plant => plant.family.includes(this._familyFilter()));
    });
    
    this.plantsAlmanac = this._plantsAlmanac.asReadonly();
    this.filteredPlantsAlmanac = this._filteredPlantsAlmanac;
    this.familyFiltersList = this._familyFiltersList.asReadonly();
    
    this.retrievePlantsNames(); // Obtenim el nom de totes les plantes
    
    // Una vegada la carrega de noms hagi conclós crida a retrievePlantsObjects()
    effect(() => {
      if(this._arePlantsNameLoaded()) this.retrievePlantsObjects();
    });
  }

  private retrievePlantsNames(): void {

    const subscription = this._httpClient.get<string[]>(this.BASE_URL + this.PLANTS_ENDPOINT).subscribe({

      next: (value: any) => {
        this._plantsNames.set(value);
      },

      error: (error) => {
        console.error(error);
      },

      complete: () => {
        subscription.unsubscribe();
        this._arePlantsNameLoaded.set(true);  // La carrega de noms ja ha conclós
      }
      
    });
  }

  private retrievePlantsObjects(): void {

    this._plantsNames().forEach((element) => {
      let plantEndPoint = "/" + element;
      let subscription = this._httpClient.get<Plant>(this.BASE_URL + this.PLANTS_ENDPOINT + plantEndPoint).subscribe({

        next: (value: any) => {
          let newPlant = this.createDefaultPlant(); // Planta a afegir
          
          newPlant.name = value.name;
          newPlant.image = this.PUBLIC_URL + value.image;
          
          if (value.family !== undefined) newPlant.family = value.family;
          else if (value.Family !== undefined) newPlant.family = value.Family;

          if (value.description !== undefined) newPlant.description = value.description;
 
          if (value.damage !== undefined) newPlant.damage = value.damage;
          else if (value.Damage !== undefined) newPlant.damage = value.Damage;
 
          if (value.recharge !== undefined) newPlant.recharge = value.recharge;
          else if (value.Recharge !== undefined) newPlant.recharge = value.Recharge;
 
          if (value.cost !== undefined) newPlant.cost = value.cost;
          else if (value["Sun cost"] !== undefined) newPlant.cost = value["Sun cost"];
          else if (value["sun cost"] !== undefined) newPlant.cost = value["sun cost"];

          if (value.range !== undefined) newPlant.range = value.range;
          else if (value.Range !== undefined) newPlant.range = value.Range;

          if (value.duration !== undefined) newPlant.duration = value.duration;
          else if (value.Duration !== undefined) newPlant.duration = value.Duration;

          if (value.area !== undefined) newPlant.area = value.area;
          else if (value.Area !== undefined) newPlant.area = value.Area;

          if (value.special !== undefined) newPlant.special = value.special;
          else if (value.Special !== undefined) newPlant.special = value.Special;

          if (value.toughness !== undefined) newPlant.toughness = value.toughness;
          else if (value.Toughness !== undefined) newPlant.toughness = value.Toughness;

          if (value.usage !== undefined) newPlant.usage = value.usage;
          else if (value.Usage !== undefined) newPlant.usage = value.Usage;

          if (value.weakness !== undefined) newPlant.weakness = value.weakness;
          else if (value.Weakness !== undefined) newPlant.weakness = value.Weakness;

          if (value.powerup !== undefined) newPlant.powerup = value.powerup;

          if (value["damage details"] !== undefined) newPlant.damageDetails = value["damage details"];
          else if (value["Damage details"] !== undefined) newPlant.damageDetails = value["Damage details"];

          if (value["range details"] !== undefined) newPlant.rangeDetails = value["range details"];
          else if (value["Range details"] !== undefined) newPlant.rangeDetails = value["Range details"];

          if (value["sun-production"] !== undefined) newPlant.sunProduction = value["sun-production"];
          
          this._plantsAlmanac.update(plants => [...plants, newPlant]);
        },

        error: (error) => {
          console.error(error);
        },

        complete: () => {
          subscription.unsubscribe();
        }
        
      });
    });
  }

  private createDefaultPlant(): Plant {
    return {
      name: "",
      image: "",
      family: "",
      damage: 0,
      damageDetails: "",
      area: "",
      range: "",
      rangeDetails: "",
      duration: "",
      special: "",
      weakness: "",
      usage: "",
      cost: 0,
      recharge: 0,
      toughness: 0,
      powerup: "",
      sunProduction: "",
      description: this.DEFAULT_DESCRIPTION
    }
  }

  // Retorna una planta pel 'name', si no la troba, retorna una Planta buida
  public getPlantByName(name: string): Plant {
    let searchedPlant = this._plantsAlmanac().find(plant => plant.name == name);
    if (searchedPlant === undefined) searchedPlant = this.createDefaultPlant();
    return searchedPlant;
  }

  public isPlantNameInSearch(plantName: string, search: string): boolean {
    return plantName.toUpperCase().includes(search.toUpperCase().trim());
  }

  public areAnyResultsInSearch(search: string): boolean {
    let searchedPlant = this.filteredPlantsAlmanac().find(plant => plant.name.toUpperCase().includes(search.toUpperCase().trim()));
    if (searchedPlant != undefined) return true;
    else return false;
  }

  public setFamilyFilter(searchFamily: string): void {
    this._familyFilter.set(searchFamily);
  }
}
