import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliveryZonesManagerComponent } from './delivery-zones-manager.component';

describe('DeliveryZonesManagerComponent', () => {
  let component: DeliveryZonesManagerComponent;
  let fixture: ComponentFixture<DeliveryZonesManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeliveryZonesManagerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeliveryZonesManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
