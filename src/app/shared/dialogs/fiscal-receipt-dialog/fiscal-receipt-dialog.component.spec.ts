import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FiscalReceiptDialogComponent } from './fiscal-receipt-dialog.component';

describe('FiscalReceiptDialogComponent', () => {
  let component: FiscalReceiptDialogComponent;
  let fixture: ComponentFixture<FiscalReceiptDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FiscalReceiptDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FiscalReceiptDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
