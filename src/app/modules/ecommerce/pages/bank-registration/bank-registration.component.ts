import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { FormStep, FooterOptions } from 'src/app/core/types/multistep-form';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { Merchant } from 'src/app/core/models/merchant';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

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
  defaultMerchant: Merchant = null;

  footerConfig: FooterOptions = {
    bubbleConfig: {
      validStep: {
        mode: 'single',
        function: async (params) => {
        }
      },
      invalidStep: {
        mode: 'single'
      }
    },
    bgColor: '#2874AD',
    enabledStyles: {
      height: '49px',
      fontSize: '17px',
    },
    disabledStyles: {
      height: '30px',
      fontSize: '17px',
    },
  }

  formSteps: FormStep[] = [
    {
      fieldsList: [
        {
          name: 'bankName',
          fieldControl: new FormControl('', Validators.required),
          label: 'NOMBRE DEL BANCO',
          inputType: 'select',
          selectionOptions: ["banco 1", "banco 2"],
          placeholder: '',
          styles: {
            labelStyles: {
              ...labelStyles,
              marginTop: '33px'
            },
            fieldStyles,
            topLabelActionStyles: {
              fontFamily: 'Roboto',
              fontWeight: 'bold',
              fontSize: '24px',
              margin: '0px',
              marginTop: '37px',
              marginBottom: '47px',
            },
            containerStyles: fieldContainerStyles
          },
          topLabelAction: {
            text: '¿En cuál Banco Dominicano te harán la transferencia de los pagos?',
            clickable: true,
          },
        },
        {
          name: 'accountType',
          fieldControl: new FormControl('', Validators.required),
          label: 'TIPO DE CUENTA',
          inputType: 'select',
          selectionOptions: ["corriente", "ahorro"],
          placeholder: '',
          styles: {
            labelStyles: {
              ...labelStyles,
              marginTop: '33px'
            },
            fieldStyles,
            topLabelActionStyles: {
              fontFamily: 'Roboto',
              fontWeight: 'bold',
              fontSize: '24px',
              margin: '0px',
              marginTop: '37px',
              marginBottom: '47px',
            },
            containerStyles: fieldContainerStyles
          },
          topLabelAction: {
            text: '¿En cuál Banco Dominicano te harán la transferencia de los pagos?',
            clickable: true,
          },
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
      headerText: "",
      pageHeader: {
        text: "Ingresaré los datos bancarios después",
        styles: {
          color: '#27A2FF',
          fontFamily: 'Roboto',
          fontSize: '17px',
          cursor: 'pointer',
          marginTop: '31px'
        },
        callback: async (params) => {
          this.router.navigate([`/ecommerce/merchant-dashboard/${this.defaultMerchant._id}/my-store`]);
        },
      },
      stepButtonValidText: "SALVA ESTA CUENTA PARA RECIBIR LOS PAGOS",
      stepButtonInvalidText: "LLENA LOS CAMPOS PARA CONTINUAR",
      avoidGoingToNextStep: true,
      customScrollToStepBackwards: (params) => {
        this.location.back();
      },
      justExecuteCustomScrollToStep: true,
      headerMode: 'v2',
      footerConfig: {
        ...this.footerConfig,
      }
    }
  ];

  constructor(
    private location: Location,
    private router: Router,
    private merchantService: MerchantsService,
  ) { }

  async ngOnInit() {
    const defaultMerchant = await this.merchantService.merchantDefault();

    if (!defaultMerchant) this.router.navigate(["/"]);
    else {
      this.defaultMerchant = defaultMerchant;
    }
  }

}
