import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { environment } from 'src/environments/environment';

export interface Questions{
    text: string,
    any?: any
}

@Component({
  selector: 'app-form-questions',
  templateUrl: './form-questions.component.html',
  styleUrls: ['./form-questions.component.scss']
})
export class FormQuestionsComponent implements OnInit {

    @Input() topBar: string = 'BARRA SUPERIOR';
    @Input() topBtn: string = 'ADICIONA UNA PREGUNTA';
    @Input() bottomLeftBtn: string = 'EDIT';
    @Input() bottomRightBtn: string = 'SOMETHING';
    @Input() questions: Questions[];

    @Output() topButton = new EventEmitter();
    @Output() bottomLeft = new EventEmitter();
    @Output() bottomRight = new EventEmitter();
    env: string = environment.assetsUrl;
    constructor() { }
  
    ngOnInit(): void {
    }
  
    buttonAction(type){

        switch(type){
            case 'edit':
                this.topButton.emit();
                console.log('EDIT presionado');
            break;

            case 'something':
                this.bottomLeft.emit();
                console.log('SOMETHING presionado');
            break;

            case 'add':
                this.bottomRight.emit();
                console.log('ADD presionado');
            break;
        };
    }
  
    addQuestion(){
      console.log('B I G');
    }
}
