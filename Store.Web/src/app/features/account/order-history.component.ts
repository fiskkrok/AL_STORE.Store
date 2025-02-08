import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-order-history',
  standalone: true,
  template: `<div class="order-history">Order History Content</div>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderHistoryComponent { }
