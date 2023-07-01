import {
  Component,
  OnInit,
  ViewChildren,
  ElementRef,
  QueryList,
  Inject,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  MatBottomSheetRef,
  MAT_BOTTOM_SHEET_DATA,
} from '@angular/material/bottom-sheet';
import { environment } from 'src/environments/environment';

export interface DialogTemplate {
  label: string;
  styles?: Record<string, Record<string, boolean>>;
  callback: (value) => void;
}

@Component({
  selector: 'app-input-dialog',
  templateUrl: './input-dialog.component.html',
  styleUrls: ['./input-dialog.component.scss'],
})
export class InputDialogComponent implements OnInit {

  form: FormGroup = new FormGroup({
    metaDescription: new FormControl('', [
      Validators.required
    ])
  });

  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: DialogTemplate,
    private _bottomSheetRef: MatBottomSheetRef
  ) {}

  env: string = environment.assetsUrl;
  URI: string = environment.uri;

  ngOnInit(): void {
    if(this.data && this.data.styles && this.data.styles['fullScreen']) {
      const element: HTMLElement = document.querySelector('.mat-bottom-sheet-container');

      element.style.maxHeight = 'unset';
    }
  }

  onClick() {
    this.data.callback(this.form.controls['metaDescription']?.value);
    this._bottomSheetRef.dismiss();
  }
}
