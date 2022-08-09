import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DialogRef } from 'src/app/libs/dialog/types/dialog-ref';

interface Text{
    text: string;
    textStyles?: Record<string, any>
    callback?: () => void;
}

@Component({
  selector: 'app-item-settings',
  templateUrl: './item-settings.component.html',
  styleUrls: ['./item-settings.component.scss']
})
export class ItemSettingsComponent implements OnInit {

    @Input() header: Text;
    @Input() content: Text[];
    @Input() bgColor: string;
    @Input() headerStyles: Record<string, any>

  constructor( public ref: DialogRef) { }

  ngOnInit(): void {
  }

  close(){
    this.ref.close();
  }

}
