import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CartDropdownComponent } from './cart-dropdown.component';

describe('CartDropdownComponent', () => {
  let component: CartDropdownComponent;
  let fixture: ComponentFixture<CartDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CartDropdownComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CartDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
