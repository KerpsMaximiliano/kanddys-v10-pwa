import { Component, OnInit } from '@angular/core';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { CustomFieldsComponent } from 'src/app/shared/dialogs/custom-fields/custom-fields.component';
import { MagicLinkDialogComponent } from 'src/app/shared/components/magic-link-dialog/magic-link-dialog.component';
import { CollaborationsComponent } from 'src/app/shared/dialogs/collaborations/collaborations.component';
import { StoreShareComponent } from 'src/app/shared/dialogs/store-share/store-share.component';
import {
  ItemDashboardOptionsComponent,
  DashboardOption,
} from 'src/app/shared/dialogs/item-dashboard-options/item-dashboard-options.component';
import { GeneralFormSubmissionDialogComponent } from 'src/app/shared/dialogs/general-form-submission-dialog/general-form-submission-dialog.component';
import { Questions } from '../../../../shared/components/form-questions/form-questions.component';
import { Tag } from '../../../../core/models/tags';
import { OptionAnswerSelector } from 'src/app/core/types/answer-selector';
import { SetConfigComponent } from 'src/app/shared/dialogs/set-config/set-config.component';
import { StoreShareList } from '../../../../shared/dialogs/store-share/store-share.component';
import { ItemSettingsComponent } from 'src/app/shared/dialogs/item-settings/item-settings.component';
import { ReloadComponent } from 'src/app/shared/dialogs/reload/reload.component';
import { FormStep, FormField } from 'src/app/core/types/multistep-form';
import { FormControl } from '@angular/forms';
import { SingleActionDialogComponent } from 'src/app/shared/dialogs/single-action-dialog/single-action-dialog.component';
import { SettingsComponent } from 'src/app/shared/dialogs/settings/settings.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss'],
})
export class TestComponent implements OnInit {
  textSample: string =
    'Al borrar las reservaciones las fechas involucradas volverán a estar disponible.';
  hourRangeInDays = {
    MONDAY: [
      { from: 9, to: 11 },
      { from: 14, to: 18 },
    ],
    TUESDAY: [
      { from: 9, to: 11 },
      { from: 14, to: 18 },
    ],
    WEDNESDAY: [
      { from: 9, to: 11 },
      { from: 14, to: 18 },
    ],
    THURSDAY: [
      { from: 9, to: 11 },
      { from: 14, to: 18 },
    ],
    FRIDAY: [
      { from: 9, to: 11 },
      { from: 14, to: 18 },
    ],
    SATURDAY: [
      { from: 9, to: 11 },
      { from: 14, to: 15 },
    ],
  };

  formSteps: Array<FormStep> = [
    {
      fieldsList: [
        {
          name: 'referenceImage',
          fieldControl: {
            type: 'single',
            control: new FormControl(['']),
          },
          label: 'Foto de referencia',
          placeholder: 'sube una imagen',
          styles: {
            labelStyles: {
              paddingBottom: '26px',
            },
            subLabelStyles: {
              color: '#7B7B7B',
              fontFamily: 'RobotoRegular',
              fontSize: '16px',
              fontWeight: 500,
              padding: '0px',
              margin: '0px',
              marginBottom: '18px',
            },
            fieldStyles: {
              width: '157px',
              height: '137px',
              padding: '34px',
              textAlign: 'center',
            },
            containerStyles: {
              marginTop: '0px',
              paddingBottom: '60px',
            },
            innerContainerStyles: {
              width: '157px',
              textAlign: 'center',
            },
          },
        },
      ],
      hideHeader: true,
    },
  ];
  amazonCheckoutSessionId: string = null;

  constructor(private dialog: DialogService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((queryParams) => {
      const { amazonCheckoutSessionId } = queryParams;
      this.amazonCheckoutSessionId = amazonCheckoutSessionId;

      if (!this.amazonCheckoutSessionId) {
        setTimeout(() => {
          const amazonPayButton = (window as any).amazon.Pay.renderButton(
            '#AmazonPayButton',
            {
              // set checkout environment
              merchantId: 'A3IR2015SQ6204',
              publicKeyId: 'SANDBOX-AGYUSTTL5TIC6AQTPN5TWYCO',
              ledgerCurrency: 'USD',
              // customize the buyer experience
              checkoutLanguage: 'en_US',
              productType: 'PayAndShip',
              placement: 'Cart',
              buttonColor: 'Gold',
              estimatedOrderAmount: { amount: '109.99', currencyCode: 'USD' },
              // configure Create Checkout Session request
              createCheckoutSessionConfig: {
                payloadJSON: JSON.stringify({
                  webCheckoutDetails: {
                    checkoutReviewReturnUrl:
                      'https://e747-37-19-200-2.ngrok.io/test/test',
                  },
                  storeId:
                    'amzn1.application-oa2-client.bfad20fb1a834bb6b7889d7e18a5c33f',
                  deliverySpecifications: {
                    addressRestrictions: {
                      type: 'Allowed',
                      restrictions: {
                        US: {},
                      },
                    },
                  },
                  scopes: ['name', 'email', 'phoneNumber', 'billingAddress'],
                }), // string generated in step 2
                signature: `ff3AivsSKK8IKSQap1zsm/8tcjwFB1Cj/RQFCZ6NFNQwMR5d7opwrPQNxrOjSJIwvIk/5JakTYA6au+d2A7V/UUqd96z6KXYM1MVPthm7O1Qw7pxgzowuDFPPav55R8YyWmRMCzzNHGW/17qCLRAlr3xVJUzQNYibsQdqnODUAV8kPFLmC5QDIszmKvIJAUaiqfyeJFnPNv09HPnoMs3wCPj5J144WGEo/1XoffQtnUE/J4W/7Iujfe6lTf/Mvv7EqqB0Lx6xU1gI0n/tGj+1gPtUfF1P+YK8iMVT88NwF08VUC6ZWQajTkFHggZ2jkpjHamNWbLrfi2LfA9/eOHVA==`, // signature generated in step 3
              },
            }
          );
        }, 500);
      } else {
        setTimeout(() => {
          (window as any).amazon.Pay.bindChangeAction('#changeButton1', {
            amazonCheckoutSessionId: amazonCheckoutSessionId,
            changeAction: 'changeAddress',
          });

          (window as any).amazon.Pay.bindChangeAction('#changeButton2', {
            amazonCheckoutSessionId: amazonCheckoutSessionId,
            changeAction: 'changePayment',
          });
        }, 500);
      }
    });

    //Si quisiera cambiar la cantidad de productos de la orden
    //amazonPayButton.updateButtonInfo({"amount":"120.99","currencyCode":"USD"});
  }

  openDialog() {
    /*   const list: StoreShareList[] = [
        {
            title: 'ITEM ID',
            label: 'VISIBLE',
            options: [
                {
                    text: 'CREA UN NUEVO ARTICULO',
                    mode: 'func',
                    func() {
                        console.log('Este mueve la maraca');
                        // this.router.navigate([`admin/create-article`]);
                    },
                },
                {
                    text: 'VENDE ONLINE. COMPARTE EL LINK',
                    icon: {
                        src: '/upload.svg',
                        alt: 'icono de de compartir',
                        size:{
                            width: 14,
                            height: 14
                        }
                    },
                    mode: 'clipboard'
                },
                {
                    text: 'CERRAR SESIÓN',
                    mode: 'func',
                    func() {
                        console.log('aqui cierra sesión');
                        //this.authService.signout();
                    }
                }
            ]
        },
    ];

    this.dialog.open(StoreShareComponent, {
        type: 'fullscreen-translucent',
        props: {
          list,
          alternate: false
        },
        customClass: 'app-dialog',
        flags: ['no-header'],
    });*/

    /* this.dialog.open(GeneralFormSubmissionDialogComponent, {
      type: 'centralized-fullscreen',
      props: {
        icon: 'sadFace.svg',
        message: 'Ocurrió un problema',
        showCloseButton: true
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
    
    this.dialog.open(SingleActionDialogComponent, {
      type: 'centralized-fullscreen',
      props:{
         title: 'Borrar Reservaciones?',
         buttonText: 'Borrar Reservación',
         mainText: this.textSample,
         mainButton: this.actionDialog
      },
      customClass: 'app-dialog',
      flags: ['no-header']
    })
    
    */

    this.dialog.open(SettingsComponent, {
      type: 'fullscreen-translucent',
      props: {
        title: 'NameID',
        cancelButton: {
          text: 'cancelar',
          callback: () => {
            console.log('cliqueado el boton de cancelar');
          },
        },
        mainText: this.textSample,
        indexValue: 2,
        qrCode: 'https://www.google.com',
        optionsList: [
          {
            text: 'CTAID',
            callback: () => {
              console.log('CLICKING IT 1');
            },
          },
          {
            text: 'CTAID',
            callback: () => {
              console.log('CLICKING IT 2');
            },
          },
          {
            text: 'CTAID',
            callback: () => {
              console.log('CLICKING IT 3');
            },
          },
          {
            text: 'CTAID',
            callback: () => {
              console.log('CLICKING IT 4');
            },
          },
          {
            text: 'CTAID',
            callback: () => {
              console.log('CLICKING IT 5');
            },
          },
        ],
        statuses: [
          {
            text: 'opcion 1',
            backgroundColor: 'limegreen',
            color: 'blue',
            asyncCallback: () => {
              return new Promise((resolve, reject) => {
                setTimeout(() => {
                  console.log('pasaron 2 seg');
                  resolve(true);
                }, 2000);
              });
            },
          },
          {
            text: 'opcion 2',
            backgroundColor: 'yellow',
            color: 'red',
            asyncCallback: () => {
              return new Promise((resolve, reject) => {
                setTimeout(() => {
                  console.log('pasó 1 seg');
                  resolve(true);
                }, 1000);
              });
            },
          },
          {
            text: 'opcion 3',
            backgroundColor: 'orange',
            color: 'red',
            asyncCallback: () => {
              return new Promise((resolve, reject) => {
                setTimeout(() => {
                  console.log('pasaron 4 segundos');
                  resolve(true);
                }, 4000);
              });
            },
          },
        ],
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  }

  openDeleteDialog() {
    const list: StoreShareList[] = [
      {
        title: `Hay una nueva versión disponible`,
        description:
          'Se ha encontrado una nueva version de la pagina. ¿Desea actualizar?',
        message: 'Recargar Página',
        messageCallback: async () => {
          this.reload();
        },
      },
    ];

    this.dialog.open(StoreShareComponent, {
      type: 'fullscreen-translucent',
      props: {
        list,
        alternate: true,
        buttonText: 'Cerrar',
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
      notCancellable: true,
    });
  }

  reloadDialog() {
    this.dialog.open(ReloadComponent, {
      type: 'fullscreen-translucent',
      props: {
        closeEvent: () => {
          this.reload();
        },
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
      notCancellable: true,
    });
  }

  reload() {
    window.location.reload();
  }

  actionDialog(e: string) {
    console.log('Esta funcion esta aparte');
    console.log(e);
  }
}
