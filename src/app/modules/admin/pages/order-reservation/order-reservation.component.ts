import { Component, OnInit } from '@angular/core';
import { OptionAnswerSelector } from 'src/app/core/types/answer-selector';

@Component({
  selector: 'app-order-reservation',
  templateUrl: './order-reservation.component.html',
  styleUrls: ['./order-reservation.component.scss']
})
export class OrderReservationComponent implements OnInit {

  constructor() { }

  optionIndex: number;
  dummyOptions: OptionAnswerSelector[] = [
   {
      status: true,
      id: 'date1',
      value: 'Date to Date ID',
      valueStyles: {
        fontFamily: 'SfProBold',
        fontSize: '0.875rem',
        color: '#000000',
      },
      subtexts: [
        {
          text: 'Comprador ID',
          styles: {
            fontFamily: 'SfProRegular',
            fontSize: '1.063rem',
          },
        },
        {
         text: 'Factura ID',
          styles: {
            fontFamily: 'SfProRegular',
            fontSize: '1.063rem',
          },
        },
        {
         text: 'RD $ 1,450.00 ',
         styles:{
            fontFamily: 'SfProBold',
            fontSize: '1.063rem',
            color: '#174B72',
            margin: ' 10px 32px'
         }
        }
      ],
    },
    {
      status: true,
      id: 'date1',
      value: 'Date to Date ID',
      valueStyles: {
        fontFamily: 'SfProBold',
        fontSize: '0.875rem',
        color: '#000000',
      },
      subtexts: [
        {
          text: 'Comprador ID',
          styles: {
            fontFamily: 'SfProRegular',
            fontSize: '1.063rem',
          },
        },
        {
         text: 'Factura ID',
          styles: {
            fontFamily: 'SfProRegular',
            fontSize: '1.063rem',
          },
        },
        {
         text: 'RD $ 1,450.00 ',
         styles:{
            fontFamily: 'SfProBold',
            fontSize: '1.063rem',
            color: '#174B72',
            margin: ' 10px 32px'
         }
        }
      ],
    },
    {
      status: true,
      id: 'date1',
      value: 'Date to Date ID',
      valueStyles: {
        fontFamily: 'SfProBold',
        fontSize: '0.875rem',
        color: '#000000',
      },
      subtexts: [
        {
          text: 'Comprador ID',
          styles: {
            fontFamily: 'SfProRegular',
            fontSize: '1.063rem',
          },
        },
        {
         text: 'Factura ID',
          styles: {
            fontFamily: 'SfProRegular',
            fontSize: '1.063rem',
          },
        },
        {
         text: 'RD $ 1,450.00 ',
         styles:{
            fontFamily: 'SfProBold',
            fontSize: '1.063rem',
            color: '#174B72',
            margin: ' 10px 32px'
         }
        }
      ],
    },
    {
      status: true,
      id: 'date1',
      value: 'Date to Date ID',
      valueStyles: {
        fontFamily: 'SfProBold',
        fontSize: '0.875rem',
        color: '#000000',
      },
      subtexts: [
        {
          text: 'Comprador ID',
          styles: {
            fontFamily: 'SfProRegular',
            fontSize: '1.063rem',
          },
        },
        {
         text: 'Factura ID',
          styles: {
            fontFamily: 'SfProRegular',
            fontSize: '1.063rem',
          },
        },
        {
         text: 'RD $ 1,450.00 ',
         styles:{
            fontFamily: 'SfProBold',
            fontSize: '1.063rem',
            color: '#174B72',
            margin: ' 10px 32px'
         }
        }
      ],
    },
    {
      status: true,
      id: 'date1',
      value: 'Date to Date ID',
      valueStyles: {
        fontFamily: 'SfProBold',
        fontSize: '0.875rem',
        color: '#000000',
      },
      subtexts: [
        {
          text: 'Comprador ID',
          styles: {
            fontFamily: 'SfProRegular',
            fontSize: '1.063rem',
          },
        },
        {
         text: 'Factura ID',
          styles: {
            fontFamily: 'SfProRegular',
            fontSize: '1.063rem',
          },
        },
        {
         text: 'RD $ 1,450.00 ',
         styles:{
            fontFamily: 'SfProBold',
            fontSize: '1.063rem',
            color: '#174B72',
            margin: ' 10px 32px'
         }
        }
      ],
    },
  ]; 
  ngOnInit(): void {
  }

  optionClicked(e){
   console.log(e)
  }
}