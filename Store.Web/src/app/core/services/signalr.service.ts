/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { environment } from '../../../environments/environment';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  private hubConnection: HubConnection;
  private connectionState = new BehaviorSubject<boolean>(false);
  connectionState$ = this.connectionState.asObservable();

  constructor() {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(`${environment.apiUrl}/hubs/store`)
      .withAutomaticReconnect()
      .build();

    this.setupConnectionHandlers();
  }

  private setupConnectionHandlers(): void {
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
    }).catch(err => {
      console.error('Error while starting connection: ' + err);
      this.connectionState.next(false);
    });
  }

  subscribeToCart(callback: (update: any) => void): void {
    this.hubConnection.on('CartUpdated', callback);
  }

  subscribeToProductUpdates(callback: (update: any) => void): void {
    this.hubConnection.on('ProductUpdated', callback);
  }
}