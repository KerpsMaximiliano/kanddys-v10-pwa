import { Component, OnInit } from '@angular/core';
import { FormStep } from 'src/app/core/types/multistep-form';
import { HeaderInfoComponent } from 'src/app/shared/components/header-info/header-info.component';
import { FormControl, Validators } from '@angular/forms';
import { ReservationOrderlessComponent } from '../reservations-orderless/reservations-orderless.component';
import { DecimalPipe } from '@angular/common';
import { base64ToFile } from 'src/app/core/helpers/files.helpers';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { ActivatedRoute } from '@angular/router'
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { GeneralFormSubmissionDialogComponent } from 'src/app/shared/dialogs/general-form-submission-dialog/general-form-submission-dialog.component';

const commonContainerStyles = {
  margin: '41px 39px auto 39px'
}

const footerConfig = {
  bgColor: '#2874AD'
};

@Component({
  selector: 'app-ll-studio-order-form',
  templateUrl: './ll-studio-order-form.component.html',
  styleUrls: ['./ll-studio-order-form.component.scss']
})
export class LlStudioOrderFormComponent implements OnInit {
  scrollableForm = true;
  reservation: {
    data: Record<string, any>,
    message: string;
  } = null;
  merchantId: string = null;
  databaseName: string = null;
  choosedReservation: boolean = false;
  fullFormMessage: string = null;
  formMessageInitialHistory: Record<string, any> = {};
  whatsappLink: string = 'https://wa.me/18098718288?text=';

  formSteps: FormStep[] = [
    {
      fieldsList: [
        {
          name: 'details',
          label: 'Sobre tu orden *',
          sublabel: 'Especifica todos los detalles. En base a esta información se trabajará tu pedido.',
          inputType: 'textarea',
          fieldControl: {
            type: 'single',
            control: new FormControl('', Validators.required)
          },
          placeholder: 'Cuál es el artículo? Color? Material? Personalización, aclaraciones y demás datos relevantes a tu orden.',
          styles: {
            containerStyles: {
              ...commonContainerStyles,
              marginTop: '0px',
              paddingTop: '60px'
            },
            fieldStyles: {
              borderRadius: '10px',
              padding: '23px 26px 23px 16px',
              background: 'white',
              height: '120px'
            },
            subLabelStyles: {
              color: '#7B7B7B',
              fontSize: '1rem',
              margin: '19px 0px',
              fontFamily: 'Roboto',
              fontWeight: 500
            },
          }
        },
        {
          name: 'referenceImage',
          fieldControl: {
            type: 'single',
            control: new FormControl('', Validators.required)
          },
          label: 'Foto de Referencia',
          sublabel: 'Adjuntar foto de referencia de su orden.',
          inputType: 'file',
          placeholder: 'sube una imagen',
          styles: {
            containerStyles: {
              ...commonContainerStyles,
              minWidth: '281px',
              paddingTop: '64px',
              paddingBottom: '270px'
            },
            labelStyles: {
              fontFamily: 'Roboto',
              fontWeight: 'lighter',
              fontSize: '19px'
            },
            subLabelStyles: {
              color: '#7B7B7B',
              fontFamily: 'Roboto',
              fontSize: '16px',
              fontWeight: 500
            },
            fieldStyles: {
              minWidth: '192px',
              maxHeight: '163px',
              width: 'calc((100% - 35px * 2) - 55.14%)',
              borderRadius: '7px'
            }
          },
        },
      ],
      embeddedComponents: [
        {
          component: HeaderInfoComponent,
          beforeIndex: 0,
          inputs: {
            title: 'LL Studio',
            description: 'Formulario de Ordenes',
            profileImage: 'https://storage-rewardcharly.sfo2.digitaloceanspaces.com/new-assets/LL_Studio_logo_version_principal-fondo_transparente_180x.webp',
            socials: [
              {
                name: 'instagram',
                url: 'https://instagram.com/llstudiord?igshid=YmMyMTA2M2Y='
              },
              {
                name: 'phone',
                url: '18098718288'
              }
            ],
            reverseInfoOrder: true,
            customStyles: {
              wrapper: {
                margin: '0px',
                backgroundColor: 'white',
                background: 'linear-gradient(180deg, white 50%, rgba(213, 213, 213, 0.25) 100%)',
                padding: '0px 20px',
                paddingTop: '24px',
                paddingBottom: '35.8px',
              },
              leftInnerWrapper: {
                margin: '0px'
              },
              pictureWrapper: {
                alignSelf: 'center'
              },
              infoWrapper: {
                justifyContent: 'center',
                marginLeft: '21px'
              }
            }
          },
          outputs: [],
        }
      ],
      hideHeader: true,
      styles: {
        padding: '0px',
      },
      stepProcessingFunction: () => {
        this.fullFormMessage = `*Sobre tu orden:*\n${this.formSteps[0].fieldsList[0].fieldControl.control.value}\n\n`;

        return { ok: true }
      },
      footerConfig,
      stepButtonInvalidText: 'ADICIONA LA INFO DE TU ORDEN',
      stepButtonValidText: 'CONTINUA CON TU ORDEN'
    },
    {
      headerText: '',
      fieldsList: [
        {
          name: 'phoneNumber',
          fieldControl: {
            type: 'single',
            control: new FormControl('', Validators.required)
          },
          label: '¿Donde recibirás las notificaciones de esta orden??',
          inputType: 'phone',
          styles: {
            containerStyles: {
              marginTop: '44px',
            },
            labelStyles: {
              fontFamily: 'Roboto',
              fontWeight: 'bold',
              fontSize: '24px',
              margin: '0px',
              marginBottom: '25px',
            },
            bottomLabelStyles: {
              fontWeight: 'normal',
              fontStyle: 'italic',
              fontSize: '15px',
              marginTop: '22px',
              fontFamily: 'Roboto'
            }
          },
          bottomLabel: {
            text: 'Otras maneras de recibir las notificaciones >',
            clickable: true,
            callback: () => {
              console.log('Se ha clickeado el callback');
            },
          },
        },
      ],
      stepProcessingFunction: () => {
        return { ok: true }
      },
      footerConfig,
      stepButtonInvalidText: 'ESCRIBE QUIÉN ERES Y COMO TE CONTACTAMOS',
      stepButtonValidText: 'CONFIRMA TU PAGO'
    },
    {
      headerText: '',
      fieldsList: [
        {
          name: 'fullname',
          fieldControl: {
            type: 'single',
            control: new FormControl('', Validators.required)
          },
          label: 'Al nombre de quién estás creando esta orden?',
          placeholder: 'Mi nombre y apellido es..',
          styles: {
            containerStyles: {
              marginTop: '44px',
            },
            labelStyles: {
              fontFamily: 'Roboto',
              fontWeight: 'bold',
              fontSize: '24px',
              margin: '0px',
              marginBottom: '24px',
            }
          },
        }
      ],
      stepProcessingFunction: () => {
        this.fullFormMessage += `*¿A nombre de quién estás realizando esta orden?:*\n${this.formSteps[2].fieldsList[0].fieldControl.control.value}\n\n`;

        return { ok: true }
      },
      footerConfig,
      stepButtonInvalidText: 'ESCRIBE QUIÉN ERES Y COMO TE CONTACTAMOS',
      stepButtonValidText: 'CONFIRMA TU PAGO'
    },
    {
      headerText: '',
      fieldsList: [
        {
          name: 'totalAmount',
          customCursorIndex: this.decimalPipe.transform(
            Number(0),
            '1.2'
          ).length + 1,
          formattedValue: '$' + this.decimalPipe.transform(
            Number(0),
            '1.2'
          ),
          fieldControl: {
            type: 'single',
            control: new FormControl(0, [
              Validators.required,
              Validators.min(0),
            ])
          },
          shouldFormatNumber: true,
          label: 'Monto total de Compra:',
          sublabel: 'Si no estas segur(x) puedes dejarlo en blanco.',
          inputType: 'number',
          placeholder: 'La compra es de $..',
          changeCallbackFunction: (change, params) => {
            try {
              if (!change.includes('.')) {
                const plainNumber = change
                  .split(',')
                  .join('');

                if (plainNumber[0] === '0') {
                  const formatted = plainNumber.length > 3 ? this.decimalPipe.transform(
                    Number(plainNumber.slice(0, -2) + '.' + plainNumber.slice(-2)),
                    '1.2'
                  ) : this.decimalPipe.transform(
                    Number('0.' + (
                      plainNumber.length <= 2 ? '0' + plainNumber.slice(1) :
                        plainNumber.slice(1)
                    )),
                    '1.2'
                  );

                  if (formatted === '0.00') {
                    this.formSteps[3].fieldsList[0].placeholder = '';
                  }

                  this.formSteps[3].fieldsList[0].formattedValue = '$' + formatted;
                } else {
                  const formatted = plainNumber.length > 2 ? this.decimalPipe.transform(
                    Number(plainNumber.slice(0, -2) + '.' + plainNumber.slice(-2)),
                    '1.2'
                  ) : this.decimalPipe.transform(
                    Number('0.' + (
                      plainNumber.length === 1 ? '0' + plainNumber :
                        plainNumber
                    )),
                    '1.2'
                  );

                  if (formatted === '0.00') {
                    this.formSteps[3].fieldsList[0].placeholder = '';
                  }

                  this.formSteps[3].fieldsList[0].formattedValue = '$' + formatted;
                }
              } else {
                const convertedNumber = Number(change.split('').filter(char => char !== '.').join(''));
                this.formSteps[3].fieldsList[0].fieldControl.control.setValue(convertedNumber, {
                  emitEvent: false,
                });
              }
            } catch (error) {
              console.log(error);
            }
          },
          styles: {
            labelStyles: {
              fontFamily: 'Roboto',
              fontWeight: 'bold',
              fontSize: '24px',
              margin: '0px',
              marginBottom: '21px',
            },
            subLabelStyles: {
              color: '#7B7B7B',
              fontSize: '1rem',
              margin: '0px',
              marginBottom: '36px',
              fontFamily: 'Roboto',
              fontWeight: 500
            },
            containerStyles: {
              marginTop: '44px',
              position: 'relative'
            },
            fieldStyles: {
              backgroundColor: 'transparent',
              color: 'transparent',
              zIndex: '50',
              position: 'absolute',
              bottom: '0px',
              left: '0px',
              boxShadow: 'none',
            },
            formattedInputStyles: {
              bottom: '0px',
              left: '0px',
              zIndex: '1',
            },
          },
        },
        {
          name: 'paymentMethod',
          fieldControl: {
            type: 'single',
            control: new FormControl('', Validators.required)
          },
          selectionOptions: ['Banco Popular', 'Banreservas', 'Banco BHD', 'Yoyo App', 'PayPal', 'Otro'],
          changeCallbackFunction: (change, params) => {
            this.formSteps[3].fieldsList[1].fieldControl.control.setValue(change, {
              emitEvent: false,
            });
          },
          label: 'Via de pago',
          inputType: 'radio',
          styles: {
            containerStyles: {
              marginTop: '48px',
            },
            labelStyles: {
              marginBottom: '21px',
              fontSize: '19px',
              fontFamily: 'Roboto',
              fontWeight: 500
            },
            fieldStyles: {
              paddingLeft: '0px'
            }
          },
        },
        {
          name: 'proofOfPayment',
          fieldControl: {
            type: 'single',
            control: new FormControl('', Validators.required)
          },
          label: 'Comprobante de Pago',
          sublabel: 'Anexar el comprobante de su pago',
          inputType: 'file',
          placeholder: 'sube una imagen',
          styles: {
            containerStyles: {
              minWidth: '281px',
              marginTop: '44px',
              marginBottom: '269px',
            },
            labelStyles: {
              fontFamily: 'Roboto',
              fontWeight: 'lighter',
              fontSize: '19px'
            },
            subLabelStyles: {
              color: '#7B7B7B',
              fontFamily: 'Roboto',
              fontSize: '16px',
              fontWeight: 500
            },
            fieldStyles: {
              minWidth: '192px',
              maxHeight: '163px',
              width: 'calc((100% - 35px * 2) - 55.14%)',
              borderRadius: '7px'
            }
          },
        },
      ],
      stepProcessingFunction: () => {
        this.fullFormMessage += `*Monto total de Compra:*\n${this.formSteps[3].fieldsList[0].fieldControl.control.value}\n\n`;
        this.fullFormMessage += `*Vía de pago:*\n${this.formSteps[3].fieldsList[1].fieldControl.control.value}\n\n`;

        return { ok: true }
      },
      footerConfig,
      stepButtonInvalidText: 'ESCRIBE DATOS DEL PAGO',
      stepButtonValidText: 'CONTINUA CON TU ORDEN'
    },
    {
      headerText: '',
      fieldsList: [
        {
          name: 'fromWhereAreYouPaying',
          fieldControl: {
            type: 'single',
            control: new FormControl('', Validators.required)
          },
          selectionOptions: ['Instagram @llstudiord', 'WhatsApp 809-871-8288', 'WhatsApp 809-508-3344', 'Correo Electrónico'],
          changeCallbackFunction: (change, params) => {
            this.formSteps[4].fieldsList[0].fieldControl.control.setValue(change, {
              emitEvent: false,
            });
          },
          label: 'Via por la que está colocando esta orden (*)',
          sublabel: 'Favor seleccionar la via por la que estamos conversando para futuras referencias',
          inputType: 'radio',
          styles: {
            containerStyles: {
              marginTop: '44px',
            },
            fieldStyles: {
              paddingLeft: '0px'
            },
            labelStyles: {
              marginBottom: '21px',
              fontSize: '24px',
              fontFamily: 'Roboto',
              fontWeight: 'bold'
            },
            subLabelStyles: {
              color: '#7B7B7B',
              fontSize: '1rem',
              margin: '0px',
              marginTop: '20px',
              marginBottom: '34px',
              fontFamily: 'Roboto',
              fontWeight: 500
            },
          },
        }
      ],
      stepProcessingFunction: () => {
        this.fullFormMessage += `*Via por la que está colocando esta orden:*\n${this.formSteps[4].fieldsList[0].fieldControl.control.value}\n\n`;

        return { ok: true }
      },
      footerConfig,
      stepButtonInvalidText: 'SELECCIONA UNA OPCIÓN',
      stepButtonValidText: 'ENVIANOS TU ORDEN POR WHATSAPP'
    },
    {
      headerText: '',
      fieldsList: [
        {
          name: 'dateConfirmation',
          fieldControl: {
            type: 'single',
            control: new FormControl('', Validators.required)
          },
          selectionOptions: ['Si', 'No'],
          changeCallbackFunction: (change, params) => {
            this.formSteps[5].fieldsList[0].fieldControl.control.setValue(change, {
              emitEvent: false,
            });

            if (change === 'Si') {
              params.scrollToStep(6);
              this.choosedReservation = true;
            } else {
              this.formSteps[6].fieldsList[0].fieldControl.control.setValue('');
              this.reservation = null;
              this.choosedReservation = false;
              params.scrollToStep(7);
            }
          },
          label: 'Hemos acordado y confirmado una fecha y hora de entrega? (*)',
          sublabel: `
          Si la fecha de entrega de tu orden no ha sido previamente acordada y confirmada por LL Studio, favor dejar este campo en blanco. Si marcas una fecha que no ha sido anteriormente validada por LL Studio, esta información no será válida.
          El plazo de entrega es de 4 a 8 dias laborables. Si no hemos acordado una fecha favor marcar NO.
          `,
          inputType: 'radio',
          styles: {
            containerStyles: {
              marginTop: '44px',
            },
            fieldStyles: {
              paddingLeft: '0px'
            },
            labelStyles: {
              fontSize: '24px',
              fontFamily: 'Roboto',
              fontWeight: 'bold'
            },
            subLabelStyles: {
              color: '#7B7B7B',
              fontSize: '1rem',
              margin: '0px',
              marginTop: '30px',
              marginBottom: '25px',
              fontFamily: 'Roboto',
              fontWeight: 500
            },
          },
        },
      ],
      stepProcessingFunction: () => {
        return { ok: true }
      },
      footerConfig,
      stepButtonInvalidText: 'SELECCIONA UNA OPCIÓN',
      stepButtonValidText: 'CONTINUA CON TU ORDEN'
    },
    {
      fieldsList: [
        {
          fieldControl: {
            type: 'single',
            control: new FormControl('', Validators.required)
          },
          name: 'reservation',
          label: '',
          styles: {
            containerStyles: {
              display: 'none'
            }
          }
        }
      ],
      embeddedComponents: [
        {
          afterIndex: 0,
          component: ReservationOrderlessComponent,
          inputs:
          {
            calendarId: "62ac227945c3506dfb3c87cc"
          },
          outputs: [
            {
              name: 'onReservation',
              callback: (reservationOutput) => {
                console.log(reservationOutput);
                this.reservation = reservationOutput;
                this.formSteps[6].fieldsList[0].fieldControl.control.setValue(reservationOutput.message);
              },
            }
          ]
        }
      ],
      stepProcessingFunction: () => {
        if (this.reservation) {
          this.fullFormMessage += `*Fecha de entrega:*\n${this.formSteps[6].fieldsList[0].fieldControl.control.value}\n\n`;

          return { ok: true };
        }

        return { ok: false };
      },
      footerConfig,
      stepButtonInvalidText: 'ADICIONA LA FECHA ACORDADA',
      stepButtonValidText: 'CONTINUA CON TU ORDEN'
    },
    {
      headerText: '',
      fieldsList: [
        {
          name: 'about-delivery',
          label: 'Sobre la entrega (*)',
          sublabel: 'Si no has realizado el pago de tu delivery o envío, favor cominicarte con nosotros para hacerlo',
          fieldControl: {
            type: 'single',
            control: new FormControl('', Validators.required)
          },
          selectionOptions: [
            'Pick Up en Tienda (Por Citas)',
            'Delivery Zona Metropolitana (A partir de $200 DOP)',
            'Envío al interior (A partir de $300 DOP)',
            'Envio Internacional (Cotizar)'
          ],
          inputType: 'radio',
          changeCallbackFunction: (change, params) => {
            // this.formSteps[1].fieldsList[6].fieldControl.setValue(change, {
            //   emitEvent: false,
            // });

            // if (change === 'Si') {
            //   params.scrollToStep(2);
            // }
          },
          styles: {
            containerStyles: {
              marginTop: '44px',
            },
            labelStyles: {
              fontSize: '24px',
              fontFamily: 'Roboto',
              fontWeight: 'bold',
              margin: '0px',
            },
            subLabelStyles: {
              color: '#7B7B7B',
              fontSize: '1rem',
              margin: '0px',
              marginTop: '16px',
              marginBottom: '27px',
              fontFamily: 'Roboto',
              fontWeight: 500
            },
          }
        }
      ],
      customScrollToStepBackwards: (params) => {
        if (!this.choosedReservation)
          params.scrollToStep(5, false);
        else
          params.scrollToStep(6, false);
      },
      stepProcessingFunction: () => {
        this.fullFormMessage += `*Sobre la entrega:*\n${this.formSteps[7].fieldsList[0].fieldControl.control.value}\n\n`;

        return { ok: true }
      },
      footerConfig,
      stepButtonInvalidText: 'TOCA PARA RESPONDER',
      stepButtonValidText: 'CONTINUA CON TU ORDEN'
    },
    {
      fieldsList: [
        {
          name: 'whereToDeliver',
          label: '¿Dónde entregaremos?',
          sublabel: 'Indicar sólamente si aplica. El delivery en Santo Domingo sólo aplica a la zona metropolitana y varia de RD$200 a RD$350 aproximadamente. El envio al interior se hace via courrier, a partir de RD$300.',
          inputType: 'textarea',
          fieldControl: {
            type: 'single',
            control: new FormControl('', Validators.required)
          },
          placeholder: 'Escriba la Calle, número, (nombre del edificio).',
          styles: {
            containerStyles: {
              marginTop: '40px'
            },
            fieldStyles: {
              borderRadius: '10px',
              padding: '23px 26px 23px 16px',
              background: 'white',
              height: '164px'
            },
            subLabelStyles: {
              color: '#7B7B7B',
              fontSize: '1rem',
              margin: '0px',
              marginTop: '17px',
              marginBottom: '40px',
              fontFamily: 'Roboto',
              fontWeight: 500
            },
          }
        },
      ],
      asyncStepProcessingFunction: {
        type: 'promise',
        function: async (params) => {
          try {
            if (this.formSteps[this.formSteps.length - 1].fieldsList[0].fieldControl.control.value.length > 1)
              this.fullFormMessage += `*¿Donde entregaremos?:*\n${this.formSteps[this.formSteps.length - 1].fieldsList[0].fieldControl.control.value}\n\n`;

            const fileRoutes = await this.merchantsService.uploadAirtableAttachments(
              [
                base64ToFile(this.formSteps[0].fieldsList[1].fieldControl.control.value),
                base64ToFile(this.formSteps[3].fieldsList[2].fieldControl.control.value),
              ]
            );

            this.fullFormMessage += `*Foto de Referencia:*\n${fileRoutes[0]}\n\n`;
            this.fullFormMessage += `*Comprobante de Pago:*\n${fileRoutes[1]}\n\n`;

            const convertedTotalAmount = Number(
              this.formSteps[3].fieldsList[0].formattedValue
                .split('').filter(char => char !== ',' && char !== '$').join(''));

            const data = {
              details: this.formSteps[0].fieldsList[0].fieldControl.control.value,
              referenceImage: fileRoutes[0],
              phoneNumber: this.formSteps[1].fieldsList[0].fieldControl.control.value,
              fullname: this.formSteps[2].fieldsList[0].fieldControl.control.value,
              totalAmount: convertedTotalAmount,
              paymentMethod: this.formSteps[3].fieldsList[1].fieldControl.control.value,
              proofOfPayment: fileRoutes[1],
              fromWhereAreYouPaying: this.formSteps[4].fieldsList[0].fieldControl.control.value,
              dateConfirmation: this.formSteps[5].fieldsList[0].fieldControl.control.value,
              reservation: this.reservation ? new Date(
                this.reservation.data.dateInfo,
                this.reservation.data.monthNumber,
                this.reservation.data.day,
                this.reservation.data.hour.slice(-2) === 'pm' &&
                  this.reservation.data.hour.slice(0, 2) !== '12' ? this.reservation.data.hourNumber + 12 :
                  this.reservation.data.hour.slice(-2) === 'am' &&
                    this.reservation.data.hour.slice(0, 2) !== '12' ? this.reservation.data.hourNumber :
                    this.reservation.data.hour.slice(-2) === 'pm' ? 12 : 0,
                this.reservation.data.minutesNumber
              ).toISOString() : '',
              'about-delivery': this.formSteps[7].fieldsList[0].fieldControl.control.value,
              whereToDeliver: this.formSteps[8].fieldsList[0].fieldControl.control.value,
            }

            // const success = await this.merchantsService.uploadDataToClientsAirtable(
            //   this.merchantId,
            //   this.databaseName,
            //   data
            // );

            // this.dialog.open(GeneralFormSubmissionDialogComponent, {
            //   type: 'centralized-fullscreen',
            //   props: {
            //     icon: success ? 'check-circle.svg' : 'sadFace.svg',
            //     message: success ? null : 'Ocurrió un problema'
            //   },
            //   customClass: 'app-dialog',
            //   flags: ['no-header'],
            // });

            // window.location.href = this.whatsappLink + encodeURIComponent(this.fullFormMessage);

            return { ok: true };
          } catch (error) {
            this.dialog.open(GeneralFormSubmissionDialogComponent, {
              type: 'centralized-fullscreen',
              props: {
                icon: 'sadFace.svg',
                message: 'Ocurrió un problema'
              },
              customClass: 'app-dialog',
              flags: ['no-header'],
            });

            console.log(error);

            return { ok: false };
          }
        },
      },
      footerConfig,
      stepButtonInvalidText: 'SELECCIONA COMO INFORMARNOS',
      stepButtonValidText: 'ENVIAR LA ORDEN POR WHATSAPP'
    }
  ];

  constructor(
    private decimalPipe: DecimalPipe,
    private merchantsService: MerchantsService,
    private route: ActivatedRoute,
    private dialog: DialogService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const { merchantId, databaseName } = params;

      this.merchantId = merchantId;
      this.databaseName = databaseName;
    })
  }

}
