// src/app/core/services/mock-data.service.ts
import { Injectable } from '@angular/core';
import { Product } from '../models/product.model';
import { Observable, of, delay, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MockDataService {
  private products: Product[] = [
    {
      id: '1',
      name: 'Classic Oxford Shirt',
      description: 'A timeless oxford shirt crafted from premium cotton.',
      price: 89.99,
      compareAtPrice: 99.99,
      stockLevel: 15,
      imageUrl: '/api/placeholder/500/500',
      categoryId: '1',
      sku: 'OXF-WHT-M',
      brand: 'Classic Brand',
      images: [
        {
          id: '1',
          url: '/api/placeholder/500/500',
          alt: 'Classic Oxford Shirt'
        }
      ],
      variants: [],
      attributes: {
        material: '100% Cotton',
        care: 'Machine washable'
      },
      ratings: {
        average: 4.5,
        count: 12
      },
      categories: ['mens', 'shirts'],
      tags: ['classic', 'formal'],
      createdAt: new Date()
    },
    {
      id: '2',
      name: 'Slim Fit Jeans',
      description: 'Modern slim fit jeans in premium denim.',
      price: 79.99,
      compareAtPrice: null,
      stockLevel: 25,
      imageUrl: '/api/placeholder/500/500',
      categoryId: '2',
      sku: 'JNS-BLU-32',
      brand: 'Denim Co',
      images: [
        {
          id: '2',
          url: '/api/placeholder/500/500',
          alt: 'Slim Fit Jeans'
        }
      ],
      variants: [],
      attributes: {
        material: '98% Cotton, 2% Elastane',
        care: 'Machine washable'
      },
      ratings: {
        average: 4.2,
        count: 18
      },
      categories: ['mens', 'jeans'],
      tags: ['casual', 'denim'],
      createdAt: new Date()
    }
  ];

  getProducts(): Observable<Product[]> {
    console.log('MockDataService: Returning products:', this.products); // Add logging
    return of(this.products).pipe(delay(500)); // Simulate network delay
  }

  getProduct(id: string): Observable<Product> {
    console.log('MockDataService: Getting product with id:', id); // Add logging
    const product = this.products.find(p => p.id === id);
    if (!product) {
      return throwError(() => new Error(`Product with id ${id} not found`));
    }
    return of(product).pipe(delay(500));
  }

  getRelatedProducts(productId: string): Observable<Product[]> {
    console.log('MockDataService: Getting related products for product with id:', productId); // Add logging
    const related = this.products.filter(p => p.id !== productId).slice(0, 4);
    return of(related).pipe(delay(500));
  }
}