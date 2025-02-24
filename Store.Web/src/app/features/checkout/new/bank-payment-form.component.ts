import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-bank-payment-form',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div>
      <h3>Bank Payment</h3>
      <form>
        <!-- Bank payment form fields -->
        <div>
          <label for="bank">Bank</label>
          <select id="bank" name="bank">
            <option value="swedbank">Swedbank</option>
            <option value="seb">SEB</option>
            <option value="handelsbanken">Handelsbanken</option>
            <option value="nordea">Nordea</option>
          </select>
        </div>
        <div>
          <label for="accountNumber">Account Number</label>
          <input type="text" id="accountNumber" name="accountNumber" />
        </div>
        <button type="submit">Pay</button>
      </form>
    </div>
  `
})
export class BankPaymentFormComponent { }