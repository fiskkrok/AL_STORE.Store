// src/app/core/components/address/address-modal.component.ts

import { Component, computed, inject, input, output } from '@angular/core';
import { CustomerService } from '../../services/customer.service';
import { AddressFormComponent, AddressFormData } from './address-form.component';
import { Address } from '../../../shared/models';

@Component({
  selector: 'app-address-modal',
  standalone: true,
  imports: [AddressFormComponent],
  template: `
    <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-background rounded-lg shadow-lg w-full max-w-lg mx-4">
        <!-- Header -->
        <div class="p-4 border-b">
          <h2 class="text-lg font-semibold dark:text-white">
            {{ editAddress() ? 'Edit Address' : 'Add New Address' }}
          </h2>
        </div>

        <!-- Content -->
        <div class="p-4">
          <app-address-form
            [initialData]="formData()"
            [saving]="saving()"
            (save)="onSave($event)"
            (cancel)="close.emit()"
          />
        </div>
      </div>
    </div>
  `
})
export class AddressModalComponent {
  private readonly customerService = inject(CustomerService);

  editAddress = input<Address | null>(null);
  saving = input(false);

  close = output<void>();
  saved = output<Address>();

  formData = computed(() => {
    const address = this.editAddress();
    if (!address) return {};

    return {
      street: address.street,
      city: address.city,
      postalCode: address.postalCode,
      country: address.country,
      phone: address.phone
    };
  });

  async onSave(formData: AddressFormData) {

    try {
      let savedAddress: Address;

      if (this.editAddress()) {
        savedAddress = await this.customerService.updateAddress(
          this.editAddress()!.id,
          formData
        );
      } else {
        savedAddress = await this.customerService.addAddress({
          ...formData,
          type: 'shipping'
        });
      }

      if (formData.isDefault) {
        await this.customerService.setDefaultAddress(savedAddress.id, 'shipping');
      }

      this.saved.emit(savedAddress);
    } finally {
      this.close.emit();
    }
  }
}