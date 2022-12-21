import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DialogRef } from 'src/app/libs/dialog/types/dialog-ref';

@Component({
  selector: 'app-single-action-dialog',
  templateUrl: './single-action-dialog.component.html',
  styleUrls: ['./single-action-dialog.component.scss']
})
export class SingleActionDialogComponent implements OnInit {

   @Input() extraTitle: string;
   @Input() title: string;
   @Input() buttonText: string;
   @Input() mainText: string;
   @Input() topButton: boolean;
   @Input() public mainButton: () => void;
   @Input() btnColor: string = '#FFFFFF';
   @Input() btnBackgroundColor: string = '#2874AD';
   @Input() btnFontFamily: string = 'SfProRegular';
   @Input() btnFontSize: string = '1.063rem';
   @Input() btnMaxWidth: string = '233px';
   @Input() btnWidth: string = '46.72%';
   @Input() btnPadding: string = '7px 5%';

  constructor(
   private ref : DialogRef
  ) { }

  ngOnInit(): void {
  }

  buttonAction(){
   this.mainButton();
   this.ref.close();
  }

  return(){
   this.ref.close();
  }
}
