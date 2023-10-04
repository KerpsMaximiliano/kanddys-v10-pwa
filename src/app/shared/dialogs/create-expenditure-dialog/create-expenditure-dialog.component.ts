import { Component, OnInit } from '@angular/core';
import {MatDialog, MAT_DIALOG_DATA, MatDialogRef, MatDialogModule} from '@angular/material/dialog'

@Component({
  selector: 'app-create-expenditure-dialog',
  templateUrl: './create-expenditure-dialog.component.html',
  styleUrls: ['./create-expenditure-dialog.component.scss']
})
export class CreateExpenditureDialogComponent implements OnInit {

  name = ''
  amount : any = ''
  changeDate : String = new Date().toDateString()

  constructor(
    public dialogRef: MatDialogRef<CreateExpenditureDialogComponent>,
  ) { }

  
  ngOnInit(): void {
  }
  change_date(type: string, event) {
    this.changeDate = event.value;
    console.log("start: ", this.changeDate)
  }
  onClick(): void {
    this.dialogRef.close();
  }
  getDateFormat(data: any) {
    const date = new Date(data);
    const options = { day: 'numeric' as const, month: 'short' as const, year: 'numeric' as const};
    const dateString = date.toLocaleDateString('en-GB', options);
    return dateString;
  }
  data() {
    return {
      name: this.name,
      amount: Number(this.amount),
      date: this.changeDate
    }
  }
}
