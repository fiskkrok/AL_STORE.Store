/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/core/services/product.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import {
  Product,
  ProductListResponse,
  GetProductsRequest,
  SyncStatus
} from '../models/product.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  private readonly storeApiUrl = `${environment.apiUrl}/api/store/products`;
  private readonly adminApiUrl = `${environment.apiUrl}/api/admin/products`;

  getProducts(request: GetProductsRequest = {}): Observable<ProductListResponse> {
    let params = new HttpParams()
      .set('page', request.page?.toString() || '1')
      .set('pageSize', request.pageSize?.toString() || '20');

    if (request.search) {
      params = params.set('search', request.search);
    }

    if (request.categories?.length) {
      request.categories.forEach(category => {
        params = params.append('categories', category);
      });
    }

    if (request.minPrice !== undefined) {
      params = params.set('minPrice', request.minPrice.toString());
    }

    if (request.maxPrice !== undefined) {
      params = params.set('maxPrice', request.maxPrice.toString());
    }

    if (request.inStock !== undefined) {
      params = params.set('inStock', request.inStock.toString());
    }

    if (request.sortBy) {
      params = params.set('sortBy', request.sortBy);
    }

    return this.http.get<ProductListResponse>(this.storeApiUrl, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  getProductDetail(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.storeApiUrl}/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Admin functionality - requires proper authentication
  triggerProductSync(): Observable<SyncStatus> {
    if (!this.auth.isAdmin()) {
      return throwError(() => new Error('Unauthorized: Admin access required'));
    }

    return this.http.post<void>(`${this.adminApiUrl}/sync`, {})
      .pipe(
        map(() => ({ status: 'success' as const })),
        catchError(error => throwError(() => ({
          status: 'error' as const,
          message: error.message || 'Failed to trigger product sync'
        })))
      );
  }

  private handleError(error: any) {
    let errorMessage = 'An error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      errorMessage = error.status === 0
        ? 'Unable to connect to the server'
        : error.error?.message || error.message || errorMessage;
    }

    return throwError(() => new Error(errorMessage));
  }
}