import { Component, input } from '@angular/core';

@Component({
    selector: 'app-stack',
    standalone: true,
    template: `
    <div 
      class="flex"
      [class]="direction() === 'horizontal' ? 'flex-row space-x-4' : 'flex-col space-y-4'"
    >
      <ng-content />
    </div>
  `
})
export class StackComponent {
    direction = input<'vertical' | 'horizontal'>('vertical');
}