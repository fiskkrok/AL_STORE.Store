/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/core/state/cart.store.ts
import { Injectable, computed, signal } from '@angular/core';
import { SignalRService } from '../services/signalr.service';

export interface CartItem {
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
    // State
    private readonly items = signal<CartItem[]>([]);
    private readonly isLoading = signal(false);
    private readonly recentItem = signal<CartItem | null>(null);

    // Computed Values
    readonly cartItems = computed(() => this.items());
    readonly loading = computed(() => this.isLoading());
    readonly recentlyAddedItem = computed(() => this.recentItem());

    readonly totalItems = computed(() =>
        this.items().reduce((sum, item) => sum + item.quantity, 0)
    );

    readonly totalPrice = computed(() =>
        this.items().reduce((sum, item) => sum + (item.price * item.quantity), 0)
    );

    constructor(private signalR: SignalRService) {
        this.signalR.subscribeToCart(this.handleCartUpdate.bind(this));
        this.loadCartFromStorage();
    }

    private loadCartFromStorage() {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            this.items.set(JSON.parse(savedCart));
        }
    }

    private saveCartToStorage() {
        localStorage.setItem('cart', JSON.stringify(this.items()));
    }

    async addItem(newItem: Omit<CartItem, 'id'>): Promise<CartItem> {
        this.isLoading.set(true);
        try {
            const existingItemIndex = this.items().findIndex(item =>
                item.productId === newItem.productId &&
                item.variantId === newItem.variantId
            );

            let addedItem: CartItem;

            if (existingItemIndex !== -1) {
                // Update quantity of existing item
                const updatedItems = [...this.items()];
                updatedItems[existingItemIndex] = {
                    ...updatedItems[existingItemIndex],
                    quantity: updatedItems[existingItemIndex].quantity + newItem.quantity
                };
                addedItem = updatedItems[existingItemIndex];
                this.items.set(updatedItems);
            } else {
                // Add new item
                addedItem = { ...newItem, id: crypto.randomUUID() };
                this.items.update(items => [...items, addedItem]);
            }

            this.recentItem.set(addedItem);
            this.saveCartToStorage();
            return addedItem;

        } catch (error) {
            console.error('Error adding item to cart:', error);
            throw error;
        } finally {
            this.isLoading.set(false);
        }
    }

    async updateQuantity(itemId: string, quantity: number): Promise<void> {
        if (quantity <= 0) {
            await this.removeItem(itemId);
            return;
        }

        this.items.update(items =>
            items.map(item =>
                item.id === itemId
                    ? { ...item, quantity }
                    : item
            )
        );
        this.saveCartToStorage();
    }

    async removeItem(itemId: string): Promise<void> {
        this.items.update(items => items.filter(item => item.id !== itemId));
        this.saveCartToStorage();
    }

    clearCart(): void {
        this.items.set([]);
        this.recentItem.set(null);
        localStorage.removeItem('cart');
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
        this.saveCartToStorage();
    }
}