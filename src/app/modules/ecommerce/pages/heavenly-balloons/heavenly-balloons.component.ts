import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormStep } from 'src/app/core/types/multistep-form';
import { FormControl, Validators } from '@angular/forms';
import { HeaderInfoComponent } from 'src/app/shared/components/header-info/header-info.component';
import { ImageInputComponent } from 'src/app/shared/components/image-input/image-input.component';
import { ReservationOrderlessComponent } from '../reservations-orderless/reservations-orderless.component';
import { CalendarComponent } from 'src/app/shared/components/calendar/calendar.component';
import { DecimalPipe } from '@angular/common';
import {
  CountryISO,
} from 'ngx-intl-tel-input';

const commonContainerStyles = {
  margin: '41px 39px auto 39px'
}

const labelStyles = {
  color: '#7B7B7B',
  fontFamily: 'RobotoMedium',
  fontSize: '17px',
  fontWeight: 500,
  margin: '0px',
  display: 'flex',
  alignItems: 'center',
  padding: '10.5px 0px'
};



@Component({
  selector: 'app-heavenly-balloons',
  templateUrl: './heavenly-balloons.component.html',
  styleUrls: ['./heavenly-balloons.component.scss']
})
export class HeavenlyBalloonsComponent implements OnInit {
  scrollableForm = true;
  merchantId: string = null;
  databaseName: string = null;
  fullFormMessage: string = null;
  whatsappLink: string = 'https://wa.me/18492068680?text=';
  reservation: {
    data: Record<string, any>,
    message: string;
  } = null;
  birthday: {
    data: Record<string, any>,
    message: string;
  } = null;
  choosedReservation: boolean = false;
  defaultImages: (string | ArrayBuffer)[] = [''];
  recalculateFormWrapperHeight = false;
  files: File[] = [];

  formSteps: FormStep[] = [
    {
      fieldsList: [
        {
          name: 'name',
          fieldControl: {
            type: 'single',
            control: new FormControl('')
          },
          label: 'Nombre (*)',
          placeholder: 'Me llamo..',
          styles: {
            containerStyles: {
              display: 'inline-block',
              width: 'calc(100% / 2)',
              paddingRight: '6px',
              paddingLeft: '33px',
              marginTop: '73px'
              // width: '83.70%',
            },
            fieldStyles: {
              width: '100%',
            },
            labelStyles: labelStyles,
          },
        },
        {
          name: 'lastname',
          fieldControl: {
            type: 'single',
            control: new FormControl('')
          },
          label: 'Apellido: (*)',
          placeholder: 'Mi apellido es..',
          styles: {
            containerStyles: {
              display: 'inline-block',
              width: 'calc(100% / 2)',
              paddingLeft: '6px',
              paddingRight: '33px',
              // width: '83.70%',
            },
            fieldStyles: {
              width: '100%',
            },
            labelStyles: labelStyles,
          },
        },
        {
          name: 'socialId',
          fieldControl: {
            type: 'single',
            control: new FormControl('')
          },
          label: 'RNC o Cédula (Sólo si deseas Factura con NCF)',
          placeholder: '???-???????-?',
          styles: {
            containerStyles: {
              marginTop: '19px',
              width: '100%',
              padding: '0px 33px'
            },
            labelStyles: labelStyles,
          },
        },
        {
          name: 'instagramUser',
          fieldControl: {
            type: 'single',
            control: new FormControl('')
          },
          placeholder: 'Ejemplo: @_heavenlyballoons',
          label: 'Usuario de instagram',
          styles: {
            containerStyles: {
              marginTop: '19px',
              width: '100%',
              padding: '0px 33px'
            },
            labelStyles: {
              ...labelStyles,
              backgroundPositionX: '8px',
              backgroundPositionY: '6.5px',
              backgroundImage: 'url(https://storage-rewardcharly.sfo2.digitaloceanspaces.com/new-assets/instagram.svg)',
              backgroundRepeat: 'no-repeat',
              paddingLeft: '40px',
              display: 'flex',
              alignItems: 'center',
            }
          },
        },
      ],
      embeddedComponents: [
        {
          component: HeaderInfoComponent,
          beforeIndex: 0,
          inputs: {
            title: 'Heavenly Balloons',
            description: 'Formulario de Ordenes',
            profileImage: 'https://storage-rewardcharly.sfo2.digitaloceanspaces.com/merchants-images/heavenlyballoons.webp',
            socials: [
              {
                name: 'instagram',
                url: 'https://www.instagram.com/_heavenlyballoons/?hl=en'
              },
              {
                name: 'phone',
                url: '18492068680'
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
        },
        // {
        //   component: CalendarComponent,
        //   afterIndex: 3,
        //   inputs: {
        //     monthNameSelected: 'Enero',
        //     dateNumber: 1
        //   },
        //   outputs: []
        // }
      ],
      hideHeader: true,
      styles: {
        padding: '0px',
        paddingBottom: '2rem'
      },
      stepProcessingFunction: () => {
        this.fullFormMessage = `*Sobre tu orden:*\n${this.formSteps[0].fieldsList[0].fieldControl.control.value}\n\n`;

        return { ok: true }
      },
      stepButtonInvalidText: 'ESCRIBE QUIÉN ERES Y COMO TE CONTACTAMOS',
      stepButtonValidText: 'CONTINUA CON TU ORDEN'
    },
    {
      headerText: '',
      fieldsList: [
        {
          name: 'phoneNumber',
          fieldControl: {
            type: 'single',
            control: new FormControl('')
          },
          label: 'Número de teléfono (*)',
          inputType: 'phone',
          phoneCountryCode: CountryISO.Venezuela,
          styles: {
            labelStyles: {
              ...labelStyles,
            }
          },
          statusChangeCallbackFunction: (change) => {
            if(change === 'VALID') {
              this.formSteps[1].fieldsList[1].styles.containerStyles.display = 'block';
              this.recalculateFormWrapperHeight = true;
            }
            else
            this.formSteps[1].fieldsList[1].styles.containerStyles.display = 'none';
          },
        },
        {
          name: 'receiverPhoneNumber',
          fieldControl: {
            type: 'single',
            control: new FormControl('')
          },
          label: 'Si tienes otro número al cual deseas que contactemos para realizar la entrega, indícalo aquí',
          inputType: 'phone',
          phoneCountryCode: CountryISO.Venezuela,
          styles: {
            labelStyles: {
              ...labelStyles,
            },
            containerStyles: {
              display: 'none',
              marginTop: '19px'
            }
          }
        },
        {
          name: 'email',
          fieldControl: {
            type: 'single',
            control: new FormControl('')
          },
          label: 'Email',
          placeholder: 'example@domain',
          inputType: 'email',
          styles: {
            labelStyles: {
              ...labelStyles,
            },
            containerStyles: {
              marginTop: '19px',
              paddingBottom: '2rem'
            }
          }
        },
      ],
      stepProcessingFunction: () => {
        return { ok: true }
      },
      pageHeader: {
        text: '¿Donde recibirás las notificaciones de esta orden?',
        styles: {
          fontFamily: 'Roboto',
          fontWeight: 'bold',
          fontSize: '24px',
          margin: '0px',
          marginTop: '44px',
          marginBottom: '25px',
        }
      },
      stepButtonInvalidText: 'ESCRIBE QUIÉN ERES Y COMO TE CONTACTAMOS',
      stepButtonValidText: 'CONFIRMA TU PAGO'
    },
    {
      headerText: '',
      fieldsList: [
        {
          name: 'articleDescription',
          fieldControl: {
            type: 'single',
            control: new FormControl('')
          },
          label: 'Describe aquí cómo deseas que preparemos tu arreglo',
          placeholder: 'Escribe aquí...',
          inputType: 'textarea',
          styles: {
            labelStyles: {
              ...labelStyles,
            },
            fieldStyles: {
              borderRadius: '10px',
              padding: '23px 26px 23px 16px',
              background: 'white',
              height: '164px'
            },
          }
        },
        {
          name: 'sender',
          fieldControl: {
            type: 'single',
            control: new FormControl('')
          },
          label: 'Remitente (Si no deseas que indiquemos de parte de quien proviene este arreglo puedes escribir "Anónimo" o dejarlo vacío',
          placeholder: 'Escribe aquí',
          styles: {
            labelStyles: {
              ...labelStyles,
            },
            containerStyles: {
              marginTop: '19px'
            }
          }
        },
        {
          name: 'receiver',
          fieldControl: {
            type: 'single',
            control: new FormControl('')
          },
          label: 'Destinatario (Quién recibe este arreglo)',
          placeholder: 'Escribe aquí',
          styles: {
            labelStyles: {
              ...labelStyles,
            },
            containerStyles: {
              marginTop: '19px',
            }
          }
        },
      ],
      embeddedComponents: [
        {
          afterIndex: 2,
          component: ImageInputComponent,
          inputs: {
            imageField:
              this.defaultImages.length > 0 ? this.defaultImages : null,
            multiple: true,
            allowedTypes: ['png', 'jpg', 'jpeg'],
            imagesPerView: 3,
            innerLabel: 'Fotos de referencia',
            expandImage: true,
            topLabel: {
              text: '¿Tienes fotos de referencia? Adjúntalas aquí:',
              styles: {
                ...labelStyles
              },
            },
            containerStyles: {
              width: '157px',
              height: '137px',
            },
            fileStyles: {
              width: '157px',
              height: '137px',
              paddingLeft: '20px',
              textAlign: 'left',
              backgroundSize: 'cover'
            },
          },
          outputs: [
            {
              name: 'onFileInputBase64',
              callback: (result) => {
                this.defaultImages[result.index] = result.image;
                this.formSteps[2].embeddedComponents[0].inputs.innerLabel = "Adiciona otra imagen (opcional)";
                this.formSteps[2].embeddedComponents[0].shouldRerender = true;
              },
            },
            {
              name: 'onFileInput',
              callback: (result) => {
                this.files[result.index] = result.image;
              },
            },
          ],
          containerStyles: {
            marginTop: '19px',
            paddingBottom: '2rem'
          },
        }
      ],
      stepProcessingFunction: () => {
        return { ok: true }
      },
      stepButtonInvalidText: 'ESPECIFICA LOS DETALLES DE TU ORDEN',
      stepButtonValidText: 'CONTINUA CON TU ORDEN'
    },
    {
      headerText: '',
      fieldsList: [
        {
          name: 'wantToAddADedication',
          fieldControl: {
            type: 'single',
            control: new FormControl('')
          },
          selectionOptions: ['Si', 'No'],
          changeCallbackFunction: (change, params) => {
            this.formSteps[3].fieldsList[0].fieldControl.control.setValue(change, {
              emitEvent: false,
            });

            if (change === 'Si') {
              this.formSteps[3].fieldsList[1].styles.containerStyles.opacity = '1';
              this.formSteps[3].fieldsList[1].styles.containerStyles.marginLeft = '0px';              
              // this.formSteps[3].fieldsList[1].fieldControl.control.setValidators(Validators.required);
              this.formSteps[3].fieldsList[1].fieldControl.control.updateValueAndValidity();
            } else {
              this.formSteps[3].fieldsList[1].styles.containerStyles.opacity = '0';
              this.formSteps[3].fieldsList[1].styles.containerStyles.marginLeft = '1000px';              
              this.formSteps[3].fieldsList[1].fieldControl.control.setValue('');
              this.formSteps[3].fieldsList[1].fieldControl.control.setValidators([]);
              this.formSteps[3].fieldsList[1].fieldControl.control.updateValueAndValidity();              
            }
          },
          label: '¿Deseas incluir una tarjeta de dedicatoria a tu arreglo?',
          inputType: 'radio',
          styles: {
            containerStyles: {
              marginTop: '19px',
            },
            fieldStyles: {
              paddingLeft: '0px'
            },
            labelStyles: {
              fontSize: '24px',
              fontFamily: 'Roboto',
              fontWeight: 'bold'
            }
          },
        },
        {
          name: 'dedicationMessage',
          fieldControl: {
            type: 'single',
            control: new FormControl('')
          },
          label: 'Indica el mensaje de dedicatoria que te gustaría incluir en la tarjeta',
          placeholder: 'Escribe aquí...',
          inputType: 'textarea',
          styles: {
            labelStyles: {
              ...labelStyles,
            },
            fieldStyles: {
              borderRadius: '10px',
              padding: '23px 26px 23px 16px',
              background: 'white',
              height: '164px'
            },
            containerStyles: {
              transition: 'opacity 0.2s ease-in',
              marginTop: '19px',
              opacity: '0',
              marginLeft: '1000px'
            }
          }
        },
      ],
      stepProcessingFunction: () => {
        return { ok: true }
      },
      stepButtonInvalidText: 'SELECCIONA UNA OPCIÓN',
      stepButtonValidText: 'CONTINUA CON TU ORDEN'
    },
    {
      headerText: '',
      fieldsList: [
        {
          name: 'orderMedium',
          fieldControl: {
            type: 'single',
            control: new FormControl('')
          },
          selectionOptions: ['Whatsapp', 'Instagram', 'E-Mail', 'Website', 'Personal'],
          changeCallbackFunction: (change, params) => {
            this.formSteps[4].fieldsList[0].fieldControl.control.setValue(change, {
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
              ...labelStyles,
            },
            fieldStyles: {
              paddingLeft: '0px'
            }
          },
        },
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
            control: new FormControl(0)
          },
          shouldFormatNumber: true,
          label: 'Indica el total de tu orden. Si no lo sabes puedes dejarlo en blanco',
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
                    this.formSteps[4].fieldsList[1].placeholder = '';
                  }

                  this.formSteps[4].fieldsList[1].formattedValue = '$' + formatted;
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
                    this.formSteps[4].fieldsList[1].placeholder = '';
                  }

                  this.formSteps[4].fieldsList[1].formattedValue = '$' + formatted;
                }
              } else {
                const convertedNumber = Number(change.split('').filter(char => char !== '.').join(''));
                this.formSteps[4].fieldsList[1].fieldControl.control.setValue(convertedNumber, {
                  emitEvent: false,
                });
              }
            } catch (error) {
              console.log(error);
            }
          },
          styles: {
            labelStyles: {
              ...labelStyles,
            },
            containerStyles: {
              marginTop: '19px',
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
          name: 'firstPayment',
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
            control: new FormControl(0)
          },
          shouldFormatNumber: true,
          label: 'Monto Pagado (*)',
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
                    this.formSteps[4].fieldsList[2].placeholder = '';
                  }

                  this.formSteps[4].fieldsList[2].formattedValue = '$' + formatted;
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
                    this.formSteps[4].fieldsList[2].placeholder = '';
                  }

                  this.formSteps[4].fieldsList[2].formattedValue = '$' + formatted;
                }
              } else {
                const convertedNumber = Number(change.split('').filter(char => char !== '.').join(''));
                this.formSteps[4].fieldsList[2].fieldControl.control.setValue(convertedNumber, {
                  emitEvent: false,
                });
              }
            } catch (error) {
              console.log(error);
            }
          },
          styles: {
            labelStyles: {
              ...labelStyles,
            },
            containerStyles: {
              marginTop: '19px',
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
            control: new FormControl('')
          },
          selectionOptions: ['Efectivo', 'Cuenta Banreservas', 'Cuenta BHD', 'Cuenta Banco Popular', 'Yoyo App', 'Otro'],
          changeCallbackFunction: (change, params) => {
            this.formSteps[4].fieldsList[3].fieldControl.control.setValue(change, {
              emitEvent: false,
            });
          },
          label: 'Vía o Cuenta a la que realizaste tu pago',
          inputType: 'radio',
          styles: {
            containerStyles: {
              marginTop: '19px',
            },
            labelStyles: {
              ...labelStyles,
            },
            fieldStyles: {
              paddingLeft: '0px'
            }
          },
        },
        {
          name: 'referenceImage',
          fieldControl: {
            type: 'single',
            control: new FormControl('')
          },
          label: 'Adjunta aquí tu comprobante de Pago',
          inputType: 'file',
          placeholder: 'sube una imagen',
          styles: {
            labelStyles: {
              ...labelStyles,
            },
            fieldStyles: {
              minWidth: '192px',
              maxHeight: '163px',
              width: 'calc((100% - 35px * 2) - 55.14%)',
              borderRadius: '7px'
            },
            containerStyles: {
              marginTop: '19px',
              paddingBottom: '2rem'
            }
          },
        },
      ],
      stepProcessingFunction: () => {
        return { ok: true }
      },
      stepButtonInvalidText: 'SELECCIONA UNA OPCIÓN',
      stepButtonValidText: 'CONTINUA CON TU ORDEN'
    },
    {
      fieldsList: [
        {
          fieldControl: {
            type: 'single',
            control: new FormControl('')
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
            calendarId: "62bbb5f545c3506dfb3d11d4",
            firstLabel: "Fecha en la que deseas que entreguemos tu arreglo",
            secondLabel: "Horario de entrega",
            timeOfDayMode: true
          },
          outputs: [
            {
              name: 'onTimeOfDaySelection',
              callback: (timeOfDay) => {
                this.formSteps[5].fieldsList[0].fieldControl.control.setValue(timeOfDay);
              },
            }
          ],
          containerStyles: {
            paddingBottom: '2rem'
          }
        }
      ],
      stepProcessingFunction: () => {
        return { ok: true };
      },
      stepButtonInvalidText: 'ADICIONA LA FECHA ACORDADA',
      stepButtonValidText: 'CONTINUA CON TU ORDEN'
    },
    {
      headerText: '',
      fieldsList: [
        {
          name: 'about-delivery',
          label: '¿Cómo deseas que sea entregado tu arreglo?',
          fieldControl: {
            type: 'single',
            control: new FormControl('')
          },
          selectionOptions: [
            'Pick Up',
            'Delivery Zona Metropolitana',
            'Delivery Santo Domingo Norte',
            'Delivery Santo Domingo Este',
            'Delivery Zona Oriental'
          ],
          inputType: 'radio',
          styles: {
            containerStyles: {
              marginTop: '44px',
            },
            labelStyles: {
              ...labelStyles
            }
          }
        },
        {
          name: 'typeOfBuilding',
          label: 'Indica el tipo de Edificación',
          fieldControl: {
            type: 'single',
            control: new FormControl('')
          },
          selectionOptions: [
            'Casa',
            'Edificio Residencial',
            'Edificio Comercial',
            'Otra Opción'
          ],
          inputType: 'radio',
          styles: {
            containerStyles: {
              marginTop: '19px',
            },
            labelStyles: {
              ...labelStyles
            }
          }
        },
        {
          name: 'deliveryAddress',
          fieldControl: {
            type: 'single',
            control: new FormControl('')
          },
          label: 'Dirección en la que deseas que sea entregado tu arreglo',
          placeholder: 'Escribe aquí...',
          inputType: 'textarea',
          styles: {
            labelStyles: {
              ...labelStyles,
            },
            fieldStyles: {
              borderRadius: '10px',
              padding: '23px 26px 23px 16px',
              background: 'white',
              height: '164px'
            },
            containerStyles: {
              marginTop: '19px'
            }
          }
        },
        {
          name: 'addressReference',
          fieldControl: {
            type: 'single',
            control: new FormControl('')
          },
          label: 'Proporciónanos una referencia para que nuestro mensajero pueda encontrar el destino con mayor facilidad ',
          placeholder: 'Escribe aquí...',
          inputType: 'textarea',
          styles: {
            labelStyles: {
              ...labelStyles,
            },
            fieldStyles: {
              borderRadius: '10px',
              padding: '23px 26px 23px 16px',
              background: 'white',
              height: '164px'
            },
            containerStyles: {
              marginTop: '19px',
              paddingBottom: '2rem'
            }
          }
        },
        {
          name: 'location',
          fieldControl: {
            type: 'single',
            control: new FormControl('')
          },
          inputType: 'address',
          label: 'Si tienes el location, puedes indicarlo aquí',
          placeholder: 'Escribe aquí...',
          styles: {
            labelStyles: {
              ...labelStyles,
            },
            containerStyles: {
              marginTop: '19px',
              paddingBottom: '4rem'
            }
          }
        },
      ],
      stepProcessingFunction: () => {
        return { ok: true }
      },
      stepButtonInvalidText: 'SELECCIONA UNA OPCIÓN',
      stepButtonValidText: 'CONTINUA CON TU ORDEN'
    },
    {
      headerText: '',
      fieldsList: [
        {
          name: 'billType',
          label: 'Tipo de Factura',
          fieldControl: {
            type: 'single',
            control: new FormControl('')
          },
          selectionOptions: [
            'Sin Comprobante',
            'Comprobante Fiscal (B01)',
            'Consumo (B02)'
          ],
          inputType: 'radio',
          styles: {
            containerStyles: {
              marginTop: '44px',
            },
            labelStyles: {
              ...labelStyles
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
      stepButtonInvalidText: 'SELECCIONA UNA OPCIÓN',
      stepButtonValidText: 'CONTINUA CON TU ORDEN'
    }
  ]

  constructor(
    private route: ActivatedRoute,
    private decimalPipe: DecimalPipe
  ) { }
  

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const { merchantId, databaseName } = params;

      this.merchantId = merchantId;
      this.databaseName = databaseName;

      console.log("merchantId", this.merchantId);
      console.log("databasename", this.databaseName);
    })
  }

}
