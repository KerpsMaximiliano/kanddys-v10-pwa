import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DialogRef } from 'src/app/libs/dialog/types/dialog-ref';

interface SetOptions {
    text: Text;
    switched?: boolean;
    callback?: () => void;
}
interface Text{
    text: string;
    styles?: Record<string, any>
}

@Component({
  selector: 'app-set-config',
  templateUrl: './set-config.component.html',
  styleUrls: ['./set-config.component.scss']
})
export class SetConfigComponent implements OnInit {

    @Input() title: Text;
    @Input() subTitle: Text;
    @Input() buttonText: Text;
    @Input() options: Array<SetOptions>;
    @Output() switchEvent = new EventEmitter();

  constructor( private ref: DialogRef ) { }

  ngOnInit(): void {
  }

//   switchAction(event){
//     this.switchEvent.emit(event);
//   }

  close() {
    this.ref.close();
  }
}

    // @Input() titleStyles: Record<string, any>
    // @Input() subTitleStyles: Record<string, any>
    // @Input() optionsStyles: Record<string, any>
