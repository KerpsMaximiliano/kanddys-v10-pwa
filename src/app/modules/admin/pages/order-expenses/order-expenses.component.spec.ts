import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderExpensesComponent } from './order-expenses.component';

describe('OrderExpensesComponent', () => {
  let component: OrderExpensesComponent;
  let fixture: ComponentFixture<OrderExpensesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrderExpensesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderExpensesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
