// src/app/shared/components/card/card.component.ts
// imports

import { Component, Input, Output, EventEmitter } from "@angular/core";

@Component({
    selector: 'app-card',
    standalone: true,
    template: `
    <div 
      class="relative rounded-lg border overflow-hidden transition-all duration-200"
      [class.hover:shadow-md]="hover"
      [class.hover:-translate-y-1]="hover"
      [class.bg-card]="true"
      [class.cursor-pointer]="clickable"
      [class.bg-accent]="selected"
      [class.border-primary]="selected"
      (click)="clickable && handleClick()"
    >
      <!-- Image Section (optional) -->
      @if (imageUrl) {
        <div class="relative aspect-square overflow-hidden">
          <img 
            [src]="imageUrl" 
            [alt]="imageAlt || title" 
            class="w-full h-full object-cover transition duration-300"
            [class.opacity-75]="selected"
          />
          
          <!-- Badge Slot (top-right) -->
          @if (badgeSlot) {
            <div class="absolute top-2 right-2 flex flex-col gap-2">
              <ng-content select="[cardBadge]"></ng-content>
            </div>
          }
          
          <!-- Overlay Slot -->
          @if (overlaySlot) {
            <div class="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity hover:opacity-100">
              <ng-content select="[cardOverlay]"></ng-content>
            </div>
          }
        </div>
      }
      
      <!-- Content Section -->
      <div class="p-4 space-y-2">
        @if (title) {
          <h3 class="font-medium text-lg line-clamp-2">{{ title }}</h3>
        } @else {
          <ng-content select="[cardTitle]"></ng-content>
        }
        
        @if (subtitle) {
          <p class="text-sm text-muted-foreground">{{ subtitle }}</p>
        } @else {
          <ng-content select="[cardSubtitle]"></ng-content>
        }
        
        @if (description) {
          <p class="text-sm text-muted-foreground line-clamp-2">{{ description }}</p>
        }
        
        <!-- Slot for custom content -->
        <ng-content></ng-content>
        
        <!-- Footer slot -->
        <ng-content select="[cardFooter]"></ng-content>
      </div>
    </div>
  `
})
export class CardComponent {
    @Input() title?: string;
    @Input() subtitle?: string;
    @Input() description?: string;
    @Input() imageUrl?: string;
    @Input() imageAlt?: string;
    @Input() clickable = true;
    @Input() hover = true;
    @Input() selected = false;
    @Input() badgeSlot = true;
    @Input() overlaySlot = false;

    @Output() cardClick = new EventEmitter<void>();

    handleClick() {
        this.cardClick.emit();
    }
}