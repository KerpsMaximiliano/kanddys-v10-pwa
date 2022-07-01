import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormStep, FooterOptions } from 'src/app/core/types/multistep-form';
import { FormControl, Validators } from '@angular/forms';
import { HeaderInfoComponent } from 'src/app/shared/components/header-info/header-info.component';
import { ImageInputComponent } from 'src/app/shared/components/image-input/image-input.component';
import { ReservationOrderlessComponent } from '../reservations-orderless/reservations-orderless.component';
import { GeneralFormSubmissionDialogComponent } from 'src/app/shared/dialogs/general-form-submission-dialog/general-form-submission-dialog.component';
import { CalendarComponent } from 'src/app/shared/components/calendar/calendar.component';
import { DecimalPipe } from '@angular/common';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import {
  CountryISO,
} from 'ngx-intl-tel-input';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { base64ToFile } from 'src/app/core/helpers/files.helpers';

const commonContainerStyles = {
  margin: '41px 39px auto 39px'
}

const labelStyles = {
  color: '#7B7B7B',
  fontFamily: 'RobotoMedium',
  fontSize: '17px',
  fontWeight: '500',
  display: 'flex',
  alignItems: 'center',
  margin: '0px',
  paddingTop: '51px',
  paddingBottom: '0px',
  marginBottom: '0px'
};

const footerConfig: FooterOptions = {
  bgColor: '#2874AD',
  color: '#E9E371',
  enabledStyles: {
    height: '30px',
    fontSize: '17px',
    padding: '0px'
  },
  disabledStyles: {
    height: '30px',
    fontSize: '17px',
    padding: '0px'
  }
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
  formMessageInitialHistory: Record<string, any> = {};
  whatsappLink: string = 'https://wa.me/18492068680?text=';
  reservation: {
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
            control: new FormControl('', Validators.required)
          },
          label: 'Nombre (*)',
          topLabelAction: {
            text: 'Sobre ti',
            clickable: false
          },
          placeholder: 'Me llamo..',
          styles: {
            containerStyles: {
              display: 'inline-block',
              width: 'calc(100% / 2)',
              paddingRight: '6px',
              paddingLeft: '33px',
              marginTop: '36px',
              // width: '83.70%',
            },
            topLabelActionStyles: {
              fontFamily: 'Roboto',
              fontWeight: 'bold',
              fontSize: '24px',
            },
            fieldStyles: {
              width: '100%',
              marginTop: '26px',
            },
            labelStyles: {
              ...labelStyles,
            },
          },
        },
        {
          name: 'lastname',
          fieldControl: {
            type: 'single',
            control: new FormControl('', Validators.required)
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
              marginTop: '26px',
              width: '100%',
            },
            labelStyles: {
              ...labelStyles,
            },
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
              width: '100%',
              padding: '0px 33px',
            },
            fieldStyles: {
              marginTop: '26px',
              width: '100%',
            },
            labelStyles: {
              ...labelStyles,
              paddingTop: '65px'
            },
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
              width: '100%',
              padding: '0px 33px'
            },
            fieldStyles: {
              marginTop: '21px',
              width: '100%',
            },
            labelStyles: {
              ...labelStyles,
              paddingTop: '65px',
              backgroundPositionX: '8px',
              backgroundPositionY: '60.5px',
              backgroundImage: 'url(https://storage-rewardcharly.sfo2.digitaloceanspaces.com/new-assets/instagram.svg)',
              backgroundRepeat: 'no-repeat',
              paddingLeft: '40px',
              paddingBottom: '5px',
              display: 'flex',
              alignItems: 'center',
            }
          },
        },
        {
          name: 'birthday',
          fieldControl: {
            type: 'single',
            control: new FormControl('', Validators.required)
          },
          placeholder: 'YYYY-MM-DD',
          label: 'Fecha de nacimiento',
          inputType: 'date',
          styles: {
            containerStyles: {
              width: '100%',
              padding: '0px 33px',
            },
            fieldStyles: {
              marginTop: '26px',
              width: '100%',
            },
            labelStyles: {
              ...labelStyles,
              paddingTop: '65px',
            },
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
        }
      ],
      hideHeader: true,
      styles: {
        padding: '0px',
        paddingBottom: '4rem'
      },
      footerConfig,
      stepProcessingFunction: (params) => {
        const {name, lastname, socialId, instagramUser} = params.dataModel.value['1'];

        this.fullFormMessage = "";
        this.fullFormMessage += `*Detalles de la orden*\n\n`;
        this.fullFormMessage += `*Nombre completo:*\n${name} ${lastname}\n\n`;
        
        if(socialId && socialId !== '') this.fullFormMessage += `*RNC o Cédula:*\n${socialId}\n\n`;

        if(instagramUser && instagramUser  !== '') this.fullFormMessage += `*Usuario de Instagram:*\n${instagramUser}\n\n`;

        if(!this.formMessageInitialHistory['1'])
          this.formMessageInitialHistory['1'] = this.fullFormMessage;


        this.formMessageInitialHistory['2'] = null;

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
            control: new FormControl('', Validators.required)
          },
          label: 'Número de teléfono (*)',
          inputType: 'phone',
          phoneCountryCode: CountryISO.DominicanRepublic,
          styles: {
            labelStyles: {
              ...labelStyles,
              marginBottom: '26px'
            },
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
          phoneCountryCode: CountryISO.DominicanRepublic,
          styles: {
            labelStyles: {
              ...labelStyles,
              paddingTop: '65px',
              marginBottom: '26px'
            },
            containerStyles: {
              display: 'none',
            },
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
              paddingTop: '65px'
            },
            containerStyles: {
              paddingBottom: '4rem'
            },
            fieldStyles: {
              marginTop: '26px'
            }
          }
        },
      ],
      stepProcessingFunction: (params) => {
        const { email, phoneNumber, receiverPhoneNumber } = params.dataModel.value['2'];

        if(!this.formMessageInitialHistory['2'])
          this.formMessageInitialHistory['2'] = this.formMessageInitialHistory['1'];

        this.fullFormMessage = this.formMessageInitialHistory['1'];
        this.fullFormMessage += `*Número de teléfono:*\n${phoneNumber.nationalNumber}\n\n`;

        if(receiverPhoneNumber && receiverPhoneNumber !== '') this.fullFormMessage += `*Número alternativo:*\n${receiverPhoneNumber.nationalNumber}\n\n`;
        if(email && email !== '') this.fullFormMessage += `*Email:*\n${email}\n\n`;

        this.formMessageInitialHistory['2'] = this.fullFormMessage;

        this.formMessageInitialHistory['3'] = null;

        return { ok: true }
      },
      pageHeader: {
        text: '¿Donde recibirás las notificaciones de esta orden?',
        styles: {
          fontFamily: 'Roboto',
          fontWeight: 'bold',
          fontSize: '24px',
          margin: '0px',
          marginTop: '36px',
        }
      },
      footerConfig,
      stepButtonInvalidText: 'ESCRIBE COMO TE CONTACTAMOS',
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
              paddingBottom: '26px'
            },
            fieldStyles: {
              borderRadius: '10px',
              padding: '23px 26px 23px 16px',
              background: 'white',
              height: '164px'
            },
          }
        },
      ],
      embeddedComponents: [
        {
          afterIndex: 0,
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
                ...labelStyles,
                paddingTop: '65px',
                paddingBottom: '26px'
              },
            },
            containerStyles: {
              width: '157px',
              height: '137px',
              margin: '0px'
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
            marginTop: '0px',
            paddingBottom: '4rem'
          },
        }
      ],
      stepProcessingFunction: (params) => {
        const { articleDescription } = params.dataModel.value['3'];

        if(!this.formMessageInitialHistory['3'])
          this.formMessageInitialHistory['3'] = this.formMessageInitialHistory['2'];

        this.fullFormMessage = this.formMessageInitialHistory['2'];

        if(articleDescription && articleDescription !== '') this.fullFormMessage += `*Descripción de Artículo:*\n${articleDescription}\n\n`;


        this.formMessageInitialHistory['3'] = this.fullFormMessage;
        this.formMessageInitialHistory['4'] = null;

        return { ok: true }
      },
      pageHeader: {
        text: 'Sobre el arreglo',
        styles: {
          fontFamily: 'Roboto',
          fontWeight: 'bold',
          fontSize: '24px',
          margin: '0px',
          marginTop: '36px',
        }
      },
      footerConfig,
      stepButtonInvalidText: 'ESPECIFICA LOS DETALLES DE TU ORDEN',
      stepButtonValidText: 'CONTINUA CON TU ORDEN'
    },
    {
      headerText: '',
      fieldsList: [
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
              paddingBottom: '26px'
            }
          }
        },
        {
          name: 'receiver',
          fieldControl: {
            type: 'single',
            control: new FormControl('', Validators.required)
          },
          label: 'Destinatario (Quién recibe este arreglo) (*)',
          placeholder: 'Escribe aquí',
          styles: {
            labelStyles: {
              ...labelStyles,
              paddingTop: '65px',
              paddingBottom: '26px'
            },
            containerStyles: {
              paddingBottom: '4rem'
            }
          }
        },
      ],
      stepProcessingFunction: (params) => {
        const { sender, receiver } = params.dataModel.value['4'];

        if(!this.formMessageInitialHistory['4'])
          this.formMessageInitialHistory['4'] = this.formMessageInitialHistory['3'];

        this.fullFormMessage = this.formMessageInitialHistory['3'];

        this.fullFormMessage += `*Remitente:*\n${!sender || sender === '' ? 'Anónimo' : sender}\n\n`;
        if(receiver && receiver !== '') this.fullFormMessage += `*Destinatario:*\n${receiver}\n\n`;

        this.formMessageInitialHistory['4'] = this.fullFormMessage;

        this.formMessageInitialHistory['5'] = null;
        
        return { ok: true }
      },
      pageHeader: {
        text: 'Sobre la entrega',
        styles: {
          fontFamily: 'Roboto',
          fontWeight: 'bold',
          fontSize: '24px',
          margin: '0px',
          marginTop: '36px',
        }
      },
      footerConfig,
      stepButtonInvalidText: 'ESPECIFICA LOS DETALLES DE LA ENTREGA',
      stepButtonValidText: 'CONTINUA CON TU ORDEN'
    },
    {
      headerText: '',
      fieldsList: [
        {
          name: 'wantToAddADedication',
          fieldControl: {
            type: 'single',
            control: new FormControl('', Validators.required)
          },
          selectionOptions: ['Si', 'No'],
          changeCallbackFunction: (change, params) => {
            this.formSteps[4].fieldsList[0].fieldControl.control.setValue(change, {
              emitEvent: false,
            });

            if (change === 'Si') {
              this.formSteps[4].fieldsList[1].styles.containerStyles.opacity = '1';
              this.formSteps[4].fieldsList[1].styles.containerStyles.marginLeft = '0px';              
              this.formSteps[4].fieldsList[1].fieldControl.control.setValidators(Validators.required);
              this.formSteps[4].fieldsList[1].fieldControl.control.updateValueAndValidity();
            } else {
              this.formSteps[4].fieldsList[1].styles.containerStyles.opacity = '0';
              this.formSteps[4].fieldsList[1].styles.containerStyles.marginLeft = '1000px';              
              this.formSteps[4].fieldsList[1].fieldControl.control.setValue('');
              this.formSteps[4].fieldsList[1].fieldControl.control.setValidators([]);
              this.formSteps[4].fieldsList[1].fieldControl.control.updateValueAndValidity();              
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
              paddingBottom: '26px',
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
      stepProcessingFunction: (params) => {
        const { wantToAddADedication, dedicationMessage } = params.dataModel.value['5'];

        if(!this.formMessageInitialHistory['5'])
          this.formMessageInitialHistory['5'] = this.formMessageInitialHistory['4'];

        this.fullFormMessage = this.formMessageInitialHistory['4'];

        if(wantToAddADedication === 'Si')
          this.fullFormMessage += `*Mensaje de Dedicatoria:*\n${dedicationMessage}\n\n`;

          this.formMessageInitialHistory['5'] = this.fullFormMessage;

        this.formMessageInitialHistory['6'] = null;
        
        return { ok: true }
      },
      footerConfig,
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
            control: new FormControl('', Validators.required)
          },
          selectionOptions: ['Whatsapp', 'Instagram', 'E-Mail', 'Website', 'Personal'],
          changeCallbackFunction: (change, params) => {
            this.formSteps[5].fieldsList[0].fieldControl.control.setValue(change, {
              emitEvent: false,
            });
          },
          label: 'Via de pedido (*)',
          inputType: 'radio',
          styles: {
            containerStyles: {
              marginTop: '36px',
            },
            labelStyles: {
              fontSize: '24px',
              fontFamily: 'Roboto',
              fontWeight: 'bold',
              marginBottom: '0px',
              paddingBottom: '26px'
            },
            fieldStyles: {
              paddingLeft: '0px'
            }
          },
        },
      ],
      stepProcessingFunction: (params) => {
        const { orderMedium } = params.dataModel.value['6'];

        if(!this.formMessageInitialHistory['6'])
          this.formMessageInitialHistory['6'] = this.formMessageInitialHistory['5'];

        this.fullFormMessage = this.formMessageInitialHistory['5'];

        if(orderMedium !== '') 
          this.fullFormMessage += `*Via de pedido:*\n${orderMedium}\n\n`;

        this.formMessageInitialHistory['6'] = this.fullFormMessage;

        this.formMessageInitialHistory['7'] = null;
        
        return { ok: true }
      },
      footerConfig,
      stepButtonInvalidText: 'SELECCIONA UNA OPCIÓN',
      stepButtonValidText: 'CONTINUA CON TU ORDEN'
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
            control: new FormControl(0)
          },
          shouldFormatNumber: true,
          label: 'Indica el total de tu orden. Si no lo sabes puedes dejarlo en blanco',
          inputType: 'number',
          placeholder: 'El total es de $..',
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
                    this.formSteps[6].fieldsList[0].placeholder = '';
                  }

                  this.formSteps[6].fieldsList[0].formattedValue = '$' + formatted;
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
                    this.formSteps[6].fieldsList[0].placeholder = '';
                  }

                  this.formSteps[6].fieldsList[0].formattedValue = '$' + formatted;
                }
              } else {
                const convertedNumber = Number(change.split('').filter(char => char !== '.').join(''));
                this.formSteps[6].fieldsList[0].fieldControl.control.setValue(convertedNumber, {
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
              paddingBottom: '26px'
            },
            containerStyles: {
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
            control: new FormControl(0, [
              Validators.required,
              Validators.min(0.01)
            ])
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
                    this.formSteps[6].fieldsList[1].placeholder = '';
                  }

                  this.formSteps[6].fieldsList[1].formattedValue = '$' + formatted;
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
                    this.formSteps[6].fieldsList[1].placeholder = '';
                  }

                  this.formSteps[6].fieldsList[1].formattedValue = '$' + formatted;
                }
              } else {
                const convertedNumber = Number(change.split('').filter(char => char !== '.').join(''));
                this.formSteps[6].fieldsList[1].fieldControl.control.setValue(convertedNumber, {
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
              paddingBottom: '26px',
              paddingTop: '65px'
            },
            containerStyles: {
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
          selectionOptions: ['Efectivo', 'Cuenta Banreservas', 'Cuenta BHD', 'Cuenta Banco Popular', 'Yoyo App', 'Otro'],
          changeCallbackFunction: (change, params) => {
            this.formSteps[6].fieldsList[2].fieldControl.control.setValue(change, {
              emitEvent: false,
            });
          },
          label: 'Vía o Cuenta a la que realizaste tu pago (*)',
          inputType: 'radio',
          styles: {
            labelStyles: {
              ...labelStyles,
              fontFamily: 'Roboto',
              color: 'black',
              fontWeight: 500,
              fontSize: '19px',
              paddingBottom: '26px',
              paddingTop: '65px'
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
            control: new FormControl('', Validators.required)
          },
          label: 'Adjunta aquí tu comprobante de Pago(*)',
          inputType: 'file',
          placeholder: 'sube una imagen',
          styles: {
            labelStyles: {
              ...labelStyles,
              paddingBottom: '26px',
              paddingTop: '65px'
            },
            fieldStyles: {
              minWidth: '192px',
              maxHeight: '163px',
              width: 'calc((100% - 35px * 2) - 55.14%)',
              borderRadius: '7px'
            },
            containerStyles: {
              paddingBottom: '4rem'
            }
          },
        },
      ],
      stepProcessingFunction: (params) => {
        const totalAmount = this.formSteps[6].fieldsList[0].formattedValue;
        const firstPayment = this.formSteps[6].fieldsList[1].formattedValue;
        const { paymentMethod } = params.dataModel.value['7'];

        if(!this.formMessageInitialHistory['7'])
          this.formMessageInitialHistory['7'] = this.formMessageInitialHistory['6'];

        this.fullFormMessage = this.formMessageInitialHistory['6'];

        if(totalAmount && totalAmount !== '') 
          this.fullFormMessage += `*Total:*\n${totalAmount}\n\n`;

        if(firstPayment && firstPayment !== '') 
          this.fullFormMessage += `*1er. Pago:*\n${firstPayment}\n\n`;
          
        if(paymentMethod && paymentMethod !== "") 
          this.fullFormMessage += `*Forma de 1er. Pago:*\n${paymentMethod}\n\n`;

        this.formMessageInitialHistory['7'] = this.fullFormMessage;

        this.formMessageInitialHistory['8'] = null;
        
        return { ok: true }
      },
      pageHeader: {
        text: 'Sobre el pago',
        styles: {
          fontFamily: 'Roboto',
          fontWeight: 'bold',
          fontSize: '24px',
          margin: '0px',
          marginTop: '36px',
        }
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
            calendarId: "62bbb5f545c3506dfb3d11d4",
            firstLabel: "FECHA EN LA QUE DESEAS QUE ENTREGUEMOS TU ARREGLO",
            secondLabel: "HORARIO DE ENTREGA",
            timeOfDayMode: true
          },
          outputs: [
            {
              name: 'onTimeOfDaySelection',
              callback: (timeOfDay) => {
                this.formSteps[7].fieldsList[0].fieldControl.control.setValue(timeOfDay);
              },
            }
          ],
          containerStyles: {
            paddingBottom: '4rem'
          }
        }
      ],
      stepProcessingFunction: (params) => {
        const { reservation: timeOfDay } = params.dataModel.value['8'];

        if(!this.formMessageInitialHistory['8'])
          this.formMessageInitialHistory['8'] = this.formMessageInitialHistory['6'];
        
        this.fullFormMessage = this.formMessageInitialHistory['6'];

        if(timeOfDay) {
          this.fullFormMessage += `*Entrega:*\n${timeOfDay.dayName}, ${timeOfDay.dayNumber} de ${timeOfDay.monthName}\n\n`;
        }

        this.formMessageInitialHistory['8'] = this.fullFormMessage;

        this.formMessageInitialHistory['9'] = null;

        return { ok: true };
      },
      footerConfig,
      stepButtonInvalidText: 'ADICIONA LA FECHA ACORDADA',
      stepButtonValidText: 'CONTINUA CON TU ORDEN'
    },
    {
      headerText: '',
      fieldsList: [
        {
          name: 'deliveryMethod',
          label: '¿Cómo deseas que sea entregado tu arreglo? (*)',
          fieldControl: {
            type: 'single',
            control: new FormControl('', Validators.required)
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
            labelStyles: {
              ...labelStyles,
              fontFamily: 'Roboto',
              color: 'black',
              fontWeight: 500,
              fontSize: '19px',
              paddingBottom: '26px',
            }
          }
        },
        {
          name: 'typeOfBuilding',
          label: 'Indica el tipo de Edificación (*)',
          fieldControl: {
            type: 'single',
            control: new FormControl('', Validators.required)
          },
          selectionOptions: [
            'Casa',
            'Edificio Residencial',
            'Edificio Comercial',
            'Otra Opción'
          ],
          inputType: 'radio',
          styles: {
            labelStyles: {
              ...labelStyles,
              fontFamily: 'Roboto',
              color: 'black',
              fontWeight: 500,
              fontSize: '19px',
              paddingBottom: '26px',
              paddingTop: '65px'
            }
          }
        },
        {
          name: 'deliveryAddress',
          fieldControl: {
            type: 'single',
            control: new FormControl('', Validators.required)
          },
          label: 'Dirección en la que deseas que sea entregado tu arreglo (*)',
          placeholder: 'Escribe aquí...',
          inputType: 'textarea',
          styles: {
            labelStyles: {
              ...labelStyles,
              paddingBottom: '26px',
              paddingTop: '65px'
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
              paddingBottom: '26px',
              paddingTop: '65px'
            },
            fieldStyles: {
              borderRadius: '10px',
              padding: '23px 26px 23px 16px',
              background: 'white',
              height: '164px'
            },
            containerStyles: {
              paddingBottom: '4rem'
            }
          }
        },
        {
          name: 'location',
          fieldControl: {
            type: 'single',
            control: new FormControl('')
          },
          label: 'Si tienes el location, puedes indicarlo aquí',
          placeholder: 'Escribe aquí...',
          styles: {
            labelStyles: {
              ...labelStyles,
              paddingTop: '65px',
              paddingBottom: '26px'
            },
            containerStyles: {
              paddingBottom: '4rem'
            }
          }
        },
      ],
      footerConfig,
      stepProcessingFunction: (params) => {
        const { deliveryMethod, typeOfBuilding, deliveryAddress, addressReference, location } = params.dataModel.value['9'];

        if(!this.formMessageInitialHistory['9'])
          this.formMessageInitialHistory['9'] = this.formMessageInitialHistory['8'];
      
        this.fullFormMessage = this.formMessageInitialHistory['8'];

        if(deliveryMethod && deliveryMethod !== '') {
          this.fullFormMessage += `*Forma de Entrega:*\n${deliveryMethod}\n\n`;
        }

        if(typeOfBuilding && typeOfBuilding !== '') {
          this.fullFormMessage += `*Tipo de Edificación:*\n${typeOfBuilding}\n\n`;
        }

        if(deliveryAddress && deliveryAddress !== '') {
          this.fullFormMessage += `*Dirección de Entrega:*\n${deliveryAddress}\n\n`;
        }

        if(addressReference && addressReference !== '') {
          this.fullFormMessage += `*Referencia Dirección:*\n${addressReference}\n\n`;
        }

        if(location && location !== '') {
          this.fullFormMessage += `*Location:*\n${location}\n\n`;
        }

        this.formMessageInitialHistory['9'] = this.fullFormMessage;

        this.formMessageInitialHistory['10'] = null;

        return { ok: true }
      },
      pageHeader: {
        text: 'Cuéntanos más sobre la entrega',
        styles: {
          fontFamily: 'Roboto',
          fontWeight: 'bold',
          fontSize: '24px',
          margin: '0px',
          marginTop: '36px',
        }
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
            control: new FormControl('', Validators.required)
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
              ...labelStyles,
              ...labelStyles,
              fontFamily: 'Roboto',
              color: 'black',
              fontWeight: 500,
              fontSize: '19px',
              paddingBottom: '26px',
            },
          }
        }
      ],
      footerConfig,
      stepProcessingFunction: (params) => {
        const { billType } = params.dataModel.value['10'];

        if(!this.formMessageInitialHistory['10'])
          this.formMessageInitialHistory['10'] = this.formMessageInitialHistory['9'];

        this.fullFormMessage = this.formMessageInitialHistory['9'];

        this.fullFormMessage += `*Tipo de Factura:*\n${billType}\n\n`;

        this.formMessageInitialHistory['10'] = this.fullFormMessage;

        this.formMessageInitialHistory['11'] = null;

        return { ok: true }
      },
      stepButtonInvalidText: 'SELECCIONA UNA OPCIÓN',
      stepButtonValidText: 'CONTINUA CON TU ORDEN'
    },
    {
      headerText: '',
      fieldsList: [
        {
          name: 'howDidYouFindUs',
          fieldControl: {
            type: 'single',
            control: new FormControl('')
          },
          label: '',
          placeholder: 'Escribe aquí...',
          inputType: 'textarea',
          styles: {
            labelStyles: {
              height: '0px',
              padding: '0px',
              margin: '0px',
            },
            fieldStyles: {
              borderRadius: '10px',
              padding: '23px 26px 23px 16px',
              background: 'white',
              height: '164px'
            },
          }
        },
      ],
      pageHeader: {
        text: '¿Cómo nos conociste?',
        styles: {
          fontFamily: 'Roboto',
          fontWeight: 'bold',
          fontSize: '24px',
          margin: '0px',
          marginTop: '36px',
          marginBottom: '26px'
        }
      },
      footerConfig,
      stepButtonInvalidText: 'LLENA EL CAMPO',
      stepButtonValidText: 'ENVIAR',
      asyncStepProcessingFunction: {
        type: 'promise',
        function: async (params) => {
          try {
            const { instagramUser, name, lastname, socialId, birthday } = params.dataModel.value['1'];
            const { email, phoneNumber, receiverPhoneNumber } = params.dataModel.value['2'];
            const { articleDescription } = params.dataModel.value['3'];
            const { receiver, sender } = params.dataModel.value['4'];
            const { dedicationMessage, wantToAddADedication } = params.dataModel.value['5'];
            const { orderMedium } = params.dataModel.value['6'];
            const { paymentMethod, referenceImage } = params.dataModel.value['7'];
            let totalAmount = this.formSteps[6].fieldsList[0].formattedValue;
            let firstPayment = this.formSteps[6].fieldsList[1].formattedValue;

            const convertedTotalAmount = Number(
              totalAmount
                .split('').filter(char => char !== ',' && char !== '$').join(''));
            
            const convertedFirstPayment = Number(
              firstPayment
                .split('').filter(char => char !== ',' && char !== '$').join(''));
  
            let [birthYear, birthMonth, birthDay] = birthday.split('-');

            birthYear = Number(birthYear);
            birthMonth = Number(birthMonth);
            birthDay = Number(birthDay);

            const birthDayISOString = new Date(birthYear, birthMonth - 1, birthDay).toISOString();

            const { reservation: delivery } = params.dataModel.value['8'];
            const { 
              addressReference, 
              deliveryAddress, 
              deliveryMethod,
              location,
              typeOfBuilding
            } = params.dataModel.value['9'];
            const { billType } = params.dataModel.value['10'];
            const { howDidYouFindUs } = params.dataModel.value['11'];

            // if (this.formSteps[this.formSteps.length - 1].fieldsList[0].fieldControl.control.value.length > 1)
            //   this.fullFormMessage += `*¿Donde entregaremos?:*\n${this.formSteps[this.formSteps.length - 1].fieldsList[0].fieldControl.control.value}\n\n`;

            const files = [];

            files.push(base64ToFile(referenceImage));

            this.defaultImages.forEach(image => {
              if(image !== "") {
                files.push(base64ToFile(image as string))
              }
            });

            const fileRoutes = await this.merchantsService.uploadAirtableAttachments(files);

            this.fullFormMessage += `*Comprobante de Pago:*\n${fileRoutes[0]}\n\n`;
            this.fullFormMessage += `*Fotos de Referencia:*\n${fileRoutes.slice(1,).join('\n')}\n\n`;

            const deliveryISOString = new Date(new Date().getFullYear(), delivery.monthNumber - 1, delivery.dayNumber).toISOString();

            console.log(deliveryISOString);

            const data = {
              instagramUser,
              name,
              lastname,
              socialId,
              email,
              phoneNumber,
              receiverPhoneNumber,
              articleDescription,
              sender: sender !== '' ? sender : 'Anónimo',
              receiver,
              dedicationMessage,
              wantToAddADedication,
              orderMedium,
              paymentMethod,
              referenceImage: fileRoutes[0],
              delivery: deliveryISOString,
              timeOfDay: delivery.timeOfDay,
              addressReference,
              deliveryAddress,
              deliveryMethod,
              location,
              typeOfBuilding,
              billType,
              totalAmount: convertedTotalAmount,
              firstPayment: convertedFirstPayment,
              articlePhotos: fileRoutes.slice(1,),
              howDidYouFindUs,
              birthday: birthDayISOString,
            };

            const success = await this.merchantsService.uploadDataToClientsAirtable(
              this.merchantId,
              this.databaseName,
              data
            );

            this.dialog.open(GeneralFormSubmissionDialogComponent, {
              type: 'centralized-fullscreen',
              props: {
                icon: success ? 'check-circle.svg' : 'sadFace.svg',
                message: success ? null : 'Ocurrió un problema'
              },
              customClass: 'app-dialog',
              flags: ['no-header'],
            });

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
    },
  ]

  constructor(
    private route: ActivatedRoute,
    private decimalPipe: DecimalPipe,
    private dialog: DialogService,
    private merchantsService: MerchantsService
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
