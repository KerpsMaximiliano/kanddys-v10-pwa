import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { FormStep } from 'src/app/core/types/multistep-form';

const labelStyles = {
  fontFamily: "SfProLight",
  marginLeft: '17px',
  marginBottom: '25px',
  color: '#7B7B7B',
  fontSize: '14px',
  fontWeight: 'normal',
}

const fieldStyles = {
  boxShadow: '0px 0px 4px 1px inset rgb(0 0 0 / 20%)',
  borderRadius: '22px'
};

const fieldContainerStyles = {
  marginTop: '55px'
};

@Component({
  selector: 'app-bank-registration',
  templateUrl: './bank-registration.component.html',
  styleUrls: ['./bank-registration.component.scss']
})
export class BankRegistrationComponent implements OnInit {
  scrollableForm: boolean = false;
  formSteps: FormStep[] = [
    {
      fieldsList: [
        {
          name: 'bankName',
          fieldControl: new FormControl('', Validators.required),
          label: 'NOMBRE DEL BANCO',
          placeholder: '',
          styles: {
            labelStyles,
            fieldStyles,
            containerStyles: fieldContainerStyles
          }
        },
        {
          name: 'accountNumber',
          fieldControl: new FormControl('', Validators.required),
          label: 'NÚMERO DE CUENTA',
          inputType: 'number',
          placeholder: '',
          styles: {
            labelStyles,
            fieldStyles,
            containerStyles: fieldContainerStyles
          }
        },
        {
          name: 'owner',
          fieldControl: new FormControl('', Validators.required),
          label: 'TITULAR',
          placeholder: '',
          styles: {
            labelStyles,
            fieldStyles,
            containerStyles: fieldContainerStyles
          }
        },
        {
          name: 'socialID',
          fieldControl: new FormControl('', Validators.required),
          label: 'DOC. DE IDENTIDAD',
          placeholder: '',
          styles: {
            labelStyles,
            fieldStyles,
            containerStyles: fieldContainerStyles
          }
        },
      ],
      optionalLinksTo: [
        {
          styles: {
            containerStyles: {
              marginTop: '21px',
              marginBottom: '70px',
              marginLeft: 'auto'
            },
          },
          links: [
            {
              text: 'Adiciona otra cuenta bancaria  +',
              action: (params) => {
                // console.log("Something happened")
              }
            }
          ]
        },
      ],
      headerText: "INFORMACIÓN NECESARIA",
      pageHeader: {
        text: "¿En cuál Banco Dominicano te harán la transferencia de los pagos?",
        styles: {
          fontFamily: 'Roboto',
          fontWeight: 'bold',
          fontSize: '24px',
          margin: '0px',
          marginTop: '48px',
        }
      },
      stepButtonValidText: "SALVA ESTA CUENTA PARA RECIBIR LOS PAGOS",
      stepButtonInvalidText: "LLENA LOS CAMPOS PARA CONTINUAR",
      avoidGoingToNextStep: true,
    }
  ];

  constructor() { }

  ngOnInit(): void {
  }

}
