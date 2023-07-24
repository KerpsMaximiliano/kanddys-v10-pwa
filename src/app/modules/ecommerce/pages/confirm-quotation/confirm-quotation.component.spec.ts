import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmQuotationComponent } from './confirm-quotation.component';

describe('ConfirmQuotationComponent', () => {
  let component: ConfirmQuotationComponent;
  let fixture: ComponentFixture<ConfirmQuotationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfirmQuotationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmQuotationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
