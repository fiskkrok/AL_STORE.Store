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
      ratings: {
        average: 4.5,
        count: 12
      },
      categories: ['mens', 'shirts'],
      tags: ['classic', 'formal'],
      images: [
        { id: '1', url: '/api/placeholder/500/500', alt: 'Front view' }
      ],
      variants: [
        {
          id: '1-1',
          name: 'White - M',
          price: 89.99,
          stockLevel: 5,
        },
        {
          id: '1-2',
          name: 'White - M',
          sku: 'OXF-WHT-M',
          price: 89.99,
          stockLevel: 10,
          attributes: {
            color: 'White',
            size: 'M'
          }
        }
      ],
      attributes: {
        material: '100% Cotton',
        care: 'Machine washable',
        fit: 'Regular fit',
        collar: 'Button-down collar'
      },
    },
    // Add more products...
  ];

  getProducts(): Observable<Product[]> {
    return of(this.products).pipe(delay(500)); // Simulate network delay
  }

  getProduct(id: string): Observable<Product> {
    const product = this.products.find(p => p.id === id);
    if (!product) {
      return throwError(() => new Error(`Product with id ${id} not found`));
    }
    return of(product).pipe(delay(500));
  }

  getRelatedProducts(productId: string): Observable<Product[]> {
    const related = this.products.filter(p => p.id !== productId).slice(0, 4);
    return of(related).pipe(delay(500));
  }
}