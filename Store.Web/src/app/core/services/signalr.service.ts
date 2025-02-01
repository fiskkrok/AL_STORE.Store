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
  private hubConnection: HubConnection;
  private connectionState = new BehaviorSubject<boolean>(false);
  connectionState$ = this.connectionState.asObservable();
  onStockUpdate = new BehaviorSubject<StockUpdate | null>(null);
  onPriceUpdate = new BehaviorSubject<PriceUpdate | null>(null);

  constructor() {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(`${environment.apiUrl}/hubs/store`)
      .withAutomaticReconnect()
      .build();

    this.setupConnectionHandlers();
    this.setupProductUpdatesHandlers();
  }

  private setupConnectionHandlers(): void {
    // ...existing code...
  }

  private setupProductUpdatesHandlers(): void {
    this.hubConnection.on('StockUpdated', (productId: string, newStockLevel: number) => {
      this.onStockUpdate.next({ productId, newStockLevel });
    });

    this.hubConnection.on('PriceUpdated', (productId: string, newPrice: number) => {
      this.onPriceUpdate.next({ productId, newPrice });
    });
  }

  subscribeToCart(callback: (update: any) => void): void {
    this.hubConnection.on('CartUpdated', callback);
  }

  subscribeToProductUpdates(callback: (update: any) => void): void {
    this.hubConnection.on('ProductUpdated', callback);
  }
}