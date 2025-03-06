import { Component, inject, OnInit, signal } from '@angular/core';
import { CustomerService } from '../../core/services/customer.service';
import { LoadingSpinnerComponent } from '../../core/components/loading-spinner.component';
import { PersonalInfoComponent } from "./personal-info.component";
import { AddressBookComponent } from "./address-book.component";
import { OrderHistoryComponent } from "./order-history.component";
import { PreferencesComponent } from "./preferences.component";
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-profile-management',
    standalone: true,
    imports: [LoadingSpinnerComponent, PersonalInfoComponent, AddressBookComponent, OrderHistoryComponent, PreferencesComponent],
    template: `
        <div class="container mx-auto px-4 py-8 text-foreground" >
            <h1 class="text-2xl font-bold mb-8">Profile Settings</h1>

            @if (customerService.isLoading()) {
                <app-loading-spinner />
            } @else {
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <!-- Navigation Sidebar -->
                    <div class="md:col-span-1">
                        <nav class="space-y-1">
                            @for (section of sections; track section.id) {
                                <button
                                    class="w-full px-4 py-2 text-left rounded-lg transition-colors"
                                    [class.bg-primary]="activeSection() === section.id"
                                    [class.text-primary-foreground]="activeSection() === section.id"
                                    [class.hover:bg-muted]="activeSection() !== section.id"
                                    (click)="setActiveSection(section.id)"
                                >
                                    {{ section.label }}
                                </button>
                            }
                        </nav>
                    </div>

                    <!-- Content Area -->
                    <div class="md:col-span-2">
                        @switch (activeSection()) {
                            @case ('personal') {
                                <app-personal-info />
                            }
                            @case ('addresses') {
                                <app-address-book />
                            }
                            @case ('preferences') {
                                <app-preferences />
                            }
                            @case ('orders') {
                                <app-order-history />
                            }
                        }
                    </div>
                </div>
            }
        </div>
    `
})
export class ProfileManagementComponent implements OnInit {
    public customerService = inject(CustomerService);
    private route = inject(ActivatedRoute);

    sections = [
        { id: 'personal', label: 'Personal Information' },
        { id: 'addresses', label: 'Addresses' },
        { id: 'preferences', label: 'Preferences' },
        { id: 'orders', label: 'Order History' }
    ] as const;

    activeSection = signal<(typeof this.sections)[number]['id']>('personal');

    ngOnInit() {
        // Check for tab query parameter
        this.route.queryParams.subscribe(params => {
            const tab = params['tab'];
            if (tab && this.sections.some(section => section.id === tab)) {
                this.activeSection.set(tab as any);
            }
        });
    }

    setActiveSection(section: (typeof this.sections)[number]['id']) {
        this.activeSection.set(section);
    }
}