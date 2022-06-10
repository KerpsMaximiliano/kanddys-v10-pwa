import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { SaleFlow } from 'src/app/core/models/saleflow';
import { User } from 'src/app/core/models/user';
import { ExchangeData, PaymentReceiver } from 'src/app/core/models/wallet';
import { AuthService } from 'src/app/core/services/auth.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { WalletService } from 'src/app/core/services/wallet.service';
import { FormStep, FooterOptions } from 'src/app/core/types/multistep-form';
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
  user: User;
  exchangeData: ExchangeData;
  paymentReceivers: PaymentReceiver[];
  saleflow: SaleFlow;

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
          selectionOptions: [],
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
          inputType: 'number',
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
      headerMode: 'v2',
      footerConfig: {
        ...this.footerConfig,
      },
      asyncStepProcessingFunction: {
        type: 'promise',
        function: async (params) => {
          const { 
            accountNumber,
            accountType,
            bankName,
            owner,
            socialID
          } = params.dataModel.value['1'];
          if(
            !accountNumber ||
            !accountType ||
            !bankName ||
            !owner ||
            !socialID
          ) return;
          const exchangeDataResult = await this.walletService.createExchangeData({
            bank: [{
              paymentReceiver: this.paymentReceivers.find((receiver) => receiver.name ===  bankName)._id,
              account: accountNumber, 
              ownerAccount: owner,
              routingNumber: parseInt(socialID),
              typeAccount: accountType,
              isActive: true
            }],
          });
          const saleflowModuleResult = await this.saleflowService.updateSaleFlowModule({
            paymentMethod: {
              paymentModule: exchangeDataResult._id
            }
          }, this.saleflow.module._id);
        },
      },
    }
  ];

  constructor(
    private walletService: WalletService,
    private authService: AuthService,
    private saleflowService: SaleFlowService,
    private merchantsService: MerchantsService,
    private route: ActivatedRoute,
    private location: Location,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(async (params) => {
      this.defaultMerchant = await this.merchantsService.merchantDefault();
      if (!this.defaultMerchant) this.router.navigate(["/"]);
      this.saleflow = (await this.saleflowService.saleflow(params.saleflowId))?.saleflow;
      if(!this.saleflow) throw new Error('No se encontró un saleflow');
      this.user = await this.authService.me();
      if (!this.user) throw new Error('Debes iniciar sesión para continuar');
      const merchantList = await this.merchantsService.myMerchants();
      if(!merchantList.some(
        (merchant) => merchant._id === this.saleflow.merchant._id)
      ) throw new Error('No eres el merchant dueño de este saleflow');
      this.exchangeData = await this.walletService.exchangeDataByUser(this.user._id);
      if(this.exchangeData) throw new Error('Ya tienes exchange data, no puedes crear uno nuevo');
      this.paymentReceivers = await this.walletService.paymentReceivers({});
      this.formSteps[0].fieldsList[0].selectionOptions = this.paymentReceivers.map((receiver) => receiver.name);
    })
    
  }

}
