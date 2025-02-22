

// src/app/core/services/product.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiConfigService } from './api-config.service';
import { Product, ProductListResponse, ProductQueryParams } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);
  private apiConfig = inject(ApiConfigService);

  getProducts(request: ProductQueryParams = {}): Observable<ProductListResponse> {
    const url = this.apiConfig.getEndpointUrl('products/list');

    // Build query parameters
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

    // Add API Key header
    const headers = new HttpHeaders()
      .set('X-API-Key', this.apiConfig.config.apiKey);

    return this.http.get<ProductListResponse>(url, { params, headers });
  }

  getProduct(id: string): Observable<Product> {
    const url = this.apiConfig.getEndpointUrl('products/detail', { id });

    const headers = new HttpHeaders()
      .set('X-API-Key', this.apiConfig.config.apiKey);

    return this.http.get<Product>(url, { headers });
  }
}