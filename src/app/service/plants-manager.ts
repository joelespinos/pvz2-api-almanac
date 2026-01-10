import { HttpClient } from '@angular/common/http';
import { computed, effect, inject, Injectable, signal, Signal, WritableSignal } from '@angular/core';
import { Plant, DEFAULT_PLANT } from '../model/plant';
import { PlantFamilyFilter, PLANTS_FAMILY_FILTERS } from '../model/plant-family-filter';

@Injectable({
  providedIn: 'root',
})
export class PlantsManager {
  private readonly PUBLIC_URL: string = "https://pvz-2-api.vercel.app"
  private readonly BASE_URL: string = "/api";
  private readonly PLANTS_ENDPOINT: string = "/plants"
  private readonly FIRST_ELEMENT: number = 0;                     // Primer element de la llista de noms en el que començarem a fer peticions pels objectes
  private readonly COST_MAX_CHARS: number = 3;                    // El camp de cost sols podra tenir aquest numero de caràcters
  private readonly DEFAULT_COST_FILTER_VALUE: string = "500";     

  private _httpClient: HttpClient = inject(HttpClient);

  private _plantsNames: WritableSignal<string[]>;
  private _arePlantsNameLoaded: WritableSignal<boolean>;          // Booleà per controlar el moment en que la carrega de noms de plantes ha acabat
  private _plantsAlmanac: WritableSignal<Plant[]>;                // Array que contindra tots els objectes Planta
  private _filteredPlantsAlmanac: Signal<Plant[]>;                // Llista filtrada d'acord amb els filtres actius
  private _familyFilter: WritableSignal<string>;                  // Filtre per familia
  private _familyFiltersList: WritableSignal<PlantFamilyFilter[]>;// Objectes de filtratge per familia
  private _costFilterValue: WritableSignal<string>;               // Filtre per cost de sol
  private _selectedPlant: WritableSignal<Plant>;                  // Planta seleccionada (Detall)
  private _previousPlant: Signal<string>;                         // Nom de la planta previa a la seleccionada (Detall)
  private _nextPlant: Signal<string>;                             // Nom de la planta posterior a la seleccionada (Detall)

  // Getters publics
  public plantsAlmanac: Signal<Plant[]>;
  public filteredPlantsAlmanac: Signal<Plant[]>;                  // Llista filtrada d'acord amb els filtres actius
  public familyFiltersList: Signal<PlantFamilyFilter[]>;
  public selectedPlant: Signal<Plant>;
  public previousPlant: Signal<string>;
  public nextPlant: Signal<string>;

  constructor() {
    this._plantsNames = signal<string[]>([]);
    this._arePlantsNameLoaded = signal<boolean>(false);
    this._plantsAlmanac = signal<Plant[]>([]);
    this._familyFilter = signal<string>("");
    this._costFilterValue = signal<string>(this.DEFAULT_COST_FILTER_VALUE);
    this._familyFiltersList = signal<PlantFamilyFilter[]>(PLANTS_FAMILY_FILTERS);
    this._selectedPlant = signal<Plant>(DEFAULT_PLANT);

    // Computed de filtratge
    this._filteredPlantsAlmanac = computed(() => {
      return this._plantsAlmanac().filter(plant => plant.family.includes(this._familyFilter()) && plant.cost <= this._costFilterValue());
    });

    // Segons la planta actual, actualizem la seva anterior
    this._previousPlant = computed(() => {
      let previousPlantName: string = "";
      let indexPlant: number = this._filteredPlantsAlmanac().findIndex(plant => plant.apiName == this._selectedPlant().apiName);

      if (indexPlant != -1) {
        if (indexPlant == this.FIRST_ELEMENT) previousPlantName = this._filteredPlantsAlmanac()[this._filteredPlantsAlmanac().length - 1].apiName;
        else previousPlantName = this._filteredPlantsAlmanac()[indexPlant - 1].apiName;
      }

      return previousPlantName;
    });

    this._nextPlant = computed(() => {
      let nextPlantName: string = "";
      let indexPlant: number = this.filteredPlantsAlmanac().findIndex(plant => plant.apiName == this._selectedPlant().apiName);
      
      if (indexPlant != -1) {
        if (indexPlant == this._filteredPlantsAlmanac().length - 1) nextPlantName = this._filteredPlantsAlmanac()[this.FIRST_ELEMENT].apiName;
        else nextPlantName = this._filteredPlantsAlmanac()[indexPlant + 1].apiName;
      }

      return nextPlantName;
    });
    
    // Getters publics
    this.plantsAlmanac = this._plantsAlmanac.asReadonly();
    this.filteredPlantsAlmanac = this._filteredPlantsAlmanac;
    this.familyFiltersList = this._familyFiltersList.asReadonly();
    this.selectedPlant = this._selectedPlant.asReadonly();
    this.previousPlant = this._previousPlant;
    this.nextPlant = this._nextPlant;
    
    this.retrievePlantsNames(); // Obtenim el nom de totes les plantes al carregar el service
    
    // Una vegada la carrega de noms hagi conclós crida a retrievePlantsObjects()
    effect(() => {
      if(this._arePlantsNameLoaded()) this.retrievePlantsObjects(this.FIRST_ELEMENT); // Iniciem la crida de peticions pel primer element
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

  private retrievePlantsObjects(numElement: number): void {
    let plantEndPoint = "/" + this._plantsNames()[numElement]; // Fragment de la URL que contindra el nom de la planta a obtenir el objecte
    let subscription = this._httpClient.get<Plant>(this.BASE_URL + this.PLANTS_ENDPOINT + plantEndPoint).subscribe({

      next: (value: any) => {
        let plantToAdd = this.parseValueToPlant(value);
        plantToAdd.apiName = this._plantsNames()[numElement];
        
        this._plantsAlmanac.update(plants => [...plants, plantToAdd]); // Actualizem el array de Plantes amb la nova planta
      },

      error: (error) => {
        console.error(error);
      },

      complete: () => {
        subscription.unsubscribe();
        // Si la llargada de l'array de noms es diferent a la de objectes planta, significa que encara queden peticions per realizar
        if (this._plantsNames().length != this._plantsAlmanac().length) 
          this.retrievePlantsObjects(numElement + 1); // Tornem a cridar a la funció per sent el següent element
      }
    });
  }

  private parseValueToPlant(value: any): Plant {
    let newPlant = this.createDefaultPlant(); // Planta nova a afegir
    
    newPlant.name = value.name;
    newPlant.image = this.PUBLIC_URL + value.image;
    
    if (value.family !== undefined) newPlant.family = value.family;
    else if (value.Family !== undefined) newPlant.family = value.Family;

    if (value.description !== undefined) newPlant.description = value.description;

    // API retorna string | number, convertim a string
    if (value.damage !== undefined) newPlant.damage = value.damage.toString();
    else if (value.Damage !== undefined) newPlant.damage = value.Damage.toString();
    
    // API retorna string | number, convertim a string
    if (value.recharge !== undefined) newPlant.recharge = value.recharge.toString();
    else if (value.Recharge !== undefined) newPlant.recharge = value.Recharge.toString();
    
    if (value.cost !== undefined) newPlant.cost = this.parseCostValue(value.cost);
    else if (value["Sun cost"] !== undefined) newPlant.cost = this.parseCostValue(value["Sun cost"]);
    else if (value["sun cost"] !== undefined) newPlant.cost = this.parseCostValue(value["sun cost"]);
    
    if (value.range !== undefined) newPlant.range = value.range;
    else if (value.Range !== undefined) newPlant.range = value.Range;
    
    if (value.duration !== undefined) newPlant.duration = value.duration;
    else if (value.Duration !== undefined) newPlant.duration = value.Duration;
    
    if (value.area !== undefined) newPlant.area = value.area;
    else if (value.Area !== undefined) newPlant.area = value.Area;
    
    if (value.special !== undefined) newPlant.special = value.special;
    else if (value.Special !== undefined) newPlant.special = value.Special;
    
    // API retorna string | number, convertim a string
    if (value.toughness !== undefined) newPlant.toughness = value.toughness.toString();
    else if (value.Toughness !== undefined) newPlant.toughness = value.Toughness.toString();

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

    return newPlant;
  }

  private createDefaultPlant(): Plant {
    return {...DEFAULT_PLANT }; // Utilizem l'operador {...} per crear una nova referencia
  }

  // El valor de cost de sols pot ser o string o number, segons el que retorni l'API
  public parseCostValue(value: string | number) {
    let parsedValue = value.toString();
    if (parsedValue.length > this.COST_MAX_CHARS) parsedValue = parsedValue.substring(0, this.COST_MAX_CHARS);
    parsedValue = parsedValue.trim();
    return parsedValue;
  }

  // Realitza una petició a la API per seleccionar la Planta que es revisa el seu detall
  public getPlantObjectByName(name: string): void {
    let plantAlreadyLoaded = this._plantsAlmanac().find(plant => plant.apiName == name);

    if (plantAlreadyLoaded !== undefined) {
      this._selectedPlant.set(plantAlreadyLoaded);

    } else {
      let plantEndPoint = "/" + name; // Fragment de la URL que contindra el nom de la planta a obtenir el objecte
      let subscription = this._httpClient.get<Plant>(this.BASE_URL + this.PLANTS_ENDPOINT + plantEndPoint).subscribe({
        
        next: (value: any) => {
          this._selectedPlant.set(this.parseValueToPlant(value)); // Actualizem el array de Plantes amb la nova planta
        },
        
        error: (error) => {
          console.error(error);
        },
        
        complete: () => {
          subscription.unsubscribe();
        }
      });
    }
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
    if(this._familyFilter() == searchFamily) this._familyFilter.set("");
    else this._familyFilter.set(searchFamily);
  }

  public setCostFilter(costFilterValue: string): void {
    this._costFilterValue.set(costFilterValue);
  }
}
