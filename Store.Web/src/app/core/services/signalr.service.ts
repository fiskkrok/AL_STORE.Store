import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { environment } from '../../../environments/environment';
import { BehaviorSubject } from 'rxjs';

interface StockUpdate {
  productId: string;
  newStockLevel: number;
}

interface PriceUpdate {
  productId: string;
  newPrice: number;
}

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  private readonly hubConnection: HubConnection;
  private readonly connectionState = new BehaviorSubject<boolean>(false);
  connectionState$ = this.connectionState.asObservable();
  onStockUpdate = new BehaviorSubject<StockUpdate | null>(null);
  onPriceUpdate = new BehaviorSubject<PriceUpdate | null>(null);

  constructor() {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(`${environment.apiUrl}/storehub`)
      .withAutomaticReconnect()
      .build();

    this.setupConnectionHandlers();
    this.setupProductUpdatesHandlers();

    this.hubConnection.start().then(() => {
      this.connectionState.next(true);
    }).catch(() => {
      this.connectionState.next(false);
    });
  }

  private setupConnectionHandlers(): void {
    // ...existing code...
    this.hubConnection.onreconnecting(() => {
      this.connectionState.next(false);
    });
    this.hubConnection.onreconnected(() => {
      this.connectionState.next(true);
    });
    this.hubConnection.onclose(() => {
      this.connectionState.next(false);
    });
    this.hubConnection.start().then(() => {
      this.connectionState.next(true);
    }).catch(() => {
      this.connectionState.next(false);
    });
  }

  private setupProductUpdatesHandlers(): void {
    this.hubConnection.on('StockUpdated', (productId: string, newStockLevel: number) => {
      this.onStockUpdate.next({ productId, newStockLevel });
    });

    this.hubConnection.on('PriceUpdated', (productId: string, newPrice: number) => {
      this.onPriceUpdate.next({ productId, newPrice });
    });
  }

  subscribeToCart(callback: (update: { productId: string; quantity: number }) => void): void {
    this.hubConnection.on('CartUpdated', callback);
  }

  subscribeToProductUpdates(callback: (update: StockUpdate | PriceUpdate) => void): void {
    this.hubConnection.on('ProductUpdated', callback);
  }
}