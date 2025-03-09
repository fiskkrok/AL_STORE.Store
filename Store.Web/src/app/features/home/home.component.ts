import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  // imports: [AuthTestComponent],
  templateUrl: './home.component.html',

})
export class HomeComponent implements OnInit {
  svgFiles = [
    { name: 'svg1', path: 'assets/svg/alstore_white_black.svg' },
    { name: 'svg2', path: 'assets/svg/alstore_blue_black.svg' },
    { name: 'svg3', path: 'assets/svg/klarna-svgrepo-com.svg' },
    { name: 'svg4', path: 'assets/svg/tshirt-clothes-clothing-svgrepo-com.svg' }
  ];
  oneOrTwo = 1;

  ngOnInit(): void {
    this.oneOrTwo = Math.floor(Math.random() * 2) + 1; // Random value: 1 or 2
  }

}
