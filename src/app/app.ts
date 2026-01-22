import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Footer } from "./view/layouts/footer/footer";

@Component({
  selector: 'app-root',
  imports: [RouterModule, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {

}
