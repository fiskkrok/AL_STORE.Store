import { Component } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormlyFieldConfig, FormlyFormOptions, FormlyModule } from '@ngx-formly/core';
import { CommonModule } from '@angular/common';
import { InputFieldType } from '../../../shared/forms/formly/input-field.type';

@Component({
    selector: 'app-credit-card-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FormlyModule],
    template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <formly-form [form]="form" [fields]="fields" [model]="model" [options]="options"></formly-form>
      <!-- <button type="submit" class="btn btn-primary">Submit</button> -->
    </form>
  `
})
export class CreditCardFormComponent {
    form = new FormGroup({});
    model: any = {};
    options: FormlyFormOptions = {};
    fields: FormlyFieldConfig[] = [
        {
            fieldGroupClassName: 'grid grid-flow-col grid-rows-2 gap-4',
            fieldGroup: [
                {
                    className: 'col-span-2',
                    key: 'cardNumber',
                    type: InputFieldType,
                    templateOptions: {
                        label: 'Card Number',
                        placeholder: 'Enter your card number',
                        required: true,
                        minLength: 16,
                        maxLength: 16,
                        pattern: '^[0-9]{16}$',
                        errormessages: {
                            required: 'Card number is required',
                            minlength: 'Card number must be 16 digits',
                            maxlength: 'Card number must be 16 digits',
                            pattern: 'Card number must be 16 digits'
                        }
                    }
                },
                {
                    className: 'col-span-1',
                    key: 'expiryDate',
                    type: InputFieldType,
                    templateOptions: {
                        label: 'Expiry Date (MM/YY)',
                        placeholder: 'MM/YY',
                        required: true,
                        pattern: '^(0[1-9]|1[0-2])\/([0-9]{2})$',
                        errormessages: {
                            required: 'Expiry date is required',
                            pattern: 'Expiry date must be in MM/YY format'
                        }
                    }
                },
                {
                    className: 'col-span-1',
                    key: 'cvv',
                    type: InputFieldType,
                    templateOptions: {
                        label: 'CVV',
                        placeholder: 'Enter your CVV',
                        required: true,
                        minLength: 3,
                        maxLength: 3,
                        pattern: '^[0-9]{3}$',
                        errormessages: {
                            required: 'CVV is required',
                            minlength: 'CVV must be 3 digits',
                            maxlength: 'CVV must be 3 digits',
                            pattern: 'CVV must be 3 digits'
                        }
                    }
                }
            ]
        }
    ];

    onSubmit() {
        if (this.form.valid) {
            console.log(this.model);
        }
    }
}
