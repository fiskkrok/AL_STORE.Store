import { Component } from '@angular/core';
import { AuthTestComponent } from "../../core/components/auth-test.component";

@Component({
  selector: 'app-home',
  imports: [AuthTestComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  svgFiles = [
    { name: 'svg1', path: 'assets/svg/alstore_white_black.svg' },
    { name: 'svg2', path: 'assets/svg/alstore_blue_black.svg' },
    { name: 'svg3', path: 'assets/svg/klarna-svgrepo-com.svg' },
    { name: 'svg4', path: 'assets/svg/tshirt-clothes-clothing-svgrepo-com.svg' }
  ];


}
