import { Component, OnInit } from '@angular/core';
import { OptionAnswerSelector } from 'src/app/core/types/answer-selector';
import { Tag } from 'src/app/core/models/tags';

@Component({
  selector: 'app-actions-menu',
  templateUrl: './actions-menu.component.html',
  styleUrls: ['./actions-menu.component.scss']
})
export class ActionsMenuComponent implements OnInit {

   constructor() { }
   template: boolean = true;
   isTag: boolean;
   activeIndex: number;
   tag: Tag = {
      _id: '1',
      createdAt: 'string',
      updatedAt: 'string',
      messageNotify: 'Esto es un mensaje',
      counter: 0,
      name: '#Tag',
      notify: true,
      user: 'Pablito',
      notifyUserOrder: true,
      notifyMerchantOrder: true
    
   };
   options: OptionAnswerSelector[] = [
    {
       status: true,
       id: 'articles',
       click: true,
       value: 'Artilculos',
       valueStyles: {
          'font-family': 'SfProBold',
          'font-size': '13px',
          'color': '#202020'
       },
       subtexts: [
          {
             text: `Ir a mi galeria de mis artículos`,
             styles: {
                fontFamily: 'SfProRegular',
                fontSize: '1rem',
                color: '#7B7B7B',
                'margin-bottom': '12px'
             },
          },
          {
             text: `ID`,
             styles: {
                fontFamily: 'SfProRegular',
                fontSize: '1rem',
                color: '#174B72',
             }
          }
       ]
    },
    {
       status: true,
       id: 'articleID',
       click: true,
       value: 'Ocultar',
       valueStyles: {
          'font-family': 'SfProBold',
          'font-size': '13px',
          'color': '#202020'
       },
       subtexts: [
          {
             text: `Poner invisible este artículo`,
             styles: {
                fontFamily: 'SfProRegular',
                fontSize: '1rem',
                color: '#7B7B7B',
                'margin-bottom': '12px'
             },
          },
          {
             text: `ID`,
             styles: {
                fontFamily: 'SfProRegular',
                fontSize: '1rem',
                color: '#174B72',
             }
          }
       ]
    },
    {
       status: true,
       id: 'group',
       click: true,
       value: 'Este y otro artículos',
       valueStyles: {
          'font-family': 'SfProBold',
          'font-size': '13px',
          'color': '#202020'
       },
       subtexts: [
          {
             text: `Poner invisible los otros artículos excepto este`,
             styles: {
                fontFamily: 'SfProRegular',
                fontSize: '1rem',
                color: '#7B7B7B',
                'margin-bottom': '12px'
             },
          },
          {
             text: `ID`,
             styles: {
                fontFamily: 'SfProRegular',
                fontSize: '1rem',
                color: '#174B72',
             }
          }
       ]
    },
    {
       status: true,
       id: 'home',
       click: true,
       value: 'D` Licianthus',
       valueStyles: {
          'font-family': 'SfProBold',
          'font-size': '13px',
          'color': '#202020'
       },
       subtexts: [
          {
             text: `Ir al Home`,
             styles: {
                fontFamily: 'SfProRegular',
                fontSize: '1rem',
                color: '#7B7B7B',
                'margin-bottom': '12px'
             },
          },
          {
             text: `ID`,
             styles: {
                fontFamily: 'SfProRegular',
                fontSize: '1rem',
                color: '#174B72',
             }
          }
       ]
    },
    {
       status: true,
       id: 'new',
       click: true,
       value: 'Nuevo artículo',
       valueStyles: {
          'font-family': 'SfProBold',
          'font-size': '13px',
          'color': '#202020'
       },
       subtexts: [
          {
             text: `Crear un nuevo articulo de precio dinámico.`,
             styles: {
                fontFamily: 'SfProRegular',
                fontSize: '1rem',
                color: '#7B7B7B',
                'margin-bottom': '12px'
             },
          },
          {
             text: `ID`,
             styles: {
                fontFamily: 'SfProRegular',
                fontSize: '1rem',
                color: '#174B72',
             }
          }
       ]
    },
   ];
 
   ngOnInit(): void {
   }
 
   selectedOption(e){
    console.log(e);
   }

}
