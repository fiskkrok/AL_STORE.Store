import { Component, input } from '@angular/core';

@Component({
    selector: 'app-grid',
    standalone: true,
    template: `
    <div 
      class="grid gap-x-4 gap-y-6"
      [class]="cols() === 1 ? 'grid-cols-1' : 
               cols() === 2 ? 'grid-cols-1 md:grid-cols-2' :
               cols() === 3 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' :
               'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'"
    >
      <ng-content />
    </div>
  `
})
export class GridComponent {
    cols = input<1 | 2 | 3 | 4>(4);
}