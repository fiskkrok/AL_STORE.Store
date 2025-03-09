// account.routes.ts
import { Routes } from '@angular/router';
import { authGuardFn as authGuard } from '@auth0/auth0-angular';

export const ACCOUNT_ROUTES: Routes = [
    {
        path: '',
        canActivate: [authGuard],
        children: [
            {
                path: 'profile-management',
                loadComponent: () => import('./profile-management.component')
                    .then(m => m.ProfileManagementComponent),
            },
            {
                path: 'orders/:id',
                loadComponent: () => import('./orders/order-history-details.component')
                    .then(m => m.OrderHistoryDetailsComponent),
            },
        ],
    },
];