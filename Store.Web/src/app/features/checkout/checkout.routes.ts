// checkout.routes.ts
import { Routes } from '@angular/router';
import { checkoutGuard } from '../../core/guards/checkout.guard';
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
                redirectTo: 'information',
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
                path: 'information',
                loadComponent: () => import('./checkout-information.component').then(m => m.CheckoutInformationComponent),
            },
            {
                path: 'payment',
                loadComponent: () => import('./checkout.component').then(m => m.CheckoutComponent),
                canActivate: [checkoutGuard]
            },
            {
                path: 'confirmation',
                loadComponent: () => import('./confirmation.component').then(m => m.ConfirmationComponent),
                canActivate: [checkoutGuard]
            }
        ]
    }
];