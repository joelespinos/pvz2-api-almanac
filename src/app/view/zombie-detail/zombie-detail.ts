import { Component, effect, inject, input, InputSignal, Signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ZombiesManager } from '../../service/zombies-manager';
import { Zombie } from '../../model/zombie';

@Component({
  selector: 'app-zombie-detail',
  imports: [RouterModule],
  templateUrl: './zombie-detail.html',
  styleUrl: './zombie-detail.css',
})
export class ZombieDetail {
  public apiName: InputSignal<string> = input.required<string>();

  private _zombiesManager: ZombiesManager = inject(ZombiesManager);

  private _selectedZombie: Signal<Zombie>;
  private _previousZombieName: Signal<string>;
  private _nextZombieName: Signal<string>;

  constructor() {
    this._selectedZombie = this._zombiesManager.selectedZombie;
    this._previousZombieName = this._zombiesManager.previousZombieName;
    this._nextZombieName = this._zombiesManager.nextZombieName;

    effect (() => {
      this._zombiesManager.getZombieObjectByName(this.apiName());
    });
  }

  get selectedZombie(): Signal<Zombie> {
    return this._selectedZombie;
  }

  get previousZombieName(): Signal<string> {
    return this._previousZombieName;
  }

  get nextZombieName(): Signal<string> {
    return this._nextZombieName;
  }
}
