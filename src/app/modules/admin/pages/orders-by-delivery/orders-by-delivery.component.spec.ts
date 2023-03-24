import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdersByDeliveryComponent } from './orders-by-delivery.component';

describe('OrdersByDeliveryComponent', () => {
  let component: OrdersByDeliveryComponent;
  let fixture: ComponentFixture<OrdersByDeliveryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrdersByDeliveryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrdersByDeliveryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
