// app.routes.ts
import { Routes } from '@angular/router';
import { authGuardFn as authGuard } from '@auth0/auth0-angular';
import { AuthCallbackComponent } from './features/auth/callback.component';
export const routes: Routes = [
  {
    path: 'auth',
    children: [
      {
        path: 'callback',
        component: AuthCallbackComponent
      }
    ]
  },
  {
    path: '',
    loadComponent: () => import('./features/home/home.component')
      .then(m => m.HomeComponent)
  },
  {
    path: 'products',
    loadChildren: () => import('./features/products/products.routes')
      .then(m => m.PRODUCT_ROUTES)
  },
  {
    path: 'cart',
    loadComponent: () => import('./features/cart/cart.component')
      .then(m => m.CartComponent)
  },
  {
    path: 'checkout',
    loadChildren: () => import('./features/checkout/checkout.routes')
      .then(m => m.CHECKOUT_ROUTES)
  },
  {
    path: 'account',
    canActivate: [authGuard],
    loadChildren: () => import('./features/account/account.routes')
      .then(m => m.ACCOUNT_ROUTES)
  }
];