import { Component, OnInit } from '@angular/core';
import { OptionAnswerSelector } from 'src/app/core/types/answer-selector';

@Component({
  selector: 'app-metrics-info',
  templateUrl: './metrics-info.component.html',
  styleUrls: ['./metrics-info.component.scss']
})
export class MetricsInfoComponent implements OnInit {

  constructor() { }

  activeIndex: number;
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
            text: `Crear un nuevo articulo de precio dinámico`,
            styles: {
               fontFamily: 'SfProRegular',
               fontSize: '1rem',
               color: '#7B7B7B',
               'margin-bottom': '3px'
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
      value: 'ID',
      valueStyles: {
         'font-family': 'SfProBold',
         'font-size': '13px',
         'color': '#202020'
      },
      subtexts: [
         {
            text: `ID`,
            styles: {
               fontFamily: 'SfProRegular',
               fontSize: '1rem',
               color: '#7B7B7B',
               'margin-bottom': '8px'
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
      value: 'ID',
      valueStyles: {
         'font-family': 'SfProBold',
         'font-size': '13px',
         'color': '#202020'
      },
      subtexts: [
         {
            text: `ID`,
            styles: {
               fontFamily: 'SfProRegular',
               fontSize: '1rem',
               color: '#7B7B7B',
               'margin-bottom': '8px'
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
               'margin-bottom': '3px'
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
      value: 'ID',
      valueStyles: {
         'font-family': 'SfProBold',
         'font-size': '13px',
         'color': '#202020'
      },
      subtexts: [
         {
            text: `ID`,
            styles: {
               fontFamily: 'SfProRegular',
               fontSize: '1rem',
               color: '#7B7B7B',
               'margin-bottom': '8px'
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
