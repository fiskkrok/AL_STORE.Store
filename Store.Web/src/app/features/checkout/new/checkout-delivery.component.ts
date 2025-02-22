import { CurrencyPipe } from "@angular/common";
import { Component } from "@angular/core";

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

    @for ( option of deliveryOptions(); track option.name) {
      <div class="flex items-center justify-between border-b py-4">
        <div>
          <h3 class="font-semibold">{{ option.name }}</h3>
          <p class="text-sm">{{ option.description }}</p>
        </div>
        <div>
          <p class="font-semibold">{{ option.price | currency }}</p>
        </div>
        <button class="btn btn-primary" (click)="selectOption(option)">Select</button>
      </div>
    }
  `
})
export class CheckoutDeliveryComponent {
    // Component logic here
    selectOption(option: any) {


        console.log("Selected option:", option);
    }
    //For now we will hardcode some standard delivery options,like PostNord(if in scandi countries - but for now always), DHL, UPS, FedEx, etc.
    deliveryOptions() {
        return [
            { name: 'PostNord', description: 'Standard delivery', price: 5 },
            { name: 'DHL', description: 'Express delivery', price: 10 },
            { name: 'UPS', description: 'Express delivery', price: 10 },
            { name: 'FedEx', description: 'Express delivery', price: 10 }
        ];
    }
    loading() {
        return false;
    }
}
