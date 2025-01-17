import { Component, input } from '@angular/core';

@Component({
    selector: 'app-container',
    standalone: true,
    template: `
    <div 
      class="container mx-auto px-4 sm:px-6 lg:px-8"
      [class]="size() === 'sm' ? 'max-w-3xl' : size() === 'md' ? 'max-w-5xl' : 'max-w-7xl'"
    >
      <ng-content />
    </div>
  `
})
export class ContainerComponent {
    size = input<'sm' | 'md' | 'lg'>('lg');
}