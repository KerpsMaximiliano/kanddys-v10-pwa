import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ItemSalesDetailComponent } from './item-sales-detail.component';

describe('ItemSalesDetailComponent', () => {
  let component: ItemSalesDetailComponent;
  let fixture: ComponentFixture<ItemSalesDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ItemSalesDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemSalesDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
