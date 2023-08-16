import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MerchantOffersComponent } from './merchant-offers.component';

describe('MerchantOffersComponent', () => {
  let component: MerchantOffersComponent;
  let fixture: ComponentFixture<MerchantOffersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MerchantOffersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MerchantOffersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
