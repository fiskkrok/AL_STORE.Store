import { Routes } from '@angular/router';
import { CheckoutComponent } from './checkout.component';
import { authGuard } from '../../core/guards/auth.guard';

export const CHECKOUT_ROUTES: Routes = [
    {
        path: '',
        component: CheckoutComponent,
        canActivate: [authGuard],
        children: [
            {
                path: '',
                redirectTo: 'information',
                pathMatch: 'full'
            },
            {
                path: 'information',
                loadComponent: () => import('../checkout/checkout-information.component')
                    .then(m => m.CheckoutInformationComponent)
            },
            {
                path: 'shipping',
                loadComponent: () => import('../checkout/checkout-shipping.component')
                    .then(m => m.CheckoutShippingComponent)
            },
            {
                path: 'payment',
                loadComponent: () => import('../checkout/checkout-payment.component')
                    .then(m => m.CheckoutPaymentComponent)
            },
            {
                path: 'confirmation',
                loadComponent: () => import('../checkout/checkout-confirmation.component')
                    .then(m => m.CheckoutConfirmationComponent)
            }
        ]
    }
];