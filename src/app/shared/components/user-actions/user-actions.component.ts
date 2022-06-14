import { Component, OnInit, Input } from '@angular/core';

export interface Content{
    question: string,
    icon?: {
        src: string,
        alt?: string
    },
    line?: boolean,
    callback?: () => void;
}

@Component({
  selector: 'app-user-actions',
  templateUrl: './user-actions.component.html',
  styleUrls: ['./user-actions.component.scss']
})
export class UserActionsComponent implements OnInit {

    @Input() title: string;
    @Input() content: Content[] = [];

  constructor() { }

  ngOnInit(): void {
  }

  inputFunc(callback: () => void){
    callback();
    console.log('Accion del callback');
  }

}
