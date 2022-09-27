import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MerchantBuyersComponent } from './merchant-buyers.component';

describe('MerchantBuyersComponent', () => {
  let component: MerchantBuyersComponent;
  let fixture: ComponentFixture<MerchantBuyersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MerchantBuyersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MerchantBuyersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
