import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface OptionsDialogTemplate {
  title?: string;
  description?: string;
  options: Array<{
    value: string;
    callback: () => void;
  }>;
  styles?: Record<string, Record<string, boolean>>;
}

@Component({
  selector: 'app-options-dialog',
  templateUrl: './options-dialog.component.html',
  styleUrls: ['./options-dialog.component.scss']
})
export class OptionsDialogComponent implements OnInit {
  selectedIndex: number;

  constructor(
    public dialogRef: MatDialogRef<OptionsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: OptionsDialogTemplate,
  ) { }

  ngOnInit(): void {
    if(this.data && this.data.styles && this.data.styles['fullScreen']) {
      const element: HTMLElement = document.querySelector('.mat-bottom-sheet-container');

      element.style.maxHeight = 'unset';
    }
  }

  onClick(index: number) {
    this.selectedIndex = index;
    this.data.options[index].callback();
    this.dialogRef.close();
  }

}
