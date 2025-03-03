import { ChangeDetectionStrategy, Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CheckoutStateService } from '../../../core/services/checkout-state.service';
import { FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { FormlyBootstrapModule } from '@ngx-formly/bootstrap';
import { AuthService } from '@auth0/auth0-angular';
import { CustomerService } from '../../../core/services/customer.service';
import { firstValueFrom, Subscription } from 'rxjs';
import { CheckoutSessionService } from '../../../core/services/checkout-session.service';
import { LoadingSpinnerComponent } from "../../../core/components/loading-spinner.component";
import { ErrorService } from '../../../core/services/error.service';
import { InputFieldType } from '../../../shared/forms/formly/input-field.type';
import { SelectFieldType } from '../../../shared/forms/formly/select-field.type';
import { CheckoutAddressService } from '../../../core/services/checkout-address.service';
import { SavedAddressesComponent } from "../../../core/components/address-selection/saved-addresses.component";
import { AddressFormComponent, AddressFormData } from "../../../core/components/address-selection/address-form.component";
import { CheckoutInformation } from '../../../shared/models/checkout.model';
import { AddAddressRequest, Address } from '../../../shared/models';

@Component({
  selector: 'app-checkout-information',
  standalone: true,
  imports: [ReactiveFormsModule, FormlyModule, FormlyBootstrapModule, LoadingSpinnerComponent, SavedAddressesComponent, AddressFormComponent],
  providers: [FormBuilder],
  template: `
  @if (!state().loading) {
    <div>
      @if (authService.isAuthenticated$) {
        <app-saved-addresses
          [selectedId]="state().selectedAddressId"
          [saving]="state().loading"
          (select)="onAddressSelect($event)"
        />
      } @else {
        <app-address-form
          [saving]="state().saving"
          (save)="onNewAddressSave($event)"
        />
      }
    </div>
  } @else {
    <div class="flex justify-center items-center min-h-[200px]">
      <app-loading-spinner />
    </div>
  }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush

})
export class CheckoutInformationComponent implements OnInit, OnDestroy {
  protected state = signal<{
    addresses: Address[];
    selectedAddressId: string | null;
    showNewAddress: boolean;
    loading: boolean;
    saving: boolean;
  }>({
    addresses: [],
    selectedAddressId: null,
    showNewAddress: false,
    loading: false,
    saving: false
  });

  form = new FormGroup({});
  model: ShippingFormModel = {
    shippingAddress: {

      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      street: '',
      city: '',
      postalCode: '',
      country: '',

    }
  };

  fields: FormlyFieldConfig[] = [
    {
      fieldGroupClassName: 'grid grid-cols-1 md:grid-cols-2 gap-6',
      wrappers: ['panel'],
      fieldGroup: [
        {
          key: 'shippingAddress',
          templateOptions: { label: 'Shipping Address' },
          fieldGroup: [
            {
              key: 'firstName',
              type: InputFieldType,
              className: 'col-span-1',
              templateOptions: {
                label: 'First Name',
                required: true
              }
            },
            {
              key: 'lastName',
              type: InputFieldType,
              // type: 'input',
              className: 'col-span-1',
              templateOptions: {
                label: 'Last Name',
                required: true
              }
            },
            {
              key: 'email',
              type: InputFieldType,
              className: 'col-span-2',
              templateOptions: {
                label: 'Email',
                required: true,
                type: 'email'
              }
            },
            {
              key: 'phone',
              type: InputFieldType,
              className: 'col-span-2',
              templateOptions: {
                label: 'Phone',
                required: true
              }
            },
            {
              key: 'street',
              type: InputFieldType,
              className: 'col-span-2',
              templateOptions: {
                label: 'Street Address',
                required: true
              }
            },
            {
              key: 'city',
              type: InputFieldType,
              className: 'col-span-1',
              templateOptions: {
                label: 'City',
                required: true
              }
            },
            {
              key: 'postalCode',
              type: InputFieldType,
              className: 'col-span-1',
              templateOptions: {
                label: 'Postal Code',
                required: true
              }
            },
            {
              key: 'country',
              type: SelectFieldType,
              // type: 'select',
              className: 'col-span-2',
              templateOptions: {
                label: 'Country',
                required: true,
                options: [
                  { label: 'Sweden', value: 'SE' },
                  { label: 'United States', value: 'US' },
                  { label: 'United Kingdom', value: 'UK' },
                  { label: 'Germany', value: 'DE' },
                  { label: 'France', value: 'FR' }
                ]
              }
            }
          ]
        }
      ]
    }
  ];

  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly customerService = inject(CustomerService);
  authService = inject(AuthService);
  private readonly errorService = inject(ErrorService);
  private readonly checkoutSession = inject(CheckoutSessionService);
  readonly checkoutState = inject(CheckoutStateService);
  private readonly checkoutAddressService = inject(CheckoutAddressService);
  addresses = signal<Address[]>([]);
  formSubscription = signal<Subscription | null>(null);

  selectedAddressId = signal<string | null>(null);
  submitting = signal(false);
  showNewAddressForm = signal(false); // Controls visibility of new address form
  prepopulateForm(address: Address) {
    this.form.patchValue({
      firstName: address.firstName,
      lastName: address.lastName,
      street: address.street,
      city: address.city,
      postalCode: address.postalCode,
      country: address.country
    });
  }
  ngOnInit(): void {
    void (async () => {
      // First try to load cached data
      const cachedData = this.loadCachedFormData();
      if (cachedData) {
        this.model = cachedData;
      }
      this.formSubscription.set(this.form.valueChanges.subscribe(value => {
        localStorage.setItem('checkoutFormData', JSON.stringify(value));
      }));
      // Then check if user is authenticated and has profile data
      const isAuthenticated = await firstValueFrom(this.authService.isAuthenticated$);
      if (isAuthenticated) {
        this.state.update(s => ({ ...s, loading: true }));
        try {
          await this.customerService.loadAddresses();
          const defaultAddress = this.customerService.defaultShippingAddress();
          const profile = this.customerService.profile();

          if (profile || defaultAddress) {
            // Only overwrite if user hasn't already started filling the form
            if (!this.form.dirty) {
              this.model = {
                shippingAddress: {
                  firstName: profile?.firstName ?? '',
                  lastName: profile?.lastName ?? '',
                  email: profile?.email ?? '',
                  phone: defaultAddress?.phone ?? '',
                  street: defaultAddress?.street ?? '',
                  city: defaultAddress?.city ?? '',
                  postalCode: defaultAddress?.postalCode ?? '',
                  country: defaultAddress?.country ?? ''
                }
              };
            }
          }
        } finally {
          this.state.update(s => ({ ...s, loading: false }));
        }
      }
    })();
  }
  async onContinue() {
    this.state.update(s => ({ ...s, loading: true }));

    try {
      // Initialize checkout session
      await this.checkoutSession.initializeSession();

      // Get the selected address from checkout state
      const shippingAddress = this.checkoutState.getShippingAddress();

      if (!shippingAddress) {
        throw new Error('No shipping address selected');
      }

      // Create the checkout information from the address
      const checkoutInfo: CheckoutInformation = {
        id: '',
        type: 'shipping',
        state: '',
        isDefault: false,
        firstName: shippingAddress.firstName,
        lastName: shippingAddress.lastName,
        email: shippingAddress.email ?? '',
        phone: shippingAddress.phone,
        street: shippingAddress.street,
        city: shippingAddress.city,
        postalCode: shippingAddress.postalCode,
        country: shippingAddress.country,
        discountCode: undefined,
      };

      // Set the information in checkout state
      this.checkoutState.setShippingAddress(checkoutInfo);

      // Navigate to payment
      await this.router.navigate(['/checkout/payment']);
    } finally {
      this.state.update(s => ({ ...s, loading: false }));
    }
  }
  async onNewAddressSave(formData: AddressFormData) {
    this.state.update(s => ({ ...s, loading: true }));

    try {
      // First save the address for checkout
      const profile = await firstValueFrom(this.authService.user$);

      const addressRequest: AddAddressRequest = {
        ...formData,
        firstName: profile?.['firstName'] || formData.firstName,
        lastName: profile?.['lastName'] || formData.lastName,
        type: 'shipping',
        street: formData.street || '', // You might want to split street into number
        apartment: undefined, // For Swedish addresses
        state: formData.state ?? '', // For Swedish addresses
        isDefault: !this.customerService.defaultShippingAddress()
      };

      const address = await this.customerService.addAddress(addressRequest);

      this.state.update(s => ({
        ...s,
        showNewAddress: false,
        selectedAddressId: address.id
      }));

      // Show success message
      this.errorService.addError(
        'ADDRESS_SAVED',
        'Address saved successfully',
        { severity: 'info', timeout: 3000 }
      );

    } catch {
      // Errors already handled by services
    } finally {
      this.state.update(s => ({ ...s, loading: false }));
    }
  }
  private loadCachedFormData(): ShippingFormModel | null {
    const cached = localStorage.getItem('checkoutFormData');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        return null;
      }
    }
    return null;
  }
  async onAddressSelect(address: Address) {
    this.state.update(s => ({
      ...s,
      selectedAddressId: address.id,
      loading: true
    }));

    try {
      // Save address to checkout state
      await this.checkoutAddressService.selectShippingAddress(address.id);

      // Verify the state was updated
      const shippingAddress = this.checkoutState.getShippingAddress();
      console.log('Updated shipping address:', shippingAddress);

      // Add visual indication that address was selected
      console.log('Address selected:', address);

    } catch {
      this.errorService.addError(
        'ADDRESS_ERROR',
        'Failed to select address',
        { severity: 'error' }
      );
    } finally {
      this.state.update(s => ({ ...s, loading: false }));
    }
  }
  async onAddressDelete(addressId: string) {
    await this.checkoutAddressService.deleteShippingAddress(addressId);
  }

  onAddNew(): void {
    this.state.update(s => ({ ...s, showNewAddress: true }));
  }

  async onSubmit() {
    if (!this.form.valid) return;

    this.state.update(s => ({ ...s, loading: true }));
    try {
      await this.checkoutSession.initializeSession();
      const shippingInformation = createCheckoutInformation(this.model);
      this.checkoutState.setShippingAddress(shippingInformation);
      await this.router.navigate(['/checkout/payment']);
    } catch {
      // Handle error appropriately
      this.errorService.addError('CHECKOUT_ERROR', 'Failed to proceed to payment');
    } finally {
      this.state.update(s => ({ ...s, loading: false }));
    }
  }
  private async loadCustomerData() {
    this.state().loading = true;
    try {
      const profile = await this.customerService.customerProfile();
      if (profile) {
        this.form.patchValue({
          firstName: profile.firstName,
          lastName: profile.lastName,
          street: profile.addresses[0].street,
          city: profile.addresses[0].city,
          postalCode: profile.addresses[0].postalCode,
          country: profile.addresses[0].country
        });
      }
    } finally {
      this.state().loading = false;
    }
  }
  ngOnDestroy() {
    const subscription = this.formSubscription();
    if (subscription) {
      subscription.unsubscribe();
    }
  }
  // Not new
  showFieldError(fieldName: string): boolean {
    const control = this.form.get(fieldName);
    return control ? control.invalid && control.touched : false;
  }

}

interface ShippingFormModel {
  shippingAddress: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    street: string;
    streetNumber?: string;
    apartment?: string;
    city: string;
    postalCode: string;
    country: string;
    state?: string;
  }
}

export function createCheckoutInformation(shipping: ShippingFormModel): Address {
  return {
    id: '',
    firstName: shipping.shippingAddress.firstName ?? '',
    lastName: shipping.shippingAddress.lastName ?? '',
    streetNumber: '', // You might want to split street into number + street
    apartment: '', // For Swedish addresses
    state: '', // For Swedish addresses
    phone: shipping.shippingAddress.phone,
    street: shipping.shippingAddress.street ?? '',
    city: shipping.shippingAddress.city ?? '',
    postalCode: shipping.shippingAddress.postalCode ?? '',
    country: shipping.shippingAddress.country ?? '',
    type: 'shipping',
    isDefault: false,
  };
}
