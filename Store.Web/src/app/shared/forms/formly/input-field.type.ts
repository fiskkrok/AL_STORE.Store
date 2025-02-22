/* eslint-disable @angular-eslint/component-selector */
/* eslint-disable @angular-eslint/component-class-suffix */
import { Component, computed } from '@angular/core';
import { FieldType, FieldTypeConfig, FormlyModule } from '@ngx-formly/core';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'formly-field-input',
  standalone: true,
  imports: [ReactiveFormsModule, FormlyModule],
  template: `
    <div class="form-control text-foreground">
      <label [for]="id" class="block text-sm font-medium leading-6 mb-2">
        {{ props.label }}
        @if (props.required) {
          <span class="text-destructive">*</span>
        }
      </label>
      <input
        [id]="id"
        [type]="props.type || 'text'"
        [formControl]="formControl"
        [formlyAttributes]="field"
        class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
      @if (showErrorSignal()) {
        <p class="mt-1 text-sm text-destructive">{{ errorMessage() }}</p>
      }
    </div>
  `
})
export class InputFieldType extends FieldType<FieldTypeConfig> {
  // Use a different name for the computed signal to avoid override issues
  showErrorSignal = computed(() => {
    return this.showError;
  });

  errorMessage = computed(() => {
    const errors = this.field.formControl?.errors;
    if (errors) {
      const firstError = Object.keys(errors)[0];
      return this.props['errormessages']?.[firstError] || 'This field is invalid';
    }
    return '';
  });
}