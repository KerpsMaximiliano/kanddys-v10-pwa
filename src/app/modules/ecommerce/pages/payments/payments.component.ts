import { Component, OnInit } from '@angular/core';
import { OptionAnswerSelector } from 'src/app/core/types/answer-selector';

const dummyPaymentOptions = [
   {
     status: true,
     value: 'Banco Popular.',
     valueStyles: {
       fontFamily: 'SfProRegular',
       fontSize: '1.25rem',
       color: '#7B7B7B',
     },
     subtexts: [
      {
         text: 'A nombre de D’licianthus. CTA #154874-54-52',
         styles: {
            fontFamily: 'SfProRegular',
            fontSize: '17px',
            color: '#7B7B7B'
         }
     }
    ]
   },
   {
     status: true,
     value: 'Banco BHD. ',
     valueStyles: {
       fontFamily: 'SfProRegular',
       fontSize: '1.25rem',
       color: '#7B7B7B',
     },
     subtexts: [
      {
        text: 'A nombre de D’licianthus. CTA #154874-54-52',
        styles: {
          fontFamily: 'SfProRegular',
          fontSize: '17px',
          color: '#7B7B7B'
        },
      }
    ]
   },
   {
     status: true,
     value: 'PayPal. ',
     valueStyles: {
       fontFamily: 'SfProRegular',
       fontSize: '1.25rem',
       color: '#7B7B7B',
     },
     subtexts: [
       {
         text: 'A: d’lcianthus@gmail.com',
         styles: {
           fontFamily: 'SfProRegular',
           fontSize: '17px',
           color: '#7B7B7B'
         },
       }
     ]
   },
   {
     status: true,
     value: 'Otro.',
     valueStyles: {
       fontFamily: 'SfProRegular',
       fontSize: '1.25rem',
       color: '#7B7B7B',
     }
   },
 ];

@Component({
  selector: 'app-payments',
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.scss']
})
export class PaymentsComponent implements OnInit {

   selectedMethod: boolean;
   image: File;
   paymentOptions: OptionAnswerSelector[] = dummyPaymentOptions;
   totalPaid: number = 500;

  constructor() { }

  ngOnInit(): void {
  }


  onFileInput(file: File | { image: File; index: number }) {
   if (!('index' in file)) this.image = file;
 }

  selectAddress(value: any) {
   console.log(value);
   this.selectedMethod = true;
 }
}
