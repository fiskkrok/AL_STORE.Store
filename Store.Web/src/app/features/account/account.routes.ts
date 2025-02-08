// account.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const ACCOUNT_ROUTES: Routes = [
    {
        path: '',
        canActivate: [authGuard],
        children: [
            {
                path: 'profile-management',
                loadComponent: () => import('./profile-management.component')
                    .then(m => m.ProfileManagementComponent)
            }
        ]
    }
];