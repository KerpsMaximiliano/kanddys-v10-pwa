import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderImageLoadComponent } from './order-image-load.component';

describe('OrderImageLoadComponent', () => {
  let component: OrderImageLoadComponent;
  let fixture: ComponentFixture<OrderImageLoadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrderImageLoadComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderImageLoadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
