import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatDialogRef } from '@angular/material/dialog';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-receipt-dialog',
  templateUrl: './fiscal-receipt-dialog.component.html',
  styleUrls: ['./fiscal-receipt-dialog.component.scss'],
})
export class FiscalReceiptDialogComponent implements OnInit {
  formNewDataFiscal: FormGroup;
  // UI methods
  assetsFolder: string = environment.assetsUrl;
  showLoginFlow: boolean = false;
  showFiscalForm: boolean = true;

  constructor(
    private _bottomSheetRef: MatBottomSheetRef,
    private fb: FormBuilder,
  ) {}

  ngOnInit(): void {
    this.formNewDataFiscal = this.fb.group({
      nif: ['', [Validators.required]],
      name: ['', [Validators.required]],
    });
  }

  changeLogin() {
    this.showLoginFlow = true;
  }
  resetValueShowLoginFlow($event: any) {
    this.showLoginFlow = $event;
  }

  sendData() {
    if (this.formNewDataFiscal.valid) {
      localStorage.setItem(
        'partial_data_fiscal',
        JSON.stringify(this.formNewDataFiscal.value)
      );
    }
    this._bottomSheetRef.dismiss();
  }
}
