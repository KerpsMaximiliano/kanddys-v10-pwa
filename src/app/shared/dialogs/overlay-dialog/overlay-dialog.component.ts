import { Component, Inject, OnInit } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';

export interface DialogTemplate {
  title?: string;
  description?: string;
  text1?: string;
  buttons: Array<{
    value: string;
    callback: () => void;
    class?: {
      color?: string;
      background?: string;
      fontFamily?: string;
      fontSize?: string;
      border?: string;
    };
    complete?: boolean;
  }>;
  styles?: Record<string, Record<string, string>>;
  bottomLabel?: string;
  showActive?: boolean;
}


@Component({
  selector: 'app-overlay-dialog',
  templateUrl: './overlay-dialog.component.html',
  styleUrls: ['./overlay-dialog.component.scss']
})
export class OverlayDialogComponent implements OnInit {

  showOverlay: boolean;
  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: DialogTemplate,
    private _bottomSheetRef: MatBottomSheetRef
  ) {}
  
  ngOnInit(): void {
    this.showOverlay = this.data.showActive;
  }

  toggleOverlay() {
    // this.showOverlay = !this.showOverlay;
    this._bottomSheetRef.dismiss()
  }

  onClick(index: number) {
    this.data.buttons[index].callback();
    this._bottomSheetRef.dismiss();
  }
}
