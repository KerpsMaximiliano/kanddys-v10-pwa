import { Component, Inject, OnInit } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';

export interface DialogTemplate {
  topText? : string;
  contactText? : string;
  phone? : string;
  message? : string;
}

@Component({
  selector: 'app-contact-us-dialog',
  templateUrl: './contact-us-dialog.component.html',
  styleUrls: ['./contact-us-dialog.component.scss']
})
export class ContactUsDialogComponent implements OnInit {

  link : string;

  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: DialogTemplate,
    private bottomSheetRef: MatBottomSheetRef
  ) {}

  ngOnInit(): void {
    if(this.data.message && this.data.phone) {
      this.link =`https://api.whatsapp.com/send?phone=${this.data.phone}&text=${encodeURIComponent(
        this.data.message
      )}`;
    }
  }

  dismiss() {
    this.bottomSheetRef.dismiss();
  }

}
