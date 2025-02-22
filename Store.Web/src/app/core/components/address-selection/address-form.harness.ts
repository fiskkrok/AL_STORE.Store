/* eslint-disable @angular-eslint/component-class-suffix */
// src/app/core/components/address/address-form.harness.ts

import { Component } from '@angular/core';
import { AddressFormComponent } from './address-form.component';

@Component({
    standalone: true,
    imports: [AddressFormComponent],
    template: `
    <div class="p-4">
      <h2 class="text-lg font-medium mb-4">Test Address Form</h2>
      <app-address-form
        [initialData]="initialData"
        [saving]="saving"
        (save)="onSave($event)"
        (cancel)="onCancel()"
      />
    </div>
  `
})
export class AddressFormHarness {
    initialData = {
        street: 'Test Street 1',
        city: 'Stockholm'
    };
    saving = false;

    onSave(data: any) {
        console.log('Form saved:', data);
    }

    onCancel() {
        console.log('Form cancelled');
    }
}