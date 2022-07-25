import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DialogRef } from 'src/app/libs/dialog/types/dialog-ref';

@Component({
  selector: 'app-set-config',
  templateUrl: './set-config.component.html',
  styleUrls: ['./set-config.component.scss']
})
export class SetConfigComponent implements OnInit {

    @Input() title: string;
    @Input() subTitle: string;
    @Input() options: Array<string>;
    @Input() titleStyles: Record<string, any>
    @Input() subTitleStyles: Record<string, any>
    @Input() optionsStyles: Record<string, any>
    @Output() switchEvent = new EventEmitter();

  constructor( private ref: DialogRef ) { }

  ngOnInit(): void {
  }

  switchAction(event){
    this.switchEvent.emit(event);
  }

  close() {
    this.ref.close();
  }
}
