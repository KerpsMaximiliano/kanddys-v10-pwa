import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { environment } from 'src/environments/environment';

export interface Questions{
    enum?: boolean;
    text: string,
    any?: any
}

export interface Dropdown {
    title: string,
    content: DropdownContent[]
}

export interface DropdownContent {
    text: string,
    icon?: string
}

@Component({
  selector: 'app-form-questions',
  templateUrl: './form-questions.component.html',
  styleUrls: ['./form-questions.component.scss']
})
export class FormQuestionsComponent implements OnInit {

    @Input() topBar: string;
    @Input() topBtn: string;
    @Input() bottomLeftBtn: string;
    @Input() bottomRightBtn: string;
    @Input() secondBottomRightBtn: string;
    @Input() questions: Questions[];
    @Input() dropdowns?: Dropdown[];

    currentIndex: number = 0;
    dropdownActive: boolean;

    @Output() topButton = new EventEmitter();
    @Output() bottomLeft = new EventEmitter();
    @Output() bottomRight = new EventEmitter();
    @Output() secondBottomRight = new EventEmitter();
    env: string = environment.assetsUrl;
    constructor() { }
  
    ngOnInit(): void {
    }
  
    buttonAction(type: 'top' | 'left' | 'right' | 'right-second'){
        switch(type){
            case 'top': this.topButton.emit(); break;
            case 'left': this.bottomLeft.emit(); break;
            case 'right': this.bottomRight.emit(); break;
            case 'right-second': this.secondBottomRight.emit(); break;
        };
    }
  
    addQuestion(){
      console.log('B I G');
    }

    setCurrentDropdown(index: number) {
        if (this.currentIndex == index) this.dropdownActive = !this.dropdownActive;
        else {
            this.currentIndex = index;
            this.dropdownActive = true;
        }
    }

}
