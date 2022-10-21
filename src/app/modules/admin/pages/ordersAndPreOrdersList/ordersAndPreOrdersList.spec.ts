import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdersAndPreOrdersList } from './ordersAndPreOrdersList';

describe('OrdersAndPreOrdersList', () => {
  let component: OrdersAndPreOrdersList;
  let fixture: ComponentFixture<OrdersAndPreOrdersList>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrdersAndPreOrdersList ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrdersAndPreOrdersList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
