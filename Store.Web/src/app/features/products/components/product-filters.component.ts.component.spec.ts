import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductFiltersComponentTsComponent } from './product-filters.component.ts.component';

describe('ProductFiltersComponentTsComponent', () => {
  let component: ProductFiltersComponentTsComponent;
  let fixture: ComponentFixture<ProductFiltersComponentTsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductFiltersComponentTsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductFiltersComponentTsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
