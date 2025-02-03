// checkout.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { CheckoutComponent } from './checkout.component';
import { ConfirmationComponent } from './confirmation/confirmation.component';
export const CHECKOUT_ROUTES: Routes = [
    {
        path: '',
        canActivate: [authGuard],
        children: [
            {
                path: '',
                component: CheckoutComponent
            },
            {
                path: 'confirmation',
                component: ConfirmationComponent
            }
        ]
    }
];
// export const CHECKOUT_ROUTES: Routes = [
//     {
//         path: '',
//         canActivate: [authGuard],
//         children: [
//             {
//                 path: '',
//                 redirectTo: 'information',
//                 pathMatch: 'full'
//             },
//             {
//                 path: 'information',
//                 loadComponent: () => import('./checkout-information.component')
//                     .then(m => m.CheckoutInformationComponent)
//             },
//             {
//                 path: 'shipping',
//                 loadComponent: () => import('./checkout-shipping.component')
//                     .then(m => m.CheckoutShippingComponent)
//             },
//             {
//                 path: 'payment',
//                 loadComponent: () => import('./checkout-payment.component')
//                     .then(m => m.CheckoutPaymentComponent)
//             },
//             {
//                 path: 'confirmation',
//                 loadComponent: () => import('./checkout-confirmation.component')
//                     .then(m => m.CheckoutConfirmationComponent)
//             }
//         ]
//     }
// ];