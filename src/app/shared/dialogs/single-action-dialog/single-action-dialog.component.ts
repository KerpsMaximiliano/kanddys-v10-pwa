import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DialogRef } from 'src/app/libs/dialog/types/dialog-ref';

@Component({
  selector: 'app-single-action-dialog',
  templateUrl: './single-action-dialog.component.html',
  styleUrls: ['./single-action-dialog.component.scss']
})
export class SingleActionDialogComponent implements OnInit {

   @Input() title: string;
   @Input() buttonText: string;
   @Input() mainText: string;
   @Input() public mainButton: () => void;

  constructor(
   private ref : DialogRef
  ) { }

  ngOnInit(): void {
  }

  buttonAction(){
   this.mainButton();
  }

  return(){
   this.ref.close();
  }
}
