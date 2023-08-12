import { Component, Inject, OnInit } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';

export interface DialogTemplate {
  title?: string;
  description: string;
  options: Array<{
    value: string;
    callback: () => void;
  }>;
  styles?: Record<string, Record<string, boolean>>;
}

@Component({
  selector: 'app-options-menu',
  templateUrl: './options-menu.component.html',
  styleUrls: ['./options-menu.component.scss']
})
export class OptionsMenuComponent implements OnInit {

  selectedIndex: number;

  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: DialogTemplate,
    private _bottomSheetRef: MatBottomSheetRef
  ) {}

  ngOnInit(): void {
    if(this.data && this.data.styles && this.data.styles['fullScreen']) {
      const element: HTMLElement = document.querySelector('.mat-bottom-sheet-container');

      element.style.maxHeight = 'unset';
    }
  }

  onClick(index: number) {
    this.selectedIndex = index;
    this.data.options[index].callback();
    this._bottomSheetRef.dismiss();
  }

}
