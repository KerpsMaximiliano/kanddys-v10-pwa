import { Component, OnInit } from '@angular/core';
import { OptionAnswerSelector } from 'src/app/core/types/answer-selector';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import {
  StoreShareComponent,
  StoreShareList,
} from 'src/app/shared/dialogs/store-share/store-share.component';

@Component({
  selector: 'app-order-reservation',
  templateUrl: './order-reservation.component.html',
  styleUrls: ['./order-reservation.component.scss'],
})
export class OrderReservationComponent implements OnInit {
  constructor(private dialogService: DialogService) {}

  mode: 'default' | 'edit' | 'delete';
  optionIndex: number;
  optionIndexArray: number[] = [];
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
          styles: {
            fontFamily: 'SfProBold',
            fontSize: '1.063rem',
            color: '#174B72',
            margin: ' 10px 32px',
          },
        },
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
          styles: {
            fontFamily: 'SfProBold',
            fontSize: '1.063rem',
            color: '#174B72',
            margin: ' 10px 32px',
          },
        },
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
          styles: {
            fontFamily: 'SfProBold',
            fontSize: '1.063rem',
            color: '#174B72',
            margin: ' 10px 32px',
          },
        },
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
          styles: {
            fontFamily: 'SfProBold',
            fontSize: '1.063rem',
            color: '#174B72',
            margin: ' 10px 32px',
          },
        },
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
          styles: {
            fontFamily: 'SfProBold',
            fontSize: '1.063rem',
            color: '#174B72',
            margin: ' 10px 32px',
          },
        },
      ],
    },
  ];
  ngOnInit(): void {}

  optionClicked(e) {
    console.log(e);
  }

  openDialog() {
    const list: StoreShareList[] = [
      {
        title: 'RESERVACIONES',
        options: [
          {
            text: 'Crear reservación a un cliente'.toUpperCase(),
            mode: 'func',
            func: () => {
              console.log('N/A');
            },
          },
          {
            text: 'EDITAR',
            mode: 'func',
            func: () => {
              this.mode === 'edit';
              console.log(this.mode)
            },
          },
          {
            text: 'BORRAR',
            mode: 'func',
            func: () => {
              this.mode == 'delete';
              console.log(this.mode)
            },
          },
          {
            text: 'BLOQUEA SLOTS',
            mode: 'func',
            func: () => {
              console.log('N/A');
            },
          },
          {
            text: 'COMPARTE EL LINK DE SLOTS ',
            mode: 'func',
            func: () => {
              console.log('N/A');
            },
          },
        ],
      },
    ];

    this.dialogService.open(StoreShareComponent, {
      type: 'fullscreen-translucent',
      props: {
        list,
        hideCancelButtton: true,
        alternate: true,
        dynamicStyles: {
          titleWrapper: {
            display: 'flex',
            alignItems: 'flex-start',
            paddingBottom: '26px',
          },
        },
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  }
}
