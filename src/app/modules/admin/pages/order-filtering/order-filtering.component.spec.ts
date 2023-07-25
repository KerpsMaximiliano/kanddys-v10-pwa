import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderFilteringComponent } from './order-filtering.component';

describe('OrderFilteringComponent', () => {
  let component: OrderFilteringComponent;
  let fixture: ComponentFixture<OrderFilteringComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrderFilteringComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderFilteringComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
