import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { WebformAnswerLayoutOption } from 'src/app/core/types/answer-selector';
import { DialogRef } from 'src/app/libs/dialog/types/dialog-ref';

export interface Inputs {
  label?: string;
  type: string;
  innerLabel?: string;
  name: string;
  cols?: number;
  rows?: number;
  placeholder: string;
  inputStyles?: Record<string, string | number>;
}

export interface FooterButton {
  text?: string;
  icon?: string;
  buttonStyles?: Record<string, string | number>;
  callback(...params): any;
}

@Component({
  selector: 'app-item-list-selector',
  templateUrl: './item-list-selector.component.html',
  styleUrls: ['./item-list-selector.component.scss'],
})
export class ItemListSelectorComponent implements OnInit {
  activeIndex: number;
  @Input() containerStyles: Record<string, any>;
  @Input() title: string;
  @Input() subTitle: string;
  @Input() cta: {
    text: string;
    styles?: Record<string, any>;
    callback?: () => void | Promise<any>;
  };
  @Input() final: boolean;
  @Input() inputs: Inputs[];
  @Input() footerTitle: string;
  @Input() footer: string;
  @Input() footerBackground: boolean;
  @Input() footerBackgroundStyles: Record<string, string | number>;
  @Input() footerButton: FooterButton;
  @Input() webformOptions: WebformAnswerLayoutOption[];
  @Output() formOutput = new EventEmitter();
  form: FormGroup;

  constructor() {} // private ref: DialogRef

  ngOnInit(): void {
    if (this.inputs?.length) {
      this.form = new FormGroup({});
      this.inputs.forEach((input) => {
        this.form.addControl(input.name, new FormControl());
      });
    }
  }

  onCurrencyInput(name: string, value: number) {
    this.form.get(name).patchValue(value);
  }

  onFormInput(type: string, ...values: any) {
    if (type === 'currency') this.onCurrencyInput(values[0], values[1]);
    this.formOutput.emit(this.form.value);
  }

  selectedOption(e: number) {
    // this.ref.close();
  }

  close() {
    // this.ref.close(this.form?.value);
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
