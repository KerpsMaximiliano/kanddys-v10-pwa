import { Component, OnInit } from '@angular/core';
import { FormStep } from 'src/app/core/types/multistep-form';
import { HeaderInfoComponent } from 'src/app/shared/components/header-info/header-info.component';
import { FormControl, Validators } from '@angular/forms';
import { ReservationOrderlessComponent } from '../reservations-orderless/reservations-orderless.component';
import { DecimalPipe } from '@angular/common';
import { base64ToFile } from 'src/app/core/helpers/files.helpers';
import { MerchantsService } from 'src/app/core/services/merchants.service';

const commonContainerStyles = {
  margin: '41px 39px auto 39px'
}

@Component({
  selector: 'app-ll-studio-order-form',
  templateUrl: './ll-studio-order-form.component.html',
  styleUrls: ['./ll-studio-order-form.component.scss']
})
export class LlStudioOrderFormComponent implements OnInit {
  scrollableForm = false;
  reservation: string = null;
  formSteps: FormStep[] = [
    {
      fieldsList: [
        {
          name: 'details',
          label: 'Sobre tu orden *',
          sublabel: 'Especifica todos los detalles. En base a esta información se trabajará tu pedido.',
          inputType: 'textarea',
          fieldControl: new FormControl('sdqsdqdwqd', Validators.required),
          placeholder: 'Cuál es el artículo? Color? Material? Personalización, aclaraciones y demás datos relevantes a tu orden.',
          styles: {
            containerStyles: {
              ...commonContainerStyles,
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
          fieldControl: new FormControl(''),
          label: 'Foto de Referencia',
          sublabel: 'Adjuntar foto de referencia de su orden.',
          inputType: 'file',
          placeholder: 'sube una imagen',
          styles: {
            containerStyles: {
              ...commonContainerStyles,
              minWidth: '281px',
              marginTop: '58px'
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
            profileImage: 'https://storage-rewardcharly.sfo2.digitaloceanspaces.com/new-assets/IMG_6602234459B7-1.jpeg',
            socials: [
              {
                name: 'instagram',
                url: 'http://localhost:4200/ecommerce/ll-studio-order-form'
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
        return { ok: true }
      },
      stepButtonInvalidText: 'ADICIONA LA INFO DE TU ORDEN',
      stepButtonValidText: 'CONTINUA CON TU ORDEN'
    },
    {
      headerText: '',
      fieldsList: [
        {
          name: 'phoneNumber',
          fieldControl: new FormControl('', Validators.required),
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
      stepButtonInvalidText: 'ESCRIBE QUIÉN ERES Y COMO TE CONTACTAMOS',
      stepButtonValidText: 'CONFIRMA TU PAGO'
    },
    {
      headerText: '',
      fieldsList: [
        {
          name: 'fullname',
          fieldControl: new FormControl('', Validators.required),
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
        return { ok: true }
      },
      stepButtonInvalidText: 'ESCRIBE QUIÉN ERES Y COMO TE CONTACTAMOS',
      stepButtonValidText: 'CONFIRMA TU PAGO'
    },
    {
      headerText: '',
      fieldsList: [
        {
          name: 'totalAmount',
          formattedValue: '',
          fieldControl: new FormControl('', Validators.required),
          shouldFormatNumber: true,
          label: 'Monto total de Compra:',
          sublabel: 'Si no estas segur(x) puedes dejarlo en blanco.',
          inputType: 'number',
          placeholder: 'La compra es de $..',
          changeCallbackFunction: (change, params) => {
            try {
              const plainNumber = change
                .split(',')
                .join('')
                .split('.')
                .join('');
              const formatted = this.decimalPipe.transform(
                Number(plainNumber),
                '1.0-2'
              );

              if (formatted === '0') {
                this.formSteps[3].fieldsList[0].placeholder = '';
              }

              this.formSteps[3].fieldsList[0].formattedValue = '$' + formatted;
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
          fieldControl: new FormControl('', Validators.required),
          selectionOptions: ['Banco Popular', 'Banreservas', 'Banco BHD', 'Yoyo App', 'PayPal', 'Otro'],
          changeCallbackFunction: (change, params) => {
            this.formSteps[3].fieldsList[1].fieldControl.setValue(change, {
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
          fieldControl: new FormControl(''),
          label: 'Comprobante de Pago',
          sublabel: 'Anexar el comprobante de su pago',
          inputType: 'file',
          placeholder: 'sube una imagen',
          styles: {
            containerStyles: {
              minWidth: '281px',
              marginTop: '44px'
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
        return { ok: true }
      },
      stepButtonInvalidText: 'ESCRIBE QUIÉN ERES Y COMO TE CONTACTAMOS',
      stepButtonValidText: 'CONFIRMA TU PAGO'
    },
    {
      headerText: '',
      fieldsList: [
        {
          name: 'fromWhereAreYouPaying',
          fieldControl: new FormControl('', Validators.required),
          selectionOptions: ['Instagram @llstudiord', 'WhatsApp 809-871-8288', 'WhatsApp 809-508-3344', 'Correo Electrónico'],
          changeCallbackFunction: (change, params) => {
            this.formSteps[4].fieldsList[0].fieldControl.setValue(change, {
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
        return { ok: true }
      },
      stepButtonInvalidText: 'ESCRIBE QUIÉN ERES Y COMO TE CONTACTAMOS',
      stepButtonValidText: 'CONFIRMA TU PAGO'
    },
    {
      headerText: '',
      fieldsList: [
        {
          name: 'dateConfirmation',
          fieldControl: new FormControl('', Validators.required),
          selectionOptions: ['Si', 'No'],
          changeCallbackFunction: (change, params) => {
            this.formSteps[5].fieldsList[0].fieldControl.setValue(change, {
              emitEvent: false,
            });

            if (change === 'Si') {
              params.scrollToStep(6);
            } else
              params.scrollToStep(7);
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
      stepButtonInvalidText: 'ESCRIBE QUIÉN ERES Y COMO TE CONTACTAMOS',
      stepButtonValidText: 'CONFIRMA TU PAGO'
    },
    {
      fieldsList: [
        {
          fieldControl: new FormControl('', Validators.required),
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
            calendarId: "62a7e8dabc94801413a541f5"
          },
          outputs: [
            {
              name: 'onReservation',
              callback: (reservationMessage) => {
                this.reservation = reservationMessage;
                this.formSteps[6].fieldsList[0].fieldControl.setValue(this.reservation);
              },
            }
          ]
        }
      ],
      stepProcessingFunction: () => {
        if (this.reservation) return { ok: true };

        return { ok: false };
      },
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
          fieldControl: new FormControl('', Validators.required),
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
      stepProcessingFunction: () => {
        return { ok: true }
      },
      stepButtonInvalidText: 'ESCRIBE QUIÉN ERES Y COMO TE CONTACTAMOS',
      stepButtonValidText: 'CONFIRMA TU PAGO'
    },
    {
      fieldsList: [
        {
          name: 'details',
          label: '¿Dónde entregaremos?',
          sublabel: 'Indicar sólamente si aplica. El delivery en Santo Domingo sólo aplica a la zona metropolitana y varia de RD$200 a RD$350 aproximadamente. El envio al interior se hace via courrier, a partir de RD$300.',
          inputType: 'textarea',
          fieldControl: new FormControl('', Validators.required),
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
            const fileRoutes = await this.merchantsService.uploadAirtableAttachments(
              [
                base64ToFile(this.formSteps[0].fieldsList[1].fieldControl.value),
                base64ToFile(this.formSteps[3].fieldsList[2].fieldControl.value),
              ]
            );

            const data = {
              details: this.formSteps[0].fieldsList[0].fieldControl.value,
              referenceImage: fileRoutes[0],
              phoneNumber: this.formSteps[1].fieldsList[0].fieldControl.value,
              fullname: this.formSteps[2].fieldsList[0].fieldControl.value,
              totalAmount: this.formSteps[3].fieldsList[0].fieldControl.value,
              paymentMethod: this.formSteps[3].fieldsList[1].fieldControl.value,
              proofOfPayment: fileRoutes[1],
              fromWhereAreYouPaying: this.formSteps[4].fieldsList[0].fieldControl.value,
              dateConfirmation: this.formSteps[5].fieldsList[0].fieldControl.value,
              reservation: this.formSteps[6].fieldsList[0].fieldControl.value,
              'about-delivery': this.formSteps[7].fieldsList[0].fieldControl.value,
              whereToDeliver: this.formSteps[8].fieldsList[0].fieldControl.value,
            }

            const result = await this.merchantsService.uploadDataToClientsAirtable(
              "6295da0a1f8e415f0315edbf",
              "Con luis",
              data
            );

            return { ok: true };
          } catch (error) {
            console.log(error);

            return { ok: false };
          }
        },
      },
      stepButtonInvalidText: 'SELECCIONA COMO INFORMARNOS',
      stepButtonValidText: 'ENVIAR LA ORDEN POR WHATSAPP'
    }
  ];

  constructor(
    private decimalPipe: DecimalPipe,
    private merchantsService: MerchantsService
  ) { }

  ngOnInit(): void {
  }

}
