import { Component, Inject, OnInit } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';

export interface DialogTemplate {
  title?: string;
  description?: string;
  options: Array<{
    value: string;
    callback: () => void;
    complete?: boolean;
    settings?: {
      value: string;
      color?: string;
      callback: () => void;
    }
  }>;
  styles?: Record<string, Record<string, string>>;
  bottomLabel?: string;
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
    console.log(this.data?.bottomLabel)
    if(this.data && this.data.styles) {
      if(this.data.styles['fullScreen']) {
        const element: HTMLElement = document.querySelector('.mat-bottom-sheet-container');

        element.style.maxHeight = 'unset';
      }
      if(this.data.styles.title) {
        setTimeout(()=> {
          const element: HTMLElement = document.querySelector('.dialog-title');
          element.style.color = this.data.styles.title.color;
          element.style.fontFamily = this.data.styles.title.fontFamily;
          element.style.fontSize = this.data.styles.title.fontSize;
        }, 1000)
      }
      if(this.data.styles.description) {
        setTimeout(()=> {
          const element: HTMLElement = document.querySelector('.description');
          element.style.color = this.data.styles.description.color;
          element.style.backgroundColor = this.data.styles.description.backgroundColor;
          element.style.fontFamily = this.data.styles.description.fontFamily;
          element.style.fontSize = this.data.styles.description.fontSize;
          element.style.borderRadius = this.data.styles.description.borderRadius;
          element.style.opacity = this.data.styles.description.opacity;
          element.style.padding = this.data.styles.description.padding;
          element.style.width = this.data.styles.description.width;
        }, 1000)
      }
      if(this.data.styles.noDarkOverlay) {
        const element : HTMLElement = document.querySelector('.cdk-overlay-dark-backdrop');
        element.style.backgroundColor = 'unset';
      }
      if(this.data.styles.lightBg) {
        const element : HTMLElement = document.querySelector('.mat-bottom-sheet-container');
        element.style.backgroundColor = '#403D3D';
      }
    }
    const regex = /Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    const isMobile = regex.test(navigator.userAgent);
    if(!isMobile) {
      const element : HTMLElement = document.querySelector('.cdk-overlay-pane');
      element?.style?.setProperty('max-width', '427px', 'important');
    }
  }

  onClick(index: number) {
    this.selectedIndex = index;
    this.data.options[index].callback();
    this._bottomSheetRef.dismiss();
  }

  onClickSettings(index: number) {
    this.selectedIndex = index;
    this.data.options[index]?.settings.callback();
    this._bottomSheetRef.dismiss();
  }
}
