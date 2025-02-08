
import { Component, ChangeDetectionStrategy } from '@angular/core';



@Component({
    standalone: true, selector: 'app-preferences',
    template: `<div class="preferences">Preferences Content</div>`,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PreferencesComponent {

}