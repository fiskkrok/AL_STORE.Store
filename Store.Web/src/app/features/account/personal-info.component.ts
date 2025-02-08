import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-personal-info',
    standalone: true,
    template: `<div class="personal-info">Personal Information Content</div>`,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PersonalInfoComponent { }
