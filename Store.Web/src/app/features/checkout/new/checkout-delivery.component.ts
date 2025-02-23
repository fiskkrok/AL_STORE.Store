import { CurrencyPipe } from "@angular/common";
import { Component, signal } from "@angular/core";

@Component({
  selector: 'app-checkout-delivery',
  standalone: true,
  imports: [CurrencyPipe],
  template: `
    @if (loading()) {
      <div class="flex items-center justify-center h-64">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }

    @for (option of deliveryOptions(); track option.name) {
      <div class="flex items-center justify-between border-b rounded-lg py-4 hover:border-primary hover:border  {{selectedOption() === option.name ? 'bg-accent' : ''}}">
        <button
        class="w-full px-4 py-2 text-left flex items-center justify-between rounded-md"
        [class.bg-accent]="selectedOption() === option.name"
            (click)="selectOption(option)"
          >
        <div class="flex items-center gap-4">
          <!-- Radio indicator -->
          <div class="border rounded-full w-5 h-5 flex items-center justify-center">
            @if (selectedOption() === option.name) {
              <div class="w-3 h-3 bg-primary rounded-full"></div>
            }
          </div>

          <!-- Delivery info -->
          <div>
             <p class="font-semibold">{{ option.price | currency }}</p>
            <p class="text-sm text-muted-foreground">{{ option.description }}</p>
          </div>
        </div>

        <div class="flex items-center gap-4">
        
           <div class="flex items-center gap-3">
              @if (option.name === 'PostNord') {
                <img src="assets/websitelogos/postnord-logo.png" [alt]="option.name" class="h-4 w-16">
              } @else if (option.name === 'DHL') {
                <img src="assets/websitelogos/dhl-logo.png" [alt]="option.name" class="h-4 w-16">
              } @else if (option.name === 'UPS') {
                <img src="assets/websitelogos/ups-logo.png" [alt]="option.name" class="h-10 w-10">
              } @else {
                <h3 class="font-semibold">{{ option.name }}</h3>
              }
            </div>
          </div>
        </button>
      </div>
    }
  `
})
export class CheckoutDeliveryComponent {
  loading = signal(false);
  selectedOption = signal<string | null>(null);

  //For now we will hardcode some standard delivery options,like PostNord(if in scandi countries - but for now always), DHL, UPS, FedEx, etc.
  deliveryOptions = signal([
    { name: 'PostNord', description: 'Standard delivery - 2-3 business days', price: 0, logo: 'postnord.svg' },
    { name: 'DHL', description: 'Express delivery - Next business day', price: 10, logo: 'dhl.svg' },
    { name: 'UPS', description: 'Express delivery - Next business day', price: 10, logo: 'ups.svg' },
  ]);

  selectOption(option: { name: string; description: string; price: number; logo: string }) {
    this.selectedOption.set(option.name);
    // Emit selection to parent/store
  }
}
