import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrderProgressFilteringComponent } from '../order-progress-filtering/order-progress-filtering.component';


describe('OrderProgressFilteringComponent', () => {
  let component: OrderProgressFilteringComponent;
  let fixture: ComponentFixture<OrderProgressFilteringComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrderProgressFilteringComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderProgressFilteringComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
