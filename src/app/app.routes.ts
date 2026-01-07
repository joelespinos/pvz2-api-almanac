import { Routes } from '@angular/router';
import { PageNotFound } from './view/page-not-found/page-not-found';
import { Home } from './view/home/home';
import { PlantsCatalog } from './view/plants-catalog/plants-catalog';
import { ZombiesCatalog } from './view/zombies-catalog/zombies-catalog';
import { PlantDetail } from './view/plant-detail/plant-detail';
import { ZombieDetail } from './view/zombie-detail/zombie-detail';

export const routes: Routes = [
    { path: 'home', component: Home },

    { path: 'plants', children: [
        { path: '', component: PlantsCatalog },
        { path: ':apiName', component: PlantDetail }
    ]},

    { path: 'zombies', children: [
        { path: '', component: ZombiesCatalog },
        { path: ':apiName', component: ZombieDetail }
    ]},
    
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: '**', component: PageNotFound }
];
