import { Component, OnInit } from '@angular/core';
import { OptionAnswerSelector } from 'src/app/core/types/answer-selector';

@Component({
  selector: 'app-webform-answer-method',
  templateUrl: './webform-answer-method.component.html',
  styleUrls: ['./webform-answer-method.component.scss']
})
export class WebformAnswerMethodComponent implements OnInit {

   optionIndex: number;
   valueStyle: {
     'font-size': '1.063rem',
     'font-family': 'SfProRegular'
   };
   options: OptionAnswerSelector[] = [
      {
         value: 'Visitante seleccionará entre opciones',
         status: true,
         click: false
      },
      {
         value: 'Visitante selecionará una fecha',
         status: true,
         click: false
      },
      {
         value: 'Visitante adicionará la respuesta',
         status: true,
         click: false
      },
   ]
  constructor() { }

  ngOnInit(): void {
  }

}
