/* eslint-disable @angular-eslint/component-selector */
/* eslint-disable @angular-eslint/component-class-suffix */
import { ChangeDetectionStrategy, Component, OnInit, computed, signal } from '@angular/core';
import { FieldType, FieldTypeConfig, FormlyModule } from '@ngx-formly/core';
import { ReactiveFormsModule } from '@angular/forms';
import { isObservable } from 'rxjs';

interface SelectOption {
  value: string | number;
  label: string;
}

@Component({
  selector: 'formly-field-select',
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
      <select 
        [id]="id"
        [formControl]="formControl" 
        [formlyAttributes]="field"
        class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        @for (option of selectOptions(); track option.value) {
          <option [value]="option.value">{{ option.label }}</option>
        }
      </select>
      @if (showErrorSignal()) {
        <p class="mt-1 text-sm text-destructive">{{ errorMessage() }}</p>
      }
    </div>
    `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectFieldType extends FieldType<FieldTypeConfig> implements OnInit {
  selectOptions = signal<SelectOption[]>([]);

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

  ngOnInit(): void {
    if (isObservable(this.props.options)) {
      this.props.options.subscribe((res: SelectOption[]) => this.selectOptions.set(res));
    } else {
      this.selectOptions.set(this.props.options || []);
    }
  }
}

