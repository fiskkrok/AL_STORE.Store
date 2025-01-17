// src/app/core/services/product.service.ts
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Product, ProductFilter } from '../models/product.model';
import { MockDataService } from './mock-data.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private mockData = inject(MockDataService);
  private useRealApi = environment.useRealApi;

  getProduct(id: string): Observable<Product> {
    if (this.useRealApi) {
      throw new Error('Real API not implemented');
    }
    return this.mockData.getProduct(id);
  }

  getProducts(): Observable<Product[]> {
    if (this.useRealApi) {
      throw new Error('Real API not implemented');
    }
    return this.mockData.getProducts();
  }

  getRelatedProducts(productId: string): Observable<Product[]> {
    if (this.useRealApi) {
      throw new Error('Real API not implemented');
    }
    return this.mockData.getRelatedProducts(productId);
  }
}