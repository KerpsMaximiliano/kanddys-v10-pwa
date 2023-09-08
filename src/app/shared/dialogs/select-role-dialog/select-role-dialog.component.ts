import {Component, Inject} from '@angular/core';
import {MatDialog, MAT_DIALOG_DATA, MatDialogRef, MatDialogModule} from '@angular/material/dialog';

export interface DialogData {
  animal: string;
  name: string;
}

@Component({
  selector: 'app-select-role-dialog',
  templateUrl: './select-role-dialog.component.html',
  styleUrls: ['./select-role-dialog.component.scss']
})
export class SelectRoleDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<SelectRoleDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
  ) { }

  ngOnInit(): void {
  }

  onClick(): void {
    this.dialogRef.close();
  }

}
