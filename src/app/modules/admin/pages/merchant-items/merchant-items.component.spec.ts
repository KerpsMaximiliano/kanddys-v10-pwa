import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MerchantItemsComponent } from './merchant-items.component';

describe('MerchantItemsComponent', () => {
  let component: MerchantItemsComponent;
  let fixture: ComponentFixture<MerchantItemsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MerchantItemsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MerchantItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
