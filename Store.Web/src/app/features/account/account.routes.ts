// account.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const ACCOUNT_ROUTES: Routes = [
    {
        path: '',
        canActivate: [authGuard],
        children: [
            {
                path: '',
                loadComponent: () => import('./account-overview.component')
                    .then(m => m.AccountOverviewComponent)
            },
            {
                path: 'orders',
                loadComponent: () => import('./order-history.component')
                    .then(m => m.OrderHistoryComponent)
            },
            // {
            //     path: 'profile',
            //     loadComponent: () => import('./profile-settings/profile-settings.component')
            //         .then(m => m.ProfileSettingsComponent)
            // }
        ]
    }
];