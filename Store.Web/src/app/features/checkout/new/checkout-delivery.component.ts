import { Component, OnInit, inject, signal, Output, EventEmitter } from "@angular/core";
import { DeliveryService, DeliveryOption } from "../../../core/services/delivery.service";
import { firstValueFrom } from "rxjs";
import { CurrencyPipe } from "@angular/common";
import { CheckoutService } from "../../../core/services/checkout.service";

// Update delivery component
@Component({
  selector: 'app-checkout-delivery',
  standalone: true,
  imports: [CurrencyPipe],
  template: `
    @if (loading()) {
      <div class="flex items-center justify-center h-64">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    } @else {
      @for (option of deliveryOptions(); track option) {
        <div class="flex items-center justify-between border-b py-4  {{(!checkoutService.hasShippingInformation() || !checkoutService.hasPaymentMethod()) ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary hover:border'}} rounded-lg p-4 {{selectedOption() === option.id ? 'bg-accent' : ''}}">
          <button [disabled]="!checkoutService.hasShippingInformation() || !checkoutService.hasPaymentMethod()"
            class="w-full px-4 py-2 text-left flex items-center justify-between rounded-md"
            [class.bg-accent]="selectedOption() === option.id"
            (click)="updateSelectedOption(option.id)"
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
                <img [src]="option.logo" [alt]="option.name" class="h-4 w-16">
              </div>
            </div>
          </button>
        </div>
      }
    }
  `
})
export class CheckoutDeliveryComponent implements OnInit {
  @Output() completed = new EventEmitter<void>();

  updateSelectedOption(id: string) {
    this.selectedOption.set(id);
    const option = this.deliveryOptions().find(o => o.id === id);
    if (option) {
      this.checkoutService.setDeliveryMethod(option);
      // Emit completion event when a delivery option is selected
      this.completed.emit();
    } else {
      console.warn('Selected option not found:', id);
    }
  }

  private readonly deliveryService = inject(DeliveryService);
  readonly checkoutService = inject(CheckoutService);
  loading = signal(true);
  deliveryOptions = signal<DeliveryOption[]>([]);
  selectedOption = signal<string | null>(null);

  ngOnInit() {
    this.loadDeliveryOptions();
  }

  private async loadDeliveryOptions() {
    this.loading.set(true);
    try {
      const shippingAddress = this.checkoutService.getShippingAddress();
      const postalCode = shippingAddress?.postalCode ?? '10000'; // Using nullish coalescing

      const response = await firstValueFrom(
        this.deliveryService.getDeliveryOptions(postalCode)
      );

      // Cast or type check the response to handle both possible structures
      if (response && typeof response === 'object' && 'deliveryOptions' in response) {
        // The response has the expected structure with a deliveryOptions array
        const options = response.deliveryOptions;
        this.deliveryOptions.set(options);
      } else if (Array.isArray(response)) {
        // Direct array response
        this.deliveryOptions.set(response);
      } else {
        // Fallback if response structure is unexpected
        console.warn('Unexpected response structure:', response);
        this.deliveryOptions.set([]);
      }

      // Pre-select if previously chosen
      const savedMethod = this.checkoutService.getDeliveryMethod();
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