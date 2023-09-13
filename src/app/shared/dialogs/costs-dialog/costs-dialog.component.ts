import { Component, OnInit, Inject } from '@angular/core';
import {MatDialog, MAT_DIALOG_DATA, MatDialogRef, MatDialogModule} from '@angular/material/dialog';

export interface DialogData {
  callback: () => void
}

@Component({
  selector: 'app-costs-dialog',
  templateUrl: './costs-dialog.component.html',
  styleUrls: ['./costs-dialog.component.scss']
})
export class CostsDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<CostsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) { }

  ngOnInit(): void {
  }
  onClick(): void {
    this.dialogRef.close();
  }
}
