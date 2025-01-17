import { Component, input } from '@angular/core';

@Component({
    selector: 'app-section',
    standalone: true,
    template: `
    <section 
      [class]="spacing() === 'none' ? '' : spacing() === 'sm' ? 'py-8' : 'py-16'"
    >
      <ng-content />
    </section>
  `
})
export class SectionComponent {
    spacing = input<'none' | 'sm' | 'lg'>('sm');
}