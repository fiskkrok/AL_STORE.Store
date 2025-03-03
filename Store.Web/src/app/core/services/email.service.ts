// src/app/core/services/email.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { OrderConfirmation } from '../../shared/models/checkout.model';

@Injectable({ providedIn: 'root' })
export class EmailService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/emails`;

  sendOrderConfirmation(order: OrderConfirmation): Observable<void> {
    if (!environment.useRealApi) {
      // For development/testing, log the email that would be sent
      console.log('Sending order confirmation email to:', order.customerEmail);
      console.log('Order details:', order);
      return of(void 0);
    }

    return this.http.post<void>(`${this.apiUrl}/order-confirmation`, {
      orderNumber: order.orderNumber,
      email: order.customerEmail
    });
  }

  // For testing purposes, we can render what the email would look like
  getEmailPreview(order: OrderConfirmation): string {
    return `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #1A2238; padding: 20px; text-align: center; color: white;">
          <h1>Order Confirmation</h1>
        </div>
        
        <div style="padding: 20px;">
          <p>Dear ${order.shippingAddress.firstName} ${order.shippingAddress.lastName},</p>
          
          <p>Thank you for your order! We're pleased to confirm that we've received your order.</p>
          
          <p><strong>Order Number:</strong> ${order.orderNumber}</p>
          <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
          
          <h2>Order Summary</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f3f4f6;">
                <th style="padding: 10px; text-align: left;">Item</th>
                <th style="padding: 10px; text-align: center;">Quantity</th>
                <th style="padding: 10px; text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
                  <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
                  <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">${item.price.toFixed(2)} SEK</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding: 10px; text-align: right;"><strong>Total</strong></td>
                <td style="padding: 10px; text-align: right;"><strong>${order.total.toFixed(2)} SEK</strong></td>
              </tr>
            </tfoot>
          </table>
          
          <h2>Shipping Address</h2>
          <p>
            ${order.shippingAddress.firstName} ${order.shippingAddress.lastName}<br>
            ${order.shippingAddress.street}<br>
            ${order.shippingAddress.city}, ${order.shippingAddress.postalCode}<br>
            ${order.shippingAddress.country}
          </p>
          
          <p>We'll notify you when your order has been shipped.</p>
          
          <p>Thank you for shopping with us!</p>
          
          <p>Best regards,<br>The Store Team</p>
        </div>
        
        <div style="background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #6b7280;">
          <p>© 2025 Your Store. All rights reserved.</p>
        </div>
      </div>
    `;
  }
}