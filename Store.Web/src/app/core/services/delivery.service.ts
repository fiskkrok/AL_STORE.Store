import { Injectable, inject } from "@angular/core";
import { catchError, Observable, of } from "rxjs";
import { environment } from "../../../environments/environment";
import { HttpClient } from "@angular/common/http";

// services/delivery.service.ts
export interface DeliveryOption {
  id: string;
  name: string;
  description: string;
  estimatedDelivery: string;
  price: number;
  currency: string;
  logo: string;
}
export interface DeliveryOptionsResponse {
  deliveryOptions: DeliveryOption[];
}


@Injectable({ providedIn: 'root' })
export class DeliveryService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/delivery`;

  getDeliveryOptions(postalCode: string): Observable<DeliveryOptionsResponse> {
    return this.http.get<DeliveryOptionsResponse>(`${this.apiUrl}/options`, {
      params: { postalCode }
    }).pipe(
      catchError(() => of({ deliveryOptions: this.getFallbackOptions() }))
    );
  }

  // Fallback delivery options if API call fails
  private getFallbackOptions(): DeliveryOption[] {
    return [
      {
        id: 'postnord-home',
        name: 'PostNord Hemleverans',
        description: 'Leverans direkt till din dörr',
        estimatedDelivery: '1-3 arbetsdagar',
        price: 49,
        currency: 'SEK',
        logo: 'assets/delivery/postnord.svg'
      },
      {
        id: 'postnord-pickup',
        name: 'PostNord Ombud',
        description: 'Hämta ditt paket hos ombud',
        estimatedDelivery: '1-2 arbetsdagar',
        price: 0,
        currency: 'SEK',
        logo: 'assets/delivery/postnord.svg'
      },
      {
        id: 'instabox',
        name: 'Instabox',
        description: 'Leverans till Instabox-skåp',
        estimatedDelivery: 'Inom 24 timmar',
        price: 29,
        currency: 'SEK',
        logo: 'assets/delivery/instabox.svg'
      },
      {
        id: 'dhl',
        name: 'DHL Express',
        description: 'Expressleverans direkt till dörren',
        estimatedDelivery: 'Nästa arbetsdag',
        price: 99,
        currency: 'SEK',
        logo: 'assets/delivery/dhl.svg'
      }
    ];
  }
}

