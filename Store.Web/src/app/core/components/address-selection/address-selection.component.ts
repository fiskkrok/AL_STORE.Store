// core/components/address-selection/address-selection.component.ts
import { Component, input, output } from '@angular/core';
import { Address } from '../../../shared/models/customer.model';

@Component({
    selector: 'app-address-selection',
    standalone: true,
    template: `
        <div class="mb-6">
            <h2 class="text-lg font-medium mb-4 text-foreground">Saved Addresses</h2>
            <div class="grid gap-4 md:grid-cols-2">
                @for (address of addresses(); track address.id) {
                    <div
                        class="p-4 border rounded-lg cursor-pointer transition-colors"
                        [class.border-primary]="selectedId() === address.id"
                        [class.hover:border-primary]="selectedId() !== address.id"
                        tabindex="0"
                        (click)="select.emit(address)"
                        (keydown.enter)="select.emit(address)"
                        role="button"
                        [attr.aria-selected]="selectedId() === address.id"
                    >
                        <p class="font-medium">{{ address.firstName }} {{ address.lastName }}</p>
                        <p class="text-sm text-muted-foreground">{{ address.street }}</p>
                        <p class="text-sm text-muted-foreground">
                            {{ address.city }}, {{ address.postalCode }}
                        </p>
                    </div>
                }

                <button
                    class="p-4 border rounded-lg border-dashed text-center 
                           hover:bg-muted transition-colors"
                    (click)="addNew.emit()"
                >
                    <span class="sr-only">Add new address</span>
                    + Add New Address
                </button>
            </div>
        </div>
    `
})
export class AddressSelectionComponent {
    // Inputs using the new signals syntax
    addresses = input.required<Address[]>();
    selectedId = input<string | null>();

    // Outputs
    select = output<Address>();
    addNew = output<void>();
}