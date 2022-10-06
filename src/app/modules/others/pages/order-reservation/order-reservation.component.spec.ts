import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderReservationComponent } from './order-reservation.component';

describe('OrderReservationComponent', () => {
  let component: OrderReservationComponent;
  let fixture: ComponentFixture<OrderReservationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrderReservationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderReservationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
