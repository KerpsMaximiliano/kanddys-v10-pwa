import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-user-actions',
  templateUrl: './user-actions.component.html',
  styleUrls: ['./user-actions.component.scss']
})
export class UserActionsComponent implements OnInit {

    @Input() title: string;
    @Input() content: Array<any> = [{
        question: '',
        answer: '',
        icon: {
            src:'',
            alt: ''
        },
        hidden: false,
        line: true,
        }];
  constructor() { }

  ngOnInit(): void {
  }

  showContent(){
    this.content[0].hidden = !this.content[0].hidden;
  }

}
