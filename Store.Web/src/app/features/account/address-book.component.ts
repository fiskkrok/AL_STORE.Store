import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { SavedAddressesComponent } from "../../core/components/address-selection/saved-addresses.component";
import { Address } from '../../shared/models';

@Component({
    selector: 'app-address-book',
    standalone: true,
    template: ` <app-saved-addresses
          (select)="onAddressSelect($event)"
           (cancel)="close.emit()"
        />`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [SavedAddressesComponent]
})
export class AddressBookComponent {

    editAddress = input<Address | null>(null);
    saving = input(false);

    close = output<void>();
    saved = output<Address>();
    onAddressSelect(address: any) {
        // Handle address selection
        console.log('Selected address:', address);
        // Should expand the address selection component to show the selected address details and be able to edit it

    }
}
