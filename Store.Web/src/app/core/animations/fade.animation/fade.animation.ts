import { animate, style, transition, trigger } from '@angular/animations';

export const fadeAnimation = trigger('fade', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('200ms ease-out', style({ opacity: 1 }))
  ]),
  transition(':leave', [
    animate('200ms ease-in', style({ opacity: 0 }))
  ])
]);

export const fadeSlideInAnimation = trigger('fadeSlideIn', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(20px)' }),
    animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
  ])
]);

export const listAnimation = trigger('list', [
  transition(':enter', [
    style({ height: 0, opacity: 0 }),
    animate('200ms ease-out', style({ height: '*', opacity: 1 }))
  ]),
  transition(':leave', [
    animate('200ms ease-in', style({ height: 0, opacity: 0 }))
  ])
]);