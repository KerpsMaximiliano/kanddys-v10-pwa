import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateDeliveryZoneComponent } from './create-delivery-zone.component';

describe('CreateDeliveryZoneComponent', () => {
  let component: CreateDeliveryZoneComponent;
  let fixture: ComponentFixture<CreateDeliveryZoneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateDeliveryZoneComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateDeliveryZoneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
