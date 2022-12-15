import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DialogRef } from 'src/app/libs/dialog/types/dialog-ref';
import {
  OptionAnswerSelector,
  WebformAnswerLayoutOption,
  webformAnswerLayoutOptionDefaultStyles,
} from 'src/app/core/types/answer-selector';

export interface Inputs{
   label?: string;
   type: string;
   cols?: number;
   rows?: number;
   placeholder: string;
   inputStyles?: Record <string, string | number>;
}

export interface FooterButton{
   text?: string;
   icon?: string;
   buttonStyles?: Record <string, string | number>;
   callback(...params): any;
}

@Component({
  selector: 'app-item-list-selector',
  templateUrl: './item-list-selector.component.html',
  styleUrls: ['./item-list-selector.component.scss'],
})
export class ItemListSelectorComponent implements OnInit {
  activeIndex: number;
  @Input() title: string = 'Tipo de Tag';
  @Input() subTitle: string = 'Que tipo de grupo necesitas?';
  @Input() cta: {text: string; styles?: Record<string, any>; callback?: () => void | Promise<any>};
  @Input() final: boolean;
  @Input() inputs: Inputs[];
  @Input() footerTitle: string;
  @Input() footer: string = 'El conteo se reinicia cuando el comprador recibe “La Sorpresa” o al vencimiento (30 días).';
  @Input() footerBackground: boolean;
  @Input() footerBackgroundStyles: Record<string, string | number>;
  @Input() footerButton: FooterButton;
  @Input() webformOptions: WebformAnswerLayoutOption[];

  constructor(private ref: DialogRef) {}

  ngOnInit(): void {
    console.log(this.webformOptions)
  }

  selectedOption(e: number) {
    console.log(e);
  }

  close() {
    this.ref.close();
  }
}
 /* [
   {
     type: 'WEBFORM-ANSWER',
     optionStyles: webformAnswerLayoutOptionDefaultStyles,
     selected: false,
     optionIcon:
       'https://upload.wikimedia.org/wikipedia/en/c/c6/The_Legend_of_Zelda_Breath_of_the_Wild.jpg',
     optionIconStyles:{
        width: '43px',
        height: '63px'
     },
     callback: () => null,
     texts: {
       topRight: {
         text: '',
       },
       topLeft: {
         text: 'Fidelidad de los compradores',
         styles: {
           paddingBottom: '8px',
           width: '100%',
           'font-family': 'SfProBold',
           'font-size': '1.063rem',
           color: '#272727',
         },
       },
       middleTexts: [
         {
           text: 'Identifica y premia a compradores recurrentes.',
           styles: {
             fontFamily: 'SfProRegular',
             fontSize: '1rem',
             color: '#4F4F4F',
           },
         },
       ],
       bottomLeft: {
         text: '',
       },
     },
   },
   {
     type: 'WEBFORM-ANSWER',
     optionStyles: webformAnswerLayoutOptionDefaultStyles,
     selected: false,
     optionIcon:
       'https://upload.wikimedia.org/wikipedia/en/c/c6/The_Legend_of_Zelda_Breath_of_the_Wild.jpg',
     optionIconStyles:{
        width: '43px',
        height: '63px'
     },
     callback: () => null,
     texts: {
       topRight: {
         text: '',
       },
       topLeft: {
         text: 'De compradores',
         styles: {
           paddingBottom: '8px',
           width: '100%',
           'font-family': 'SfProBold',
           'font-size': '1.063rem',
           color: '#272727',
         },
       },
       middleTexts: [
         {
           text: 'Los agrupa según tus parámetros.',
           styles: {
             fontFamily: 'SfProRegular',
             fontSize: '1rem',
             color: '#4F4F4F',
           },
         },
       ],
       bottomLeft: {
         text: '',
       },
     },
   },
   {
     type: 'WEBFORM-ANSWER',
     optionStyles: webformAnswerLayoutOptionDefaultStyles,
     selected: false,
     optionIcon:
       'https://upload.wikimedia.org/wikipedia/en/c/c6/The_Legend_of_Zelda_Breath_of_the_Wild.jpg',
     optionIconStyles:{
        width: '43px',
        height: '63px'
     },
     callback: () => null,
     texts: {
       topRight: {
         text: '',
       },
       topLeft: {
         text: 'De Artículos',
         styles: {
           paddingBottom: '8px',
           width: '100%',
           'font-family': 'SfProBold',
           'font-size': '1.063rem',
           color: '#272727',
         },
       },
       middleTexts: [
         {
           text: 'Los agrupa según tus parámetros.',
           styles: {
             fontFamily: 'SfProRegular',
             fontSize: '1rem',
             color: '#4F4F4F',
           },
         },
       ],
       bottomLeft: {
         text: '',
       },
     },
   },
   {
     type: 'WEBFORM-ANSWER',
     optionStyles: webformAnswerLayoutOptionDefaultStyles,
     selected: false,
     optionIcon:
       'https://upload.wikimedia.org/wikipedia/en/c/c6/The_Legend_of_Zelda_Breath_of_the_Wild.jpg',
     optionIconStyles:{
        width: '43px',
        height: '63px'
     },
     callback: () => null,
     texts: {
       topRight: {
         text: '',
       },
       topLeft: {
         text: 'De Facturas',
         styles: {
           paddingBottom: '8px',
           width: '100%',
           'font-family': 'SfProBold',
           'font-size': '1.063rem',
           color: '#272727',
         },
       },
       middleTexts: [
         {
           text: 'Los agrupa según tus parámetros.',
           styles: {
             fontFamily: 'SfProRegular',
             fontSize: '1rem',
             color: '#4F4F4F',
           },
         },
       ],
       bottomLeft: {
         text: '',
       },
     },
   },
   {
     type: 'WEBFORM-ANSWER',
     optionStyles: webformAnswerLayoutOptionDefaultStyles,
     selected: false,
     optionIcon:
       'https://upload.wikimedia.org/wikipedia/en/c/c6/The_Legend_of_Zelda_Breath_of_the_Wild.jpg',
     optionIconStyles:{
        width: '43px',
        height: '63px'
     },
     callback: () => null,
     texts: {
       topRight: {
         text: '',
       },
       topLeft: {
         text: 'Mensajes Automáticos',
         styles: {
           paddingBottom: '8px',
           width: '100%',
           'font-family': 'SfProBold',
           'font-size': '1.063rem',
           color: '#272727',
         },
       },
       middleTexts: [
         {
           text: 'Plantilla de mensajes pre-determinados.',
           styles: {
             fontFamily: 'SfProRegular',
             fontSize: '1rem',
             color: '#4F4F4F',
           },
         },
       ],
       bottomLeft: {
         text: '',
       },
     },
   },
 ]; */