import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderSalesComponent } from './order-sales.component';

describe('OrderSalesComponent', () => {
  let component: OrderSalesComponent;
  let fixture: ComponentFixture<OrderSalesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrderSalesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderSalesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
