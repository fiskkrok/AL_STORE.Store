// checkout.routes.ts
import { Routes } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { inject } from '@angular/core';
import { map } from 'rxjs';
import { GuestEmailComponent } from './guest-email.component';

export const CHECKOUT_ROUTES: Routes = [
    {
        path: '',
        children: [
            {
                path: '',
                redirectTo: 'payment',
                pathMatch: 'full'
            },
            {
                path: 'email',
                component: GuestEmailComponent,
                canActivate: [() => inject(AuthService).isAuthenticated$.pipe(
                    map(isAuth => !isAuth)
                )]
            },
            {
                path: 'payment',
                loadComponent: () => import('./new/checkout-page.component').then(m => m.CheckoutPageComponent),
                // canActivate: [checkoutGuard]
            },
            {
                path: 'confirmation',
                loadComponent: () => import('./confirmation.component').then(m => m.OrderConfirmationComponent),
                // canActivate: [checkoutGuard]
            },
        ]
    }
];