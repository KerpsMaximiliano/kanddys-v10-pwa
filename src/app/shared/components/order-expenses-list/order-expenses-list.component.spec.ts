import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderExpensesListComponent } from './order-expenses-list.component';

describe('OrderExpensesListComponent', () => {
  let component: OrderExpensesListComponent;
  let fixture: ComponentFixture<OrderExpensesListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrderExpensesListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderExpensesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
