// src/app/core/components/address/saved-addresses.component.ts

import { Component, computed, inject, input, output } from '@angular/core';
import { CustomerService } from '../../services/customer.service';
import { AddressModalComponent } from './address-modal.component';
import { Address } from '../../../shared/models';

@Component({
  selector: 'app-saved-addresses',
  standalone: true,
  imports: [AddressModalComponent],
  template: `
    <div class="space-y-4">
      <!-- Address Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        @for (address of addresses(); track address.id) {
          <div 
            class="border rounded-lg p-4 relative hover:border-primary cursor-pointer"
            [class.bg-accent]="address.id === selectedId()"
            (click)="onSelect(address)" (keydown)="null"
            tabindex="0"
          >
            <!-- Default Badge -->
            @if (address.isDefault) {
              <span class="absolute top-2 right-2 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                Default
              </span>
            }

            <!-- Address Content -->
            <div class="space-y-2">
              <p class="font-medium dark:text-white">
                {{ address.firstName }} {{ address.lastName }}
              </p>
              <p class="text-sm text-muted-foreground">
                {{ address.street }}<br>
                {{ address.city }}, {{ address.postalCode }}<br>
                {{ address.country }}
              </p>
              @if (address.phone) {
                <p class="text-sm text-muted-foreground">
                  {{ address.phone }}
                </p>
              }
            </div>

            <!-- Actions -->
            <div class="mt-4 flex gap-2">
              <button 
                class="text-sm text-primary hover:underline"
                (click)="onEdit(address); $event.stopPropagation()"
              >
                Edit
              </button>
              @if (!address.isDefault) {
                <button 
                  class="text-sm text-primary hover:underline"
                  (click)="onSetDefault(address); $event.stopPropagation()"
                >
                  Set as Default
                </button>
                <button 
                  class="text-sm text-destructive hover:underline"
                  (click)="onDelete(address); $event.stopPropagation()"
                >
                  Delete
                </button>
              }
            </div>
          </div>
        }

        <!-- Add New Card -->
        <button
          class="border-2 border-dashed rounded-lg p-4 hover:border-primary flex items-center justify-center"
          (click)="showAddModal = true"
        >
          <span class="text-muted-foreground">+ Add New Address</span>
        </button>
      </div>

      <!-- Modal -->
      @if (showAddModal || editingAddress) {
        <app-address-modal
          [editAddress]="editingAddress"
          [saving]="saving()"
          (saved)="onAddressSaved($event)"
          (close)="closeModal()"
        />
      }
    </div>
  `
})
export class SavedAddressesComponent {
  private customerService = inject(CustomerService);

  addresses = computed(() => this.customerService.customerAddresses());
  selectedId = input<string | null>(null);
  saving = input(false);

  select = output<Address>();
  delete = output<string>();

  showAddModal = false;
  editingAddress: Address | null = null;

  onSelect(address: Address) {
    this.select.emit(address);
  }

  onEdit(address: Address) {
    this.editingAddress = address;
  }

  async onSetDefault(address: Address) {
    try {
      await this.customerService.setDefaultAddress(address.id, 'shipping');
    } catch {
      // Error handled by service
    }
  }

  async onDelete(address: Address) {
    if (confirm('Are you sure you want to delete this address?')) {
      this.delete.emit(address.id);
    }
  }

  onAddressSaved(address: Address) {
    this.closeModal();
    this.select.emit(address);
  }

  closeModal() {
    this.showAddModal = false;
    this.editingAddress = null;
  }
}