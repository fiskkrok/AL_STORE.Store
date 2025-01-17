import { Injectable, computed, signal } from '@angular/core';
import { SignalRService } from '../services/signalr.service';

interface CartItem {
    id: string;
    productId: string;
    name: string;
    price: number;
    quantity: number;
    imageUrl: string;
    variantId?: string;
}

@Injectable({ providedIn: 'root' })
export class CartStore {
    updateQuantity(id: any, newQuantity: any) {
        throw new Error('Method not implemented.');
    }
    removeItem(id: any) {
        throw new Error('Method not implemented.');
    }
    private readonly items = signal<CartItem[]>([]);
    private readonly isLoading = signal(false);

    readonly cartItems = computed(() => this.items());
    readonly loading = computed(() => this.isLoading());
    readonly totalItems = computed(() =>
        this.items().reduce((sum, item) => sum + item.quantity, 0)
    );
    readonly totalPrice = computed(() =>
        this.items().reduce((sum, item) => sum + (item.price * item.quantity), 0)
    );

    constructor(private signalR: SignalRService) {
        // Subscribe to real-time cart updates
        this.signalR.subscribeToCart(this.handleCartUpdate.bind(this));
    }

    async addItem(item: Omit<CartItem, 'id'>): Promise<void> {
        this.isLoading.set(true);
        try {
            // Optimistic update
            const newItem = { ...item, id: crypto.randomUUID() };
            this.items.update(items => [...items, newItem]);

            // API call would go here

        } catch (error) {
            // Rollback on error
            this.items.update(items => items.filter(i => i.productId !== item.productId));
            throw error;
        } finally {
            this.isLoading.set(false);
        }
    }

    private handleCartUpdate(update: any): void {
        switch (update.type) {
            case 'ItemAdded':
                this.items.update(items => [...items, update.item]);
                break;
            case 'ItemRemoved':
                this.items.update(items =>
                    items.filter(item => item.id !== update.itemId)
                );
                break;
            case 'CartCleared':
                this.items.set([]);
                break;
        }
    }
}