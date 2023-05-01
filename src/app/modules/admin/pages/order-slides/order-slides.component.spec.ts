import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderSlidesComponent } from './order-slides.component';

describe('OrderSlidesComponent', () => {
  let component: OrderSlidesComponent;
  let fixture: ComponentFixture<OrderSlidesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrderSlidesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderSlidesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
