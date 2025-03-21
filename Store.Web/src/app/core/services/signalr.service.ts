import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { environment } from '../../../environments/environment';
import { BehaviorSubject, Subject, Observable } from 'rxjs';

import { BaseService } from './base.service';

export interface StockUpdate {
  productId: string;
  newStockLevel: number;
  timestamp: string;
}

export interface PriceUpdate {
  productId: string;
  newPrice: number;
  oldPrice?: number;
  timestamp: string;
}

export interface CartUpdate {
  productId: string;
  quantity: number;
  cartId: string;
}

export type ProductUpdate = StockUpdate | PriceUpdate;

@Injectable({
  providedIn: 'root'
})
export class SignalRService extends BaseService {

  private hubConnection!: HubConnection;
  private connectionRetryCount = 0;
  private readonly maxRetryAttempts = 5;
  private readonly initialRetryDelay = 1000; // 1 second
  private isConnecting = false;

  // State observables
  private readonly connectionState = new BehaviorSubject<boolean>(false);
  readonly connectionState$ = this.connectionState.asObservable();

  // Event subjects
  private readonly stockUpdateSubject = new Subject<StockUpdate>();
  private readonly priceUpdateSubject = new Subject<PriceUpdate>();
  private readonly cartUpdateSubject = new Subject<CartUpdate>();
  private readonly productUpdateSubject = new Subject<ProductUpdate>();

  // Public observables
  readonly stockUpdates$ = this.stockUpdateSubject.asObservable();
  readonly priceUpdates$ = this.priceUpdateSubject.asObservable();
  readonly cartUpdates$ = this.cartUpdateSubject.asObservable();
  readonly productUpdates$ = this.productUpdateSubject.asObservable();

  constructor() {
    super();
    this.initializeConnection();
  }

  /**
   * Initialize the SignalR connection
   */
  private initializeConnection(): void {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(`${environment.apiUrl}/storehub`)
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: retryContext => {
          // Implement custom retry logic
          if (retryContext.previousRetryCount >= this.maxRetryAttempts) {
            return null; // Stop retrying
          }

          // Exponential backoff with a maximum of 30 seconds
          const delay = Math.min(
            30000,
            this.initialRetryDelay * Math.pow(2, retryContext.previousRetryCount)
          );

          this.logger.info(`SignalR reconnecting attempt ${retryContext.previousRetryCount + 1} in ${delay}ms`);
          return delay;
        }
      })
      .configureLogging(environment.production ? LogLevel.Error : LogLevel.Information)
      .build();

    this.setupConnectionHandlers();
    this.setupEventHandlers();
    this.startConnection();
  }

  /**
   * Set up SignalR connection lifecycle handlers
   */
  private setupConnectionHandlers(): void {
    this.hubConnection.onreconnecting((error) => {
      this.connectionState.next(false);
      this.logger.warn('SignalR connection lost. Attempting to reconnect...', { error });
    });

    this.hubConnection.onreconnected(() => {
      this.connectionState.next(true);
      this.connectionRetryCount = 0;
      this.logger.info('SignalR connection reestablished');
    });

    this.hubConnection.onclose((error) => {
      this.connectionState.next(false);
      this.logger.error('SignalR connection closed', { error });

      // Attempt to restart connection after a delay if we haven't exceeded retry attempts
      if (this.connectionRetryCount < this.maxRetryAttempts) {
        setTimeout(() => this.startConnection(), this.getReconnectDelay());
      } else {
        this.errorService.addError(
          'CONNECTION_ERROR',
          'Real-time updates are currently unavailable. Some features may not work properly.',
          { severity: 'warning', persistent: true }
        );
      }
    });
  }

  /**
   * Set up event handlers for various SignalR events
   */
  private setupEventHandlers(): void {
    // Stock updates
    this.hubConnection.on('StockUpdated', (productId: string, newStockLevel: number) => {
      const update: StockUpdate = {
        productId,
        newStockLevel,
        timestamp: new Date().toISOString()
      };
      this.stockUpdateSubject.next(update);
      this.productUpdateSubject.next(update);
    });

    // Price updates
    this.hubConnection.on('PriceUpdated', (productId: string, newPrice: number, oldPrice?: number) => {
      const update: PriceUpdate = {
        productId,
        newPrice,
        oldPrice,
        timestamp: new Date().toISOString()
      };
      this.priceUpdateSubject.next(update);
      this.productUpdateSubject.next(update);
    });

    // Cart updates
    this.hubConnection.on('CartUpdated', (productId: string, quantity: number, cartId: string) => {
      this.cartUpdateSubject.next({ productId, quantity, cartId });
    });
  }

  /**
   * Start the SignalR connection
   */
  private async startConnection(): Promise<void> {
    if (this.isConnecting || this.hubConnection.state === 'Connected') {
      return;
    }

    this.isConnecting = true;
    this.connectionRetryCount++;

    try {
      await this.hubConnection.start();
      this.connectionState.next(true);
      this.connectionRetryCount = 0;
      this.logger.info('SignalR connection established');
    } catch (error) {
      this.connectionState.next(false);
      this.logger.error('Error starting SignalR connection', { error });

      // Retry connection with exponential backoff
      if (this.connectionRetryCount < this.maxRetryAttempts) {
        const delay = this.getReconnectDelay();
        this.logger.info(`Retrying connection in ${delay}ms (attempt ${this.connectionRetryCount})`);
        setTimeout(() => this.startConnection(), delay);
      } else {
        this.errorService.addError(
          'CONNECTION_ERROR',
          'Unable to establish real-time connection. Some features may not work properly.',
          { severity: 'warning', persistent: true }
        );
      }
    } finally {
      this.isConnecting = false;
    }
  }

  /**
   * Calculate reconnection delay using exponential backoff
   */
  private getReconnectDelay(): number {
    return Math.min(30000, this.initialRetryDelay * Math.pow(2, this.connectionRetryCount));
  }

  /**
   * Manually restart the connection
   */
  restartConnection(): void {
    if (this.hubConnection.state !== 'Disconnected') {
      this.hubConnection.stop().then(() => {
        this.connectionRetryCount = 0;
        this.startConnection();
      });
    } else {
      this.connectionRetryCount = 0;
      this.startConnection();
    }
  }

  /**
   * Subscribe to product stock updates
   */
  subscribeToStockUpdates(): Observable<StockUpdate> {
    return this.stockUpdates$;
  }

  /**
   * Subscribe to product price updates
   */
  subscribeToPriceUpdates(): Observable<PriceUpdate> {
    return this.priceUpdates$;
  }

  /**
   * Subscribe to all product updates
   */
  subscribeToProductUpdates(): Observable<ProductUpdate> {
    return this.productUpdates$;
  }

  /**
   * Subscribe to cart updates
   */
  subscribeToCartUpdates(): Observable<CartUpdate> {
    return this.cartUpdates$;
  }
}