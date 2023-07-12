import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuotationBidsComponent } from './quotation-bids.component';

describe('QuotationBidsComponent', () => {
  let component: QuotationBidsComponent;
  let fixture: ComponentFixture<QuotationBidsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuotationBidsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QuotationBidsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
