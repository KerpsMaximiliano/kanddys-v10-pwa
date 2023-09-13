import { Component, OnInit } from '@angular/core';
import {
  MatBottomSheetRef,
  MAT_BOTTOM_SHEET_DATA,
} from '@angular/material/bottom-sheet';

@Component({
  selector: 'app-message-dialog',
  templateUrl: './message-dialog.component.html',
  styleUrls: ['./message-dialog.component.scss']
})
export class MessageDialogComponent implements OnInit {

  constructor(
    private bottomSheetRef: MatBottomSheetRef
  ) { }

  ngOnInit(): void {
  }

  close() {
    this.bottomSheetRef.dismiss()
  }

}
