// src/app/core/components/address/address-form.component.spec.ts

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddressFormComponent } from './address-form.component';
import { FormlyModule } from '@ngx-formly/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('AddressFormComponent', () => {
    let component: AddressFormComponent;
    let fixture: ComponentFixture<AddressFormComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                AddressFormComponent,
                FormlyModule.forRoot(),
                NoopAnimationsModule
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(AddressFormComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
        expect(component.model.country).toBe('SE');
        expect(component.model.setAsDefault).toBe(false);
    });

    it('should populate form with initial data', () => {
        const initialData = {
            street: 'Test Street 1',
            city: 'Stockholm',
            postalCode: '12345'
        };

        component.initialData.set(initialData);
        fixture.detectChanges();

        expect(component.model.street).toBe(initialData.street);
        expect(component.model.city).toBe(initialData.city);
        expect(component.model.postalCode).toBe(initialData.postalCode);
    });

    it('should validate Swedish postal code format', () => {
        const field = component.fields.find(f => f.key === 'postalCode');
        const pattern = field?.props?.pattern;

        expect('123 45').toMatch(pattern);
        expect('12345').toMatch(pattern);
        expect('123456').not.toMatch(pattern);
        expect('abc45').not.toMatch(pattern);
    });

    it('should emit save event with form data when valid', () => {
        const saveSpy = jest.spyOn(component.save, 'emit');
        const validData = {
            street: 'Test Street 1',
            city: 'Stockholm',
            postalCode: '123 45',
            country: 'SE',
            phone: '',
            setAsDefault: false
        };

        component.form.patchValue(validData);
        component.onSubmit();

        expect(saveSpy).toHaveBeenCalledWith(validData);
    });

    it('should not emit save event when form is invalid', () => {
        const saveSpy = jest.spyOn(component.save, 'emit');

        component.form.patchValue({
            street: '', // Required field missing
            city: 'Stockholm'
        });
        component.onSubmit();

        expect(saveSpy).not.toHaveBeenCalled();
    });
});