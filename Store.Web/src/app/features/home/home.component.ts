import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  svgFiles = [
    { name: 'svg1', path: 'assets/svg/al_store.svg' },
    { name: 'svg2', path: 'assets/svg/al_store2.svg' },
    { name: 'svg3', path: 'assets/svg/klarna-svgrepo-com.svg' },
    { name: 'svg4', path: 'assets/svg/tshirt-clothes-clothing-svgrepo-com.svg' }
  ];


}
