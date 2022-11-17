import { Component, OnInit, Input } from '@angular/core';
import { DialogRef } from 'src/app/libs/dialog/types/dialog-ref';

@Component({
  selector: 'app-media-dialog',
  templateUrl: './media-dialog.component.html',
  styleUrls: ['./media-dialog.component.scss']
})
export class MediaDialogComponent implements OnInit {

   @Input() inputType: 'video' | 'audio';
   @Input() src: string;
   @Input() type: string;
  constructor( public ref: DialogRef) { }

  ngOnInit(): void {
  }

  close(){
   this.ref.close();
  }
}
