import { AbstractControl, ValidationErrors } from "@angular/forms";
import { ConfigOption } from "@ngx-formly/core";
import { PanelWrapperComponent } from "../panel-wrapper.component";
import { InputFieldType } from "./input-field.type";
import { SelectFieldType } from "./select-field.type";

// core/forms/validation-types.ts
export const formlyValidationConfig: ConfigOption = {
    validationMessages: [
        { name: 'required', message: 'This field is required' },
        {
            name: 'postalCode',
            message: () => `Invalid postal code format`
        }
    ],
    validators: [
        { name: 'postalCode', validation: postalCodeValidator },
    ],
    wrappers: [
        { name: 'panel', component: PanelWrapperComponent },
    ],
    types: [
        { name: 'input', component: InputFieldType },
        { name: 'select', component: SelectFieldType },
    ],

};

function postalCodeValidator(control: AbstractControl): ValidationErrors | null {
    // Basic Swedish postal code validation
    // Will be complemented by backend validation
    return /^\d{3}\s?\d{2}$/.test(control.value) ? null : { postalCode: true };
}

