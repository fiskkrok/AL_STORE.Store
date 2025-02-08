import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-address-book',
    standalone: true,
    template: `<div class="address-book">Address Book Content</div>`,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddressBookComponent { }
