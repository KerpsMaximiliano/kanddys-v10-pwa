import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderStatusViewComponent } from './order-status-view.component';

describe('OrderStatusViewComponent', () => {
  let component: OrderStatusViewComponent;
  let fixture: ComponentFixture<OrderStatusViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrderStatusViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderStatusViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
