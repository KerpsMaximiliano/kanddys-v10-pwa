import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliveryZonesComponent } from './delivery-zones.component';

describe('DeliveryZonesComponent', () => {
  let component: DeliveryZonesComponent;
  let fixture: ComponentFixture<DeliveryZonesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeliveryZonesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeliveryZonesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
