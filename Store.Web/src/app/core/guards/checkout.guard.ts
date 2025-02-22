import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { CheckoutStateService } from '../services/checkout-state.service';

export function checkoutGuard() {
    const router = inject(Router);
    const checkoutState = inject(CheckoutStateService);

    if (!checkoutState.hasShippingInformation()) {
        router.navigate(['/checkout/information']);
        return false;
    }

    return true;
}