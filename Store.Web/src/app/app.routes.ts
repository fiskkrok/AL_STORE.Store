// app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component')
      .then(m => m.HomeComponent)
  },
  {
    path: 'auth/callback',
    loadComponent: () => import('./features/auth/callback.component')
      .then(m => m.AuthCallbackComponent)
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
    canActivate: [authGuard],
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