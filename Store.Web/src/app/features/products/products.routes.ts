// src/app/features/products/products.routes.ts
import { provideHttpClient } from '@angular/common/http';
import { Routes } from '@angular/router';

export const PRODUCT_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('./pages/product-list/product-list.page').then(m => m.ProductListPageComponent),
        providers: [
            provideHttpClient()
        ]
    },
    {
        path: ':id',
        loadComponent: () => import('./pages/product-detail/product-detail.page')
            .then(m => m.ProductDetailPageComponent),
    },

];