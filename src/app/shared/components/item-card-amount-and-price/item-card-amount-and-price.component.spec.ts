import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemCardAmountAndPriceComponent } from './item-card-amount-and-price.component';

describe('ItemCardAmountAndPriceComponent', () => {
  let component: ItemCardAmountAndPriceComponent;
  let fixture: ComponentFixture<ItemCardAmountAndPriceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ItemCardAmountAndPriceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemCardAmountAndPriceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
