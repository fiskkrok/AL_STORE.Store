import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectionMonitorComponent } from './connection-monitor.component';

describe('ConnectionMonitorComponent', () => {
  let component: ConnectionMonitorComponent;
  let fixture: ComponentFixture<ConnectionMonitorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConnectionMonitorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConnectionMonitorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
