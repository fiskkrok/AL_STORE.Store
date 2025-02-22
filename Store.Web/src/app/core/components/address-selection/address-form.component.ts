// src/app/core/components/address/address-form.component.ts

import { ChangeDetectionStrategy, Component, input, output, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { InputFieldType } from '../../../shared/forms/formly/input-field.type';
import { SelectFieldType } from '../../../shared/forms/formly/select-field.type';
import { CheckboxFieldType } from '../../../shared/forms/formly/checkbox-field.type';

export interface AddressFormData {
    firstName: string;
    lastName: string;
    street: string;
    streetNumber: string;
    apartment?: string;
    city: string;
    postalCode: string;
    state: string;
    country: string;
    phone?: string;
    setAsDefault?: boolean;
    isDefault?: boolean;
}

@Component({
    selector: 'app-address-form',
    standalone: true,
    imports: [ReactiveFormsModule, FormlyModule],
    template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <formly-form
        [form]="form"
        [fields]="fields"
        [model]="model"
      />
      <div class="mt-4 flex justify-end gap-3">
        <button 
          type="button"
          class="px-4 py-2 bg-secondary border rounded-lg hover:bg-accent"
          (click)="cancelled.emit()"
        >
          Cancel
        </button>
        <button 
          type="submit"
          class="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          [disabled]="!form.valid || saving()"
        >
          @if (saving()) {
            <span>Saving...</span>
          } @else {
            <span>Save Address</span>
          }
        </button>
      </div>
    </form>
  `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddressFormComponent implements OnInit {
    initialData = input<Partial<AddressFormData>>();
    saving = input<boolean>(false);

    save = output<AddressFormData>();
    cancelled = output<void>();

    form = new FormGroup({});
    model: AddressFormData = {
        firstName: '',
        lastName: '',
        street: '',
        streetNumber: '',
        city: '',
        postalCode: '',
        state: '', // Default empty for Sweden
        country: 'SE', // Default to Sweden
        setAsDefault: false
    };

    fields: FormlyFieldConfig[] = [
        {
            fieldGroupClassName: 'grid grid-cols-1 md:grid-cols-2 gap-4',
            fieldGroup: [
                {
                    key: 'firstName',
                    type: InputFieldType,
                    props: {
                        label: 'First Name',
                        required: true
                    }
                },
                {
                    key: 'lastName',
                    type: InputFieldType,
                    props: {
                        label: 'Last Name',
                        required: true
                    }
                },
                {
                    className: 'col-span-2',
                    fieldGroup: [
                        {
                            key: 'street',
                            type: InputFieldType,
                            props: {
                                label: 'Street',
                                required: true
                            }
                        },
                        {
                            className: 'grid grid-cols-2 gap-4',
                            fieldGroup: [
                                {
                                    key: 'streetNumber',
                                    type: InputFieldType,
                                    props: {
                                        label: 'Street Number',
                                        required: true
                                    }
                                },
                                {
                                    key: 'apartment',
                                    type: InputFieldType,
                                    props: {
                                        label: 'Apartment (Optional)',
                                        placeholder: 'e.g. Apt 4B'
                                    }
                                }
                            ]
                        }
                    ]
                },
                {
                    key: 'city',
                    type: InputFieldType,
                    props: {
                        label: 'City',
                        required: true
                    }
                },
                {
                    key: 'postalCode',
                    type: InputFieldType,
                    props: {
                        label: 'Postal Code',
                        required: true,
                        pattern: '^[0-9]{3}\\s?[0-9]{2}$', // Swedish postal code format
                        description: 'Format: 123 45'
                    }
                },
                {
                    key: 'country',
                    type: SelectFieldType,
                    className: 'col-span-2',
                    props: {
                        label: 'Country',
                        required: true,
                        options: [
                            { label: 'Sweden', value: 'SE' }
                            // Add more countries as needed
                        ]
                    }
                },
                {
                    key: 'phone',
                    type: InputFieldType,
                    className: 'col-span-2',
                    props: {
                        label: 'Phone Number',
                        placeholder: 'Optional'
                    }
                },
                {
                    key: 'setAsDefault',
                    type: CheckboxFieldType,
                    className: 'col-span-2',
                    props: {
                        label: 'Set as default shipping address'
                    }
                }
            ]
        }
    ];

    ngOnInit() {
        if (this.initialData()) {
            this.model = {
                ...this.model,
                ...this.initialData()
            };
        }
    }

    onSubmit() {
        if (this.form.valid) {
            this.save.emit(this.form.value as AddressFormData);
        }
    }
}