import { Component, OnInit, inject, signal } from "@angular/core";
import { CheckoutStateService } from "../../../core/services/checkout-state.service";
import { DeliveryService, DeliveryOption } from "../../../core/services/delivery.service";
import { firstValueFrom } from "rxjs";

// Update delivery component
@Component({
  selector: 'app-checkout-delivery',
  template: `
    @if (loading()) {
      <div class="flex items-center justify-center h-64">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    } @else {
      @for (option of deliveryOptions(); track option.id) {
        <div class="flex items-center justify-between border-b py-4 hover:border-primary hover:border rounded-lg p-4 {{selectedOption() === option.id ? 'bg-accent' : ''}}">
          <button
            class="w-full px-4 py-2 text-left flex items-center justify-between rounded-md"
            [class.bg-accent]="selectedOption() === option.id"
            (click)="selectOption(option)"
          >
            <div class="flex items-center gap-4">
              <!-- Radio indicator -->
              <div class="border rounded-full w-5 h-5 flex items-center justify-center">
                @if (selectedOption() === option.id) {
                  <div class="w-3 h-3 bg-primary rounded-full"></div>
                }
              </div>

              <!-- Delivery info -->
              <div>
                <p class="font-medium">{{ option.name }}</p>
                <p class="text-sm text-muted-foreground">{{ option.description }}</p>
                <p class="text-sm text-muted-foreground">{{ option.estimatedDelivery }}</p>
              </div>
            </div>

            <div class="flex items-center gap-4">
              <p class="font-semibold">{{ option.price | currency:'SEK' }}</p>
              <div class="flex items-center gap-3">
                <img [src]="option.logo" [alt]="option.name" class="h-8 w-16">
              </div>
            </div>
          </button>
        </div>
      }
    }
  `
})
export class CheckoutDeliveryComponent implements OnInit {
  private readonly deliveryService = inject(DeliveryService);
  private readonly checkoutState = inject(CheckoutStateService);

  loading = signal(true);
  deliveryOptions = signal<DeliveryOption[]>([]);
  selectedOption = signal<string | null>(null);

  ngOnInit() {
    this.loadDeliveryOptions();
  }

  private async loadDeliveryOptions() {
    this.loading.set(true);
    try {
      const shippingAddress = this.checkoutState.getShippingAddress();
      const postalCode = shippingAddress?.postalCode || '10000'; // Default fallback

      const options = await firstValueFrom(
        this.deliveryService.getDeliveryOptions(postalCode)
      );

      this.deliveryOptions.set(options);

      // Pre-select if previously chosen
      const savedMethod = this.checkoutState.getDeliveryMethod();
      if (savedMethod) {
        this.selectedOption.set(savedMethod.id);
      }
    } catch (error) {
      console.error('Failed to load delivery options:', error);
    } finally {
      this.loading.set(false);
    }
  }
}