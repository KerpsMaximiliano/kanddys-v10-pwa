import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShipmentDataFormComponent } from './shipment-data-form.component';

describe('ShipmentDataFormComponent', () => {
  let component: ShipmentDataFormComponent;
  let fixture: ComponentFixture<ShipmentDataFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShipmentDataFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShipmentDataFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
