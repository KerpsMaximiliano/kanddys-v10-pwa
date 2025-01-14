import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormStep, FooterOptions } from 'src/app/core/types/multistep-form';
import {
  AbstractControl,
  FormControl,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { HeaderInfoComponent } from 'src/app/shared/components/header-info/header-info.component';
import { ImageInputComponent } from 'src/app/shared/components/image-input/image-input.component';
import { ReservationOrderlessComponent } from 'src/app/modules/airtable/pages/reservations-orderless/reservations-orderless.component';
import { GeneralFormSubmissionDialogComponent } from 'src/app/shared/dialogs/general-form-submission-dialog/general-form-submission-dialog.component';
import { CalendarComponent } from 'src/app/shared/components/calendar/calendar.component';
import { DecimalPipe } from '@angular/common';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { CountryISO } from 'ngx-intl-tel-input';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { base64ToFile } from 'src/app/core/helpers/files.helpers';
import { FrontendLogsService } from 'src/app/core/services/frontend-logs.service';
import { version } from 'package.json';
import { getLocaleDateStringFormat } from 'src/app/core/helpers/ui.helpers';
import { AuthService } from 'src/app/core/services/auth.service';

const commonContainerStyles = {
  margin: '41px 39px auto 39px',
};

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
  marginBottom: '0px',
};

const footerConfig: FooterOptions = {
  bgColor: '#2874AD',
  color: '#E9E371',
  enabledStyles: {
    height: '30px',
    fontSize: 'clamp(12px, 4vw, 17px)',
    padding: '0px',
  },
  disabledStyles: {
    height: '30px',
    fontSize: 'clamp(12px, 4vw, 17px)',
    padding: '0px',
  },
};

export function requiredFiles(minLength: number = 1): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    return control.value.length === 1 && control.value[0] === ''
      ? { error: { value: control.value } }
      : null;
  };
}

@Component({
  selector: 'app-heavenly-balloons',
  templateUrl: './heavenly-balloons.component.html',
  styleUrls: ['./heavenly-balloons.component.scss'],
})
export class HeavenlyBalloonsComponent implements OnInit {
  scrollableForm = true;
  merchantId: string = null;
  automationName: string = null;
  fullFormMessage: string = null;
  formMessageInitialHistory: Record<string, any> = {};
  whatsappLink: string = 'https://wa.me/18492068680?text=';
  whatsAppMessageParts: string[][] = [];
  reservation: {
    data: Record<string, any>;
    message: string;
  } = null;
  choosedReservation: boolean = false;
  choosedFlowers: boolean = false;
  defaultImages: (string | ArrayBuffer)[] = [''];
  files: File[] = [];
  calendarId: string = null;
  logo: string =
    'https://storage-rewardcharly.sfo2.digitaloceanspaces.com/merchants-images/heavenlyballoons.webp';
  multistepFormData: any = null;
  loading: boolean = true;
  choosedFloralArrangement = false;
  choosedHeliumBalloons = false;
  registeredEmail: boolean = false;
  registeredPhone: boolean = false;
  existingPhone: string = null;

  reservationOrderlessComponent = {
    afterIndex: 0,
    component: ReservationOrderlessComponent,
    inputs: {
      calendarId: this.calendarId || '62eadec619ae079e9283f355',
      firstLabel: 'FECHA DE ENTREGA (*)',
      secondLabel: 'TANDA',
      timeOfDayMode: true,
      //blockButtons: ['AM'],
      containerStyles: {
        minHeight: 'auto',
      },
      allowSundays: true,
    },
    outputs: [
      {
        name: 'onTimeOfDaySelection',
        callback: (timeOfDay) => {
          if (
            'timeOfDay' in timeOfDay &&
            'dayName' in timeOfDay &&
            timeOfDay.timeOfDay &&
            timeOfDay.dayName
          ) {
            this.formSteps[6].fieldsList[0].fieldControl.control.setValue(
              timeOfDay
            );
          } else {
            this.formSteps[6].fieldsList[0].fieldControl.control.setValue(null);
          }
        },
      },
      {
        name: 'componentAndDataLoaded',
        callback: (loaded) => {
          if (loaded) {
            window.dispatchEvent(new Event('resize'));
          }
        },
      },
    ],
  };

  formSteps: FormStep[] = [
    {
      fieldsList: [
        {
          name: 'email',
          fieldControl: {
            type: 'single',
            control: new FormControl(
              '',
              Validators.compose([
                Validators.required,
                Validators.pattern(
                  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                ),
              ])
            ),
          },
          label: 'Correo electrónico (*)',
          placeholder: 'example@domain',
          inputType: 'email',
          topLabelAction: {
            text: 'Ayudanos a identificarte usando tu correo electrónico',
          },
          topSubLabelAction: {
            text: 'También lo usaremos para informarte sobre el estatus de tu orden',
          },
          styles: {
            labelStyles: {
              ...labelStyles,
              paddingTop: '65px',
            },
            containerStyles: {
              marginTop: '36px',
              paddingLeft: '33px',
              paddingRight: '33px',
              paddingBottom: '12rem',
            },
            fieldStyles: {
              marginTop: '26px',
            },
            topLabelActionStyles: {
              fontFamily: 'RobotoBold',
              fontSize: '24px',
              margin: '0px',
              marginTop: '36px',
              display: 'block',
            },
            topSubLabelActionStyles: {
              fontFamily: 'RobotoRegular',
              color: '#141414',
              fontSize: '16px',
              fontWeight: 'lighter',
              opacity: '0.64',
              margin: '0px',
              display: 'block',
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
            profileImage: this.logo,
            type: 'dialog',
            socials: [
              {
                name: 'instagram',
                url: 'https://www.instagram.com/_heavenlyballoons/?hl=en',
              },
              {
                name: 'phone',
                url: '18492068680',
              },
            ],
            reverseInfoOrder: true,
            customStyles: {
              wrapper: {
                margin: '0px',
                backgroundColor: 'white',
                background:
                  'linear-gradient(180deg, white 50%, rgba(213, 213, 213, 0.25) 100%)',
                padding: '0px 20px',
                paddingTop: '24px',
                paddingBottom: '35.8px',
              },
              leftInnerWrapper: {
                margin: '0px',
              },
              pictureWrapper: {
                alignSelf: 'center',
              },
              infoWrapper: {
                justifyContent: 'center',
                marginLeft: '21px',
              },
            },
          },
          outputs: [],
        },
      ],
      hideHeader: true,
      styles: {
        padding: '0px',
      },
      footerConfig,
      asyncStepProcessingFunction: {
        type: 'promise',
        function: async (params) => {
          try {
            const { email } = params.dataModel.value['1'];
            const whatsappMessagePartsOfThe1stStep = [];

            const user = await this.authService.checkUser(
              this.formSteps[0].fieldsList[0].fieldControl.control.value
            );

            if (user) {
              this.registeredEmail = true;

              this.formSteps[1].fieldsList[0].fieldControl.control.setValue(
                user.name
              );
              this.formSteps[1].fieldsList[1].fieldControl.control.setValue(
                user.lastname
              );

              if (user.phone) {
                this.existingPhone = user.phone;

                this.formSteps[2].fieldsList[0].fieldControl.control.setValue(
                  user.phone
                );
              } else {
                this.existingPhone = null;
              }

              whatsappMessagePartsOfThe1stStep.push(
                `*Nombre completo:*\n${user.name} ${user.lastname}\n\n`
              );

              whatsappMessagePartsOfThe1stStep.push(
                `*Número de teléfono:*\n${user.phone}\n\n`
              );

              if (user.phone) params.scrollToStep(2);
              else params.scrollToStep(1);

              this.formSteps[0].stepButtonValidText = 'CONTINUA CON TU ORDEN';
            } else {
              this.formSteps[1].fieldsList[0].fieldControl.control.setValue('');
              this.formSteps[1].fieldsList[1].fieldControl.control.setValue('');
              this.registeredEmail = false;
            }

            /*
            whatsappMessagePartsOfThe1stStep.push(`*Email:*\n${email}\n\n`);
            */

            this.whatsAppMessageParts.push(whatsappMessagePartsOfThe1stStep);
          } catch (error) {
            this.formSteps[1].fieldsList[0].fieldControl.control.setValue('');
            this.formSteps[1].fieldsList[1].fieldControl.control.setValue('');
            this.registeredEmail = false;
          }

          return { ok: true };
        },
      },
      stepButtonInvalidText: 'ESCRIBE QUIÉN ERES Y COMO TE CONTACTAMOS',
      stepButtonValidText: 'CONTINUA CON TU ORDEN',
    },
    {
      fieldsList: [
        {
          name: 'name',
          fieldControl: {
            type: 'single',
            control: new FormControl(
              '',
              Validators.compose([
                Validators.required,
                Validators.pattern(/[\S]/),
              ])
            ),
          },
          label: 'Nombre (*)',
          topLabelAction: {
            text: 'Sobre ti',
            clickable: false,
          },
          topSubLabelAction: {
            text: 'Ingresa la información de quién realiza el pedido',
            clickable: false,
          },
          placeholder: 'Me llamo..',
          styles: {
            containerStyles: {
              display: 'inline-block',
              width: 'calc(100% / 2)',
              paddingRight: '6px',
              marginTop: '36px',
              // width: '83.70%',
            },
            topLabelActionStyles: {
              fontFamily: 'RobotoBold',
              fontSize: '24px',
            },
            topSubLabelActionStyles: {
              display: 'block',
              fontFamily: 'RobotoRegular',
              color: '#141414',
              fontSize: '16px',
              opacity: '0.64',
              width: '200%',
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
            control: new FormControl(
              '',
              Validators.compose([
                Validators.required,
                Validators.pattern(/[\S]/),
              ])
            ),
          },
          label: 'Apellido: (*)',
          placeholder: 'Mi apellido es..',
          styles: {
            containerStyles: {
              display: 'inline-block',
              width: 'calc(100% / 2)',
              paddingLeft: '6px',
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
          name: 'birthday',
          fieldControl: {
            type: 'single',
            control: new FormControl(''),
          },
          placeholder: getLocaleDateStringFormat(),
          label: 'Fecha de nacimiento',
          inputType: 'date',
          maxDate: `${new Date().getFullYear()}-${(
            '0' +
            (new Date().getMonth() + 1)
          ).slice(-2)}-${('0' + new Date().getDate()).slice(-2)}`,
          styles: {
            containerStyles: {
              width: '100%',
              display: 'none',
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
        {
          name: 'instagramUser',
          fieldControl: {
            type: 'single',
            control: new FormControl(''),
          },
          placeholder: 'Ejemplo: @_heavenlyballoons',
          label: 'Usuario de instagram',
          styles: {
            containerStyles: {
              width: '100%',
              display: 'none',
              padding: '0px 33px',
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
              backgroundImage:
                'url(https://storage-rewardcharly.sfo2.digitaloceanspaces.com/new-assets/instagram.svg)',
              backgroundRepeat: 'no-repeat',
              paddingLeft: '40px',
              paddingBottom: '5px',
              display: 'flex',
              alignItems: 'center',
            },
          },
        },
      ],
      styles: {
        padding: '0px',
        paddingBottom: '14rem',
      },
      footerConfig,
      stepProcessingFunction: (params) => {
        const { name, lastname, birthday, instagramUser } =
          params.dataModel.value['2'];

        const whatsappMessagePartsOfThe1stStep = [];

        whatsappMessagePartsOfThe1stStep.push(
          `*Nombre completo:*\n${name} ${lastname}\n\n`
        );

        if (birthday !== '')
          whatsappMessagePartsOfThe1stStep.push(
            `*Fecha de cumpleaños:*\n${birthday}\n\n`
          );

        if (instagramUser && instagramUser !== '')
          whatsappMessagePartsOfThe1stStep.push(
            `*Usuario de Instagram:*\n${instagramUser}\n\n`
          );

        this.whatsAppMessageParts.push(whatsappMessagePartsOfThe1stStep);

        return { ok: true };
      },
      customScrollToStepBackwards: (params) => {
        this.whatsAppMessageParts.pop();
        params.scrollToStep(0, false);
      },
      stepButtonInvalidText: 'ESCRIBE QUIÉN ERES Y COMO TE CONTACTAMOS',
      stepButtonValidText: 'CONTINUA CON TU ORDEN',
    },
    {
      headerText: '',
      fieldsList: [
        {
          name: 'phoneNumber',
          fieldControl: {
            type: 'single',
            control: new FormControl('', Validators.required),
          },
          label: 'Número de teléfono (*)',
          inputType: 'phone',
          phoneCountryCode: CountryISO.DominicanRepublic,
          styles: {
            labelStyles: {
              ...labelStyles,
              marginBottom: '26px',
            },
          },
        },
      ],
      pageHeader: {
        text: '¿Dónde más notificamos el estatus de tu orden?',
        styles: {
          fontFamily: 'RobotoBold',
          fontSize: '24px',
          margin: '0px',
          marginTop: '36px',
        },
      },
      stepProcessingFunction: (params) => {
        const { phoneNumber } = params.dataModel.value['3'];

        const whatsappMessagePartsOfThe2ndStep = [];

        whatsappMessagePartsOfThe2ndStep.push(
          `*Número de teléfono:*\n${phoneNumber.nationalNumber}\n\n`
        );

        this.whatsAppMessageParts.push(whatsappMessagePartsOfThe2ndStep);

        return { ok: true };
      },
      customScrollToStepBackwards: (params) => {
        this.whatsAppMessageParts.pop();
        params.scrollToStep(1, false);
      },
      footerConfig,
      stepButtonInvalidText: 'ESCRIBE COMO TE CONTACTAMOS',
      stepButtonValidText: 'CONFIRMA TU PAGO',
    },
    {
      headerText: '',
      fieldsList: [
        {
          name: 'whatWouldYouOrder',
          fieldControl: {
            type: 'single',
            control: new FormControl('', Validators.required),
          },
          selectionOptions: [
            'Arreglo de flores',
            'Globos de helio',
            'Bouquet de globo',
            'Decoración de evento',
            'Otros (Art. personalizádos, Boxes, Art. de fiestas)',
          ],
          changeCallbackFunction: (change, params) => {
            const whatsappMessagePartsOfThe3rdStep = [];

            whatsappMessagePartsOfThe3rdStep.push(
              `*¿Qué voy a ordenar?:*\n${change}\n\n`
            );

            if (this.whatsAppMessageParts.length < 3)
              this.whatsAppMessageParts.push(whatsappMessagePartsOfThe3rdStep);

            if (['Globos de helio', 'Arreglo de flores'].includes(change)) {
              if (change.toLowerCase().includes('Globos'.toLowerCase())) {
                this.choosedFloralArrangement = false;
                this.choosedHeliumBalloons = true;
                this.formSteps[4].fieldsList[0].styles.containerStyles.display =
                  'none';
                this.formSteps[4].fieldsList[2].styles.containerStyles.display =
                  'none';
                this.formSteps[4].fieldsList[2].fieldControl.control.setValidators(
                  Validators.compose([])
                );
                this.formSteps[4].fieldsList[1].colorPickerConfiguration.maximumNumberOfSelections = 100;
                this.formSteps[4].fieldsList[2].fieldControl.control.setValue(
                  ''
                );

                this.formSteps[4].fieldsList[1].label = 'Color de globos (*)';
              } else {
                this.choosedFloralArrangement = true;
                this.choosedHeliumBalloons = false;
                this.formSteps[4].fieldsList[0].styles.containerStyles.display =
                  'block';
                this.formSteps[4].fieldsList[2].styles.containerStyles.display =
                  'block';
                this.formSteps[4].fieldsList[2].fieldControl.control.setValidators(
                  Validators.compose([
                    Validators.required,
                    Validators.minLength(1),
                  ])
                );
                this.formSteps[4].fieldsList[1].colorPickerConfiguration.maximumNumberOfSelections = 2;
                this.formSteps[4].fieldsList[2].fieldControl.control.setValue(
                  ''
                );

                this.formSteps[4].fieldsList[1].label =
                  'Color de rosas (*) Puedes seleccionar máximo 2 colores';
              }

              this.formSteps[4].fieldsList[4].label =
                'Describe aquí todos los detalles de tu orden de ' + change;
              this.formSteps[4].fieldsList[5].label =
                '¿Deseas incluir una tarjeta de dedicatoria a tu orden de ' +
                change +
                ' ?';

              this.formSteps[5].fieldsList.forEach((field, index) => {
                if (index !== this.formSteps[5].fieldsList.length - 1)
                  field.fieldControl.control.setValue('');
                else {
                  field.fieldControl.control.setValue(['']);
                  field.fileObjects = [];
                }
              });

              params.scrollToStep(4);
              this.choosedFlowers = true;
            } else {
              this.choosedFloralArrangement = false;
              this.choosedHeliumBalloons = false;
              this.formSteps[4].fieldsList.forEach((field, index) => {
                if ([1, 2].includes(index)) {
                  field.fieldControl.control.setValue([]);
                  field.colorPickerConfiguration.selectedCounter = 0;
                  field.colorPickerConfiguration.options.forEach(
                    (color, index) => {
                      color.selected = false;
                    }
                  );
                } else if (index === 7) {
                  field.fieldControl.control.setValue(['']);
                  field.fileObjects = [];
                } else field.fieldControl.control.setValue('');
              });

              if (
                change !== 'Otros (Art. personalizádos, Boxes, Art. de fiestas)'
              ) {
                this.formSteps[5].fieldsList[0].label =
                  'Describe aquí todos los detalles de tu ' + change + ' (*)';
                this.formSteps[5].fieldsList[1].label =
                  '¿Deseas incluir una tarjeta de dedicatoria a tu ' +
                  change +
                  ' ?';
              } else {
                this.formSteps[5].fieldsList[0].label =
                  'Describe aquí todos los detalles de tu orden (*)';
                this.formSteps[5].fieldsList[1].label =
                  '¿Deseas incluir una tarjeta de dedicatoria a tu orden ?';
              }

              params.scrollToStep(5);
              this.choosedFlowers = false;
            }
          },
          label: '¿Qué vas a ordenar?',
          inputType: 'radio',
          styles: {
            containerStyles: {
              marginTop: '19px',
            },
            fieldStyles: {
              paddingLeft: '0px',
            },
            labelStyles: {
              fontSize: '24px',
              fontFamily: 'RobotoBold',
            },
          },
        },
      ],
      stepProcessingFunction: (params) => {
        return { ok: true };
      },
      customScrollToStepBackwards: (params) => {
        if (this.registeredEmail) {
          this.whatsAppMessageParts.pop();
          params.scrollToStep(0, false);
        } else {
          this.whatsAppMessageParts.pop();
          params.scrollToStep(2, false);
        }
      },
      footerConfig,
      stepButtonInvalidText: 'SELECCIONA UNA OPCIÓN',
      stepButtonValidText: 'CONTINUA CON TU ORDEN',
    },
    {
      headerText: '',
      fieldsList: [
        {
          name: 'howManyRoses',
          inputType: 'number',
          label: 'Cantidad de rosas(Si desconoce la cantidad, dejarlo vacío)',
          fieldControl: {
            type: 'single',
            control: new FormControl(null, Validators.min(0)),
          },
          onlyAllowPositiveNumbers: true,
          placeholder: 'Escribe un número',
          styles: {
            containerStyles: {},
            labelStyles: {
              ...labelStyles,
              paddingBottom: '26px',
            },
          },
        },
        {
          name: 'rosesColor',
          fieldControl: {
            type: 'single',
            control: new FormControl(
              [],
              Validators.compose([Validators.required, Validators.minLength(1)])
            ),
          },
          colorPickerConfiguration: {
            options: [
              {
                color: '#ffeb96',
                label: 'Girasol',
              },
              {
                color: 'red',
                label: 'Roja',
              },
              {
                color: 'white',
                label: 'Blanco',
              },
              {
                color: 'pink',
                label: 'Rosado',
              },
              {
                color: '#ff00ff',
                label: 'Fucsia',
              },
              {
                color: 'yellow',
                label: 'Amarillo',
              },
              {
                color: '#df02f1',
                label: 'Morado claro',
              },
              {
                color: 'skyblue',
                label: 'Azul claro',
              },
              {
                color: 'blue',
                label: 'Azul oscuro',
              },
              {
                color: 'green',
                label: 'Verde',
              },
              {
                color: '#572364',
                label: 'Morado oscuro',
              },
              {
                color: '#b76c77',
                label: 'Rose gold',
              },
              {
                color: '#CFB53B',
                label: 'Dorado',
              },
            ],
            selectedCounter: 0,
            maximumNumberOfSelections: 2,
          },
          label: 'Color de rosas (*), Puedes seleccionar máximo 2 colores',
          inputType: 'color-picker',
          styles: {
            containerStyles: {},
            labelStyles: {
              ...labelStyles,
              paddingBottom: '26px',
            },
          },
        },
        {
          name: 'ribbonColor',
          fieldControl: {
            type: 'single',
            control: new FormControl(
              [],
              Validators.compose([Validators.required, Validators.minLength(1)])
            ),
          },
          colorPickerConfiguration: {
            options: [
              {
                color: '#FFFDD0',
                label: 'Crema',
              },
              {
                color: 'red',
                label: 'Roja',
              },
              {
                color: 'white',
                label: 'Blanco',
              },
              {
                color: 'pink',
                label: 'Rosado',
              },
              {
                color: '#C58FAC',
                label: 'Rosado viejo',
              },
              {
                color: '#FF007F',
                label: 'Rosado brillante',
              },
              {
                color: '#CFB53B',
                label: 'Dorado',
              },
              {
                color: '#ff00ff',
                label: 'Fucsia',
              },
              {
                color: 'skyblue',
                label: 'Azul claro',
              },
              {
                color: 'blue',
                label: 'Azul oscuro',
              },
              {
                color: '#df02f1',
                label: 'Morado claro',
              },
              {
                color: '#572364',
                label: 'Morado oscuro',
              },
              {
                color: '#40E0D0',
                label: 'Turquesa',
              },
              {
                color: '#FF5733',
                label: 'Crema',
              },
              {
                color: 'orange',
                label: 'Naranja',
              },
              {
                color: 'yellow',
                label: 'Amarillo',
              },
            ],
            selectedCounter: 0,
            maximumNumberOfSelections: 1,
          },
          label: 'Color de Lazos (*), Puede seleccionar 1',
          inputType: 'color-picker',
          styles: {
            containerStyles: {},
            labelStyles: {
              ...labelStyles,
              paddingBottom: '26px',
            },
          },
        },
        {
          name: 'balloonMessage',
          fieldControl: {
            type: 'single',
            control: new FormControl(''),
          },
          label: 'Mensaje en el globo',
          placeholder: 'Feliz cumpleaños mami',
          inputType: 'textarea',
          styles: {
            containerStyles: {},
            labelStyles: {
              ...labelStyles,
              paddingBottom: '26px',
            },
            fieldStyles: {
              borderRadius: '10px',
              padding: '23px 26px 23px 16px',
              background: 'white',
              height: '164px',
            },
          },
        },
        {
          name: 'additionalDetails',
          fieldControl: {
            type: 'single',
            control: new FormControl(''),
          },
          label: 'Describe aquí todos los detalles adicionales de tu arreglo',
          placeholder: '2 chocolates Hersheys',
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
              height: '164px',
            },
          },
        },
        {
          name: 'wantToAddADedication',
          fieldControl: {
            type: 'single',
            control: new FormControl(''),
          },
          selectionOptions: ['Si', 'No'],
          changeCallbackFunction: (change, params) => {
            this.formSteps[4].fieldsList[5].fieldControl.control.setValue(
              change,
              {
                emitEvent: false,
              }
            );

            if (change === 'Si') {
              this.formSteps[4].fieldsList[6].styles.containerStyles.opacity =
                '1';
              this.formSteps[4].fieldsList[6].styles.containerStyles.height =
                'auto';

              this.formSteps[4].fieldsList[6].styles.containerStyles.marginLeft =
                '0px';
              this.formSteps[4].fieldsList[6].fieldControl.control.setValidators(
                Validators.compose([
                  Validators.required,
                  Validators.pattern(/[\S]/),
                ])
              );
              this.formSteps[4].fieldsList[6].fieldControl.control.updateValueAndValidity();
            } else {
              this.formSteps[4].fieldsList[6].styles.containerStyles.opacity =
                '0';
              this.formSteps[4].fieldsList[6].styles.containerStyles.height =
                '0px';
              this.formSteps[4].fieldsList[6].styles.containerStyles.marginLeft =
                '1000px';
              this.formSteps[4].fieldsList[6].fieldControl.control.setValue('');
              this.formSteps[4].fieldsList[6].fieldControl.control.setValidators(
                []
              );
              this.formSteps[4].fieldsList[6].fieldControl.control.updateValueAndValidity();
            }
          },
          label: '¿Deseas incluir una tarjeta de dedicatoria a tu arreglo?',
          inputType: 'radio',
          styles: {
            fieldStyles: {
              paddingLeft: '0px',
              fontSize: '17px',
            },
            labelStyles: {
              ...labelStyles,
              fontFamily: 'RobotoMedium',
              marginBottom: '26px',
            },
          },
        },
        {
          name: 'dedicationMessage1',
          fieldControl: {
            type: 'single',
            control: new FormControl(''),
          },
          label: 'Mensaje de dedicatoria (*)',
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
              height: '164px',
            },
            containerStyles: {
              transition: 'opacity 0.2s ease-in, height 0.2s ease-in',
              opacity: '0',
              height: '0px',
              marginLeft: '1000px',
            },
          },
        },
        {
          name: 'referenceImage',
          fieldControl: {
            type: 'single',
            control: new FormControl(
              [''],
              [Validators.required, requiredFiles(1)]
            ),
          },
          label: 'Foto de referencia (*)',
          sublabel:
            'Imagen del arreglo que desea ordenar, nos servirá como referencia para hacer su pedido',
          inputType: 'file3',
          fileObjects: [],
          placeholder: 'sube una imagen',
          styles: {
            labelStyles: {
              ...labelStyles,
              paddingBottom: '26px',
            },
            subLabelStyles: {
              color: '#7B7B7B',
              fontFamily: 'RobotoRegular',
              fontSize: '16px',
              fontWeight: 500,
              padding: '0px',
              margin: '0px',
              marginBottom: '26px',
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
      stepProcessingFunction: (params) => {
        const {
          howManyRoses,
          rosesColor,
          ribbonColor,
          balloonMessage,
          additionalDetails,
          wantToAddADedication,
          dedicationMessage1,
        } = params.dataModel.value['5'];

        const whatsappMessagePartsOfThe4thStep = [];

        if (howManyRoses && howManyRoses !== '' && howManyRoses !== 0) {
          whatsappMessagePartsOfThe4thStep.push(
            `*Cantidad de rosas:*\n${howManyRoses}\n\n`
          );
        }

        if (this.choosedFloralArrangement && rosesColor !== '') {
          whatsappMessagePartsOfThe4thStep.push(
            `*Color de rosas:*\n${rosesColor
              .map((color) => color.label)
              .join(', ')}\n\n`
          );
        }

        if (this.choosedHeliumBalloons && rosesColor !== '') {
          whatsappMessagePartsOfThe4thStep.push(
            `*Color de globos:*\n${rosesColor
              .map((color) => color.label)
              .join(', ')}\n\n`
          );
        }

        if (ribbonColor !== '') {
          whatsappMessagePartsOfThe4thStep.push(
            `*Color de Lazos:*\n${ribbonColor[0].label}\n\n`
          );
        }

        if (balloonMessage !== '') {
          whatsappMessagePartsOfThe4thStep.push(
            `*Mensaje en el globo:*\n${balloonMessage}\n\n`
          );
        }

        if (additionalDetails !== '') {
          whatsappMessagePartsOfThe4thStep.push(
            `*Detalles adicionales del arreglo:*\n${additionalDetails}\n\n`
          );
        }

        /*
        if (wantToAddADedication === 'Si' && dedicationMessage1 !== '') {
          whatsappMessagePartsOfThe4thStep.push(
            `*Dedicatoria:*\n${dedicationMessage1}\n\n`
          );
        }*/

        this.whatsAppMessageParts.push(whatsappMessagePartsOfThe4thStep);

        params.scrollToStep(5);

        return { ok: true };
      },
      customScrollToStepBackwards: (params) => {
        this.formSteps[3].fieldsList[0].fieldControl.control.setValue(null);

        params.scrollToStep(3);

        this.whatsAppMessageParts.pop();
      },
      footerConfig,
      stepButtonInvalidText: 'INGRESA LOS DATOS REQUERIDOS',
      stepButtonValidText: 'CONTINUA CON TU ORDEN',
    },
    {
      headerText: '',
      fieldsList: [
        {
          name: 'orderDetails',
          fieldControl: {
            type: 'single',
            control: new FormControl('', Validators.required),
          },
          label: 'Describe aquí todos los detalles de tu arreglo (*)',
          placeholder: 'Escribe aquí',
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
              height: '164px',
            },
          },
        },
        {
          name: 'wantToAddADedication',
          fieldControl: {
            type: 'single',
            control: new FormControl(''),
          },
          selectionOptions: ['Si', 'No'],
          changeCallbackFunction: (change, params) => {
            if (change === 'Si') {
              this.formSteps[5].fieldsList[2].styles.containerStyles.opacity =
                '1';
              this.formSteps[5].fieldsList[2].styles.containerStyles.height =
                'auto';

              this.formSteps[5].fieldsList[2].styles.containerStyles.marginLeft =
                '0px';
              this.formSteps[5].fieldsList[2].fieldControl.control.setValidators(
                Validators.required
              );
              this.formSteps[5].fieldsList[2].fieldControl.control.updateValueAndValidity();
            } else {
              this.formSteps[5].fieldsList[2].styles.containerStyles.opacity =
                '0';
              this.formSteps[5].fieldsList[2].styles.containerStyles.height =
                '0px';
              this.formSteps[5].fieldsList[2].styles.containerStyles.marginLeft =
                '1000px';
              this.formSteps[5].fieldsList[2].fieldControl.control.setValue('');
              this.formSteps[5].fieldsList[2].fieldControl.control.setValidators(
                []
              );
              this.formSteps[5].fieldsList[2].fieldControl.control.updateValueAndValidity();
            }
          },
          label: '¿Deseas incluir una tarjeta de dedicatoria a tu arreglo?',
          inputType: 'radio',
          styles: {
            fieldStyles: {
              paddingLeft: '0px',
              fontSize: '17px',
            },
            labelStyles: {
              ...labelStyles,
              fontFamily: 'RobotoMedium',
              marginBottom: '26px',
            },
          },
        },
        {
          name: 'dedicationMessage2',
          fieldControl: {
            type: 'single',
            control: new FormControl(''),
          },
          label: 'Mensaje de dedicatoria (*)',
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
              height: '164px',
            },
            containerStyles: {
              transition: 'opacity 0.2s ease-in, height 0.2s ease-in',
              opacity: '0',
              height: '0px',
              marginLeft: '1000px',
            },
          },
        },
        {
          name: 'referenceImage2',
          fieldControl: {
            type: 'single',
            control: new FormControl(
              [''],
              [Validators.required, requiredFiles(1)]
            ),
          },
          label: 'Foto de referencia (*)',
          sublabel:
            'Imagen del arreglo que desea ordenar, nos servirá como referencia para hacer su pedido',
          inputType: 'file3',
          fileObjects: [],
          placeholder: 'sube una imagen',
          styles: {
            labelStyles: {
              ...labelStyles,
            },
            subLabelStyles: {
              color: '#7B7B7B',
              fontFamily: 'RobotoRegular',
              fontSize: '16px',
              fontWeight: 500,
              padding: '0px',
              margin: '0px',
              marginBottom: '26px',
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
      stepProcessingFunction: (params) => {
        const { orderDetails, wantToAddADedication, dedicationMessage2 } =
          params.dataModel.value['6'];

        const whatsappMessagePartsOfThe5thStep = [];

        if (orderDetails !== '') {
          whatsappMessagePartsOfThe5thStep.push(
            `*Detalles del arreglo:*\n${orderDetails}\n\n`
          );
        }

        if (wantToAddADedication === 'Si' && dedicationMessage2 !== '') {
          whatsappMessagePartsOfThe5thStep.push(
            `*Dedicatoria:*\n${dedicationMessage2}\n\n`
          );
        }

        this.whatsAppMessageParts.push(whatsappMessagePartsOfThe5thStep);

        return { ok: true };
      },
      customScrollToStepBackwards: (params) => {
        this.formSteps[3].fieldsList[0].fieldControl.control.setValue(null);

        this.formSteps[5].fieldsList.forEach((field, index) => {
          if (index !== this.formSteps[5].fieldsList.length - 1)
            field.fieldControl.control.setValue('');
          else {
            field.fieldControl.control.setValue(['']);
            field.fileObjects = [];
          }
        });

        params.scrollToStep(3);

        this.whatsAppMessageParts.pop();
      },
      footerConfig,
      stepButtonInvalidText: 'INGRESA LOS DATOS REQUERIDOS',
      stepButtonValidText: 'CONTINUA CON TU ORDEN',
    },
    {
      fieldsList: [
        {
          fieldControl: {
            type: 'single',
            control: new FormControl('', Validators.required),
          },
          name: 'reservation',
          label: '',
          styles: {
            containerStyles: {
              display: 'none',
            },
          },
        },
      ],
      embeddedComponents: [this.reservationOrderlessComponent],
      stepProcessingFunction: (params) => {
        const {
          reservation: timeOfDay
        } = params.dataModel.value['7'];

        const whatsappMessagePartsOfThe6thStep = [];

        if (timeOfDay) {
          whatsappMessagePartsOfThe6thStep.push(
            `*Entrega:*\n${timeOfDay.dayName}, ${timeOfDay.dayNumber} de ${timeOfDay.monthName}\n\n`
          );
        }

        this.whatsAppMessageParts.push(whatsappMessagePartsOfThe6thStep);

        return { ok: true };
      },
      customScrollToStepBackwards: (params) => {
        this.whatsAppMessageParts.pop();

        if (this.choosedFlowers) {
          params.scrollToStep(4);
        } else {
          params.scrollToStep(5);
        }
      },
      pageHeader: {
        text: '¿Cuándo entregamos tu pedido?',
        styles: {
          fontFamily: 'RobotoBold',
          fontSize: '24px',
          margin: '0px',
          marginTop: '36px',
        },
      },
      footerConfig,
      stepButtonInvalidText: 'INGRESA LOS DATOS',
      stepButtonValidText: 'CONTINUA CON TU ORDEN',
    },
    {
      fieldsList: [
        {
          name: 'deliveryMethod',
          label: 'Método de entrega (*)',
          fieldControl: {
            type: 'single',
            control: new FormControl('', Validators.required),
          },
          selectionOptions: [
            'Pickup',
            'Delivery Distrito Nacional',
            'Delivery Santo Domingo Este',
            'Delivery Santo Domingo Oeste',
            'Delivery Santo Domingo Norte',
            'Fuera de Santo Domingo',
          ],
          changeCallbackFunction: (change, params) => {
            const { deliveryMethod: pastValue } = params.dataModel.value['8'];

            if (
              change !== 'Pickup' &&
              (pastValue === '' || pastValue === 'Pickup')
            ) {
              this.formSteps[7].fieldsList.forEach((field, index) => {
                //console.log(field.name, field.label)
                if (
                  !(
                    'containerStyles' in
                    this.formSteps[7].fieldsList[index].styles
                  )
                ) {
                  this.formSteps[7].fieldsList[index].styles.containerStyles =
                    {};
                }

                if (index === 0) {
                  this.formSteps[7].fieldsList[
                    index
                  ].styles.containerStyles.paddingBottom = '0px';
                }

                if (index > 0) {
                  this.formSteps[7].fieldsList[
                    index
                  ].styles.containerStyles.opacity = '1';
                  this.formSteps[7].fieldsList[
                    index
                  ].styles.containerStyles.height = 'auto';
                }

                if (index === this.formSteps[7].fieldsList.length - 1) {
                  this.formSteps[7].fieldsList[
                    index
                  ].styles.containerStyles.paddingBottom = '20rem';
                }

                this.formSteps[7].fieldsList[1].fieldControl.control.setValidators(
                  Validators.required
                );
                this.formSteps[7].fieldsList[2].fieldControl.control.setValidators(
                  Validators.compose([
                    Validators.required,
                    Validators.pattern(/[\S]/),
                  ])
                );

                this.formSteps[7].fieldsList[5].fieldControl.control.setValidators(
                  Validators.compose([
                    Validators.required,
                    Validators.pattern(/[\S]/),
                  ])
                );

                this.formSteps[7].fieldsList[3].fieldControl.control.setValidators(
                  Validators.compose([Validators.required])
                );

                setTimeout(() => {
                  this.formSteps[7].fieldsList[1].fieldControl.control.updateValueAndValidity();
                  this.formSteps[7].fieldsList[2].fieldControl.control.updateValueAndValidity();
                  this.formSteps[7].fieldsList[3].fieldControl.control.updateValueAndValidity();
                  this.formSteps[7].fieldsList[5].fieldControl.control.updateValueAndValidity();
                }, 500);
              });
            } else if (
              change === 'Pickup' &&
              (pastValue === '' || pastValue !== 'Pickup')
            ) {
              this.formSteps[7].fieldsList.forEach((field, index) => {
                if (
                  !(
                    'containerStyles' in
                    this.formSteps[7].fieldsList[index].styles
                  )
                ) {
                  this.formSteps[7].fieldsList[index].styles.containerStyles =
                    {};
                }

                if (index === 0) {
                  this.formSteps[7].fieldsList[
                    index
                  ].styles.containerStyles.paddingBottom = '60px';
                }

                if (index > 0) {
                  this.formSteps[7].fieldsList[
                    index
                  ].styles.containerStyles.height = '0px';
                  this.formSteps[7].fieldsList[
                    index
                  ].styles.containerStyles.opacity = '0';
                  this.formSteps[7].fieldsList[
                    index
                  ].fieldControl.control.setValue('', {
                    emitEvent: false,
                  });
                }

                if (index === this.formSteps[7].fieldsList.length - 1) {
                  this.formSteps[7].fieldsList[
                    index
                  ].styles.containerStyles.paddingBottom = '0rem';
                }

                this.formSteps[7].fieldsList[1].fieldControl.control.setValue(
                  '',
                  {
                    emitEvent: false,
                  }
                );
                this.formSteps[7].fieldsList[1].fieldControl.control.setValidators(
                  []
                );
                this.formSteps[7].fieldsList[2].fieldControl.control.setValue(
                  '',
                  {
                    emitEvent: false,
                  }
                );
                this.formSteps[7].fieldsList[2].fieldControl.control.setValidators(
                  []
                );
                this.formSteps[7].fieldsList[5].fieldControl.control.setValue(
                  '',
                  {
                    emitEvent: false,
                  }
                );
                this.formSteps[7].fieldsList[5].fieldControl.control.setValidators(
                  []
                );
                this.formSteps[7].fieldsList[3].fieldControl.control.setValidators(
                  []
                );

                setTimeout(() => {
                  this.formSteps[7].fieldsList[1].fieldControl.control.updateValueAndValidity();
                  this.formSteps[7].fieldsList[2].fieldControl.control.updateValueAndValidity();
                  this.formSteps[7].fieldsList[3].fieldControl.control.updateValueAndValidity();
                  this.formSteps[7].fieldsList[5].fieldControl.control.updateValueAndValidity();
                }, 500);
              });
            }
          },
          inputType: 'radio',
          styles: {
            fieldStyles: {
              paddingLeft: '0px',
              fontSize: '17px',
            },
            labelStyles: {
              ...labelStyles,
              fontFamily: 'RobotoMedium',
              marginBottom: '26px',
            },
            containerStyles: {
              paddingBottom: '60px',
            },
          },
        },
        {
          name: 'typeOfBuilding',
          label: 'Tipo de Edificación (*)',
          fieldControl: {
            type: 'single',
            control: new FormControl(''),
          },
          selectionOptions: [
            'Casa',
            'Edificio Comercial',
            'Edificio Residencial',
            'Otro',
          ],
          inputType: 'radio',
          styles: {
            fieldStyles: {
              paddingLeft: '0px',
              fontSize: '17px',
            },
            labelStyles: {
              ...labelStyles,
              fontFamily: 'RobotoMedium',
              marginBottom: '26px',
            },
            containerStyles: {
              opacity: '0',
              height: '0px',
            },
          },
        },
        {
          name: 'deliveryAddress',
          fieldControl: {
            type: 'single',
            control: new FormControl(''),
          },
          label: 'Dirección escrita y referencia (*)',
          placeholder:
            'calle... #... residencial... edif... apto... cerca de...',
          inputType: 'textarea',
          styles: {
            labelStyles: {
              ...labelStyles,
              paddingBottom: '26px',
              paddingTop: '51px',
            },
            fieldStyles: {
              borderRadius: '10px',
              padding: '23px 26px 23px 16px',
              background: 'white',
              height: '164px',
            },
            containerStyles: {
              opacity: '0',
              height: '0px',
            },
          },
        },
        {
          name: 'location',
          fieldControl: {
            type: 'single',
            control: new FormControl('', Validators.required),
          },
          label: 'Link de la Locación/Ubicación GPS (*)',
          sublabel: 'Esto ayudara al mensajero a hacer la entrega más precisa',
          placeholder: 'Escribe aquí...',
          styles: {
            labelStyles: {
              ...labelStyles,
              paddingTop: '65px',
              paddingBottom: '0px',
            },
            subLabelStyles: {
              display: 'block',
              fontFamily: 'RobotoRegular',
              color: '#141414',
              fontSize: '16px',
              opacity: '0.64',
              fontWeight: 'normal',
              paddingBottom: '26px',
            },
            containerStyles: {
              opacity: '0',
              height: '0px',
              paddingBottom: '0rem',
            },
          },
        },
        /* FUNCIONALIDAD GPS CON GOOGLE MAPS
        {
          name: 'location',
          fieldControl: {
            type: 'single',
            control: new FormControl(''),
          },
          label: 'Locación',
          inputType: 'location-map',
          placeholder:
            'Esto ayudara al mensajero a hacer la entrega más precisa',
          clickedOnLocationQuestionButton: false,
          styles: {
            labelStyles: {
              ...labelStyles,
              paddingBottom: '26px',
            },
            containerStyles: {
              transition: 'opacity 0.2s ease-in, height 0.2s ease-in',
              opacity: '0',
              height: '0px',
            },
          },
        },*/
        {
          name: 'sender',
          fieldControl: {
            type: 'single',
            control: new FormControl(''),
          },
          label:
            'Nombre de quien envía(Si lo dejas vacio, diremos que tu pedido, arreglo o regalo fue realizado por alguien "Anónimo")',
          placeholder: 'Anónimo',
          styles: {
            labelStyles: {
              ...labelStyles,
              paddingBottom: '26px',
            },
            containerStyles: {
              opacity: '0',
              height: '0px',
            },
          },
        },
        {
          name: 'receiver',
          fieldControl: {
            type: 'single',
            control: new FormControl(''),
          },
          label: 'Nombre de quien recibe (*)',
          placeholder: 'Escribe aquí',
          styles: {
            labelStyles: {
              ...labelStyles,
              paddingBottom: '26px',
            },
            containerStyles: {
              opacity: '0',
              height: '0px',
            },
          },
        },
        {
          name: 'receiverPhoneNumber',
          fieldControl: {
            type: 'single',
            control: new FormControl(''),
          },
          label: 'Teléfono de quien recibe',
          inputType: 'phone',
          phoneCountryCode: CountryISO.DominicanRepublic,
          styles: {
            labelStyles: {
              ...labelStyles,
              paddingBottom: '30px',
            },
            containerStyles: {
              opacity: '0',
              height: '0px',
              paddingBottom: '0rem',
            },
          },
        },
      ],
      stepProcessingFunction: (params) => {
        const {
          deliveryMethod,
          typeOfBuilding,
          deliveryAddress,
          location,
          sender,
          receiver,
          receiverPhoneNumber,
        } = params.dataModel.value['8'];

        const whatsappMessagePartsOfThe6thStep = [];

        if (deliveryMethod && deliveryMethod !== '') {
          whatsappMessagePartsOfThe6thStep.push(
            `*Método de entrega:*\n${deliveryMethod}\n\n`
          );
        }

        if (typeOfBuilding && typeOfBuilding !== '') {
          whatsappMessagePartsOfThe6thStep.push(
            `*Tipo de edificación:*\n${typeOfBuilding}\n\n`
          );
        }

        if (deliveryAddress && deliveryAddress !== '') {
          whatsappMessagePartsOfThe6thStep.push(
            `*Dirección de entrega:*\n${deliveryAddress}\n\n`
          );
        }

        if (location && location !== '') {
          whatsappMessagePartsOfThe6thStep.push(
            `*Locación/Ubicación exacta:*\n${location}\n\n`
          );
        }

        if (sender && sender !== '') {
          whatsappMessagePartsOfThe6thStep.push(
            `*Nombre del Remitente:*\n${
              sender && sender.length ? sender : 'Anónimo'
            }\n\n`
          );
        }

        if (receiver && receiver !== '') {
          whatsappMessagePartsOfThe6thStep.push(
            `*Nombre del Destinatario:*\n${receiver}\n\n`
          );
        }

        if (receiverPhoneNumber && receiverPhoneNumber !== '') {
          whatsappMessagePartsOfThe6thStep.push(
            `*Teléfono del destinatario:*\n${receiverPhoneNumber.e164Number}\n\n`
          );
        }

        this.whatsAppMessageParts.push(whatsappMessagePartsOfThe6thStep);

        return { ok: true };
      },
      pageHeader: {
        text: '¿Dónde entregamos tu pedido?',
        styles: {
          fontFamily: 'RobotoBold',
          fontSize: '24px',
          margin: '0px',
          marginTop: '36px',
        },
      },
      customScrollToStepBackwards: (params) => {
        this.whatsAppMessageParts.pop();
        
        params.scrollToStep(6);
      },
      footerConfig,
      stepButtonInvalidText: 'INGRESA LOS DATOS',
      stepButtonValidText: 'CONTINUA CON TU ORDEN'
    },
    //por aqui voy
    {
      headerText: '',
      fieldsList: [
        {
          name: 'billType',
          label: 'Tipo de Factura (*)',
          fieldControl: {
            type: 'single',
            control: new FormControl('', Validators.required),
          },
          selectionOptions: [
            'Sin Comprobante',
            'Comprobante Fiscal (B01)',
            'Consumo (B02)',
          ],
          changeCallbackFunction: (change, params) => {
            this.formSteps[8].fieldsList[0].fieldControl.control.setValue(
              change,
              {
                emitEvent: false,
              }
            );

            if (change !== 'Comprobante Fiscal (B01)') {
              this.formSteps[8].fieldsList[1].fieldControl.control.setValue('');
              this.formSteps[8].fieldsList[1].styles.containerStyles.opacity =
                '0';
              this.formSteps[8].fieldsList[1].styles.containerStyles.height =
                '0px';
              this.formSteps[8].fieldsList[1].fieldControl.control.setValidators(
                []
              );
              this.formSteps[8].fieldsList[1].fieldControl.control.updateValueAndValidity();
            } else {
              this.formSteps[8].fieldsList[1].styles.containerStyles.opacity =
                '1';
              this.formSteps[8].fieldsList[1].styles.containerStyles.height =
                'auto';
              this.formSteps[8].fieldsList[1].fieldControl.control.setValidators(
                Validators.compose([
                  Validators.required,
                  Validators.pattern(/[\S]/),
                ])
              );
              this.formSteps[8].fieldsList[1].fieldControl.control.updateValueAndValidity();
            }
          },
          inputType: 'radio',
          styles: {
            fieldStyles: {
              paddingLeft: '0px',
              fontSize: '17px',
            },
            labelStyles: {
              ...labelStyles,
              fontFamily: 'RobotoMedium',
              marginBottom: '26px',
            },
          },
        },
        {
          name: 'socialId',
          fieldControl: {
            type: 'single',
            control: new FormControl(''),
          },
          label: 'RNC o Cédula (*)',
          placeholder: '???-???????-?',
          styles: {
            labelStyles: {
              ...labelStyles,
            },
            fieldStyles: {
              marginTop: '26px',
            },
            containerStyles: {
              transition: 'opacity 0.2s ease-in, height 0.2s ease-in',
              opacity: '0',
              height: '0px',
            },
          },
        },
        {
          name: 'paymentMethod',
          fieldControl: {
            type: 'single',
            control: new FormControl(''),
          },
          selectionOptions: [
            'Cuenta Popular',
            'Cuenta BHD',
            'Cuenta Banreservas',
            'Yoyo App',
            'Efectivo',
            'Otro',
          ],
          changeCallbackFunction: (change, params) => {
            this.formSteps[8].fieldsList[3].styles.containerStyles = {};

            if (change !== 'Efectivo') {
              this.formSteps[8].fieldsList[3].styles.containerStyles.opacity =
                '1';
              this.formSteps[8].fieldsList[3].styles.containerStyles.height =
                'auto';

              this.formSteps[8].fieldsList[3].styles.containerStyles.marginLeft =
                '0px';

              const detectIfFirstIndexIsAnImageAndIsNotAnEmptyString = (
                arrayOfValues: Array<string>
              ) => {
                return (control: AbstractControl): ValidationErrors | null => {
                  const isInvalid =
                    (arrayOfValues.length > 0 && arrayOfValues[0] === '') ||
                    arrayOfValues.length === 0
                      ? true
                      : false;
                  return isInvalid
                    ? { proofOfPayment: { value: control.value } }
                    : null;
                };
              };

              this.formSteps[8].fieldsList[3].fieldControl.control.setValidators(
                Validators.compose([
                  Validators.required,
                  detectIfFirstIndexIsAnImageAndIsNotAnEmptyString(
                    this.formSteps[8].fieldsList[3].fieldControl.control.value
                  ),
                ])
              );
            } else {
              this.formSteps[8].fieldsList[3].styles.containerStyles.opacity =
                '0';
              this.formSteps[8].fieldsList[3].styles.containerStyles.height =
                '0px';
              this.formSteps[8].fieldsList[3].fieldControl.control.setValue([
                '',
              ]);
              this.formSteps[8].fieldsList[3].fieldControl.control.setValidators(
                []
              );
            }

            this.formSteps[8].fieldsList[3].fieldControl.control.updateValueAndValidity();
          },
          label: 'Vía o Cuenta a la que realizaste tu pago',
          inputType: 'radio',
          styles: {
            fieldStyles: {
              paddingLeft: '0px',
              fontSize: '17px',
            },
            labelStyles: {
              ...labelStyles,
              fontFamily: 'RobotoMedium',
              marginBottom: '26px',
            },
          },
        },
        {
          name: 'proofOfPayment',
          fieldControl: {
            type: 'single',
            control: new FormControl(
              [''],
              [Validators.required, requiredFiles(1)]
            ),
          },
          label: 'Adjuntar comprobante (*)',
          inputType: 'file3',
          fileObjects: [],
          placeholder: 'sube una imagen',
          styles: {
            labelStyles: {
              ...labelStyles,
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
              paddingTop: '0px',
              paddingBottom: '0px',
              transition: 'opacity 0.2s ease-in, height 0.2s ease-in',
              opacity: '0',
              height: '0px',
            },
            innerContainerStyles: {
              width: '157px',
              textAlign: 'center',
            },
          },
        },
        {
          name: 'totalAmount',
          customCursorIndex:
            this.decimalPipe.transform(Number(0), '1.2').length + 1,
          formattedValue: '$' + this.decimalPipe.transform(Number(0), '1.2'),
          lastInputWasADot: false,
          onlyAllowPositiveNumbers: true,
          fieldControl: {
            type: 'single',
            control: new FormControl(0),
          },
          shouldUseReusableCurrencyComponent: true,
          shouldFormatNumber: true,
          label: 'Total de la orden (*)',
          inputType: 'number',
          placeholder: 'El total es de $..',
          styles: {
            labelStyles: {
              ...labelStyles,
              paddingBottom: '26px',
            },
            containerStyles: {
              position: 'relative',
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
            bottomLabelStyles: {
              fontFamily: 'RobotoLight',
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
          customCursorIndex:
            this.decimalPipe.transform(Number(0), '1.2').length + 1,
          formattedValue: '$' + this.decimalPipe.transform(Number(0), '1.2'),
          shouldUseReusableCurrencyComponent: true,
          lastInputWasADot: false,
          onlyAllowPositiveNumbers: true,
          fieldControl: {
            type: 'single',
            control: new FormControl(0, [
              Validators.required,
              Validators.min(0.01),
            ]),
          },
          shouldFormatNumber: true,
          label: 'Total pagado (*)',
          inputType: 'number',
          placeholder: 'La compra es de $..',
          styles: {
            labelStyles: {
              ...labelStyles,
              paddingBottom: '26px',
            },
            containerStyles: {
              position: 'relative',
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
          name: 'orderMedium',
          fieldControl: {
            type: 'single',
            control: new FormControl(''),
          },
          selectionOptions: [
            'Whatsapp',
            'Personal',
            'Website',
            'E-Mail',
            'Instagram',
          ],
          label: 'Vía del pedido',
          inputType: 'radio',
          styles: {
            fieldStyles: {
              paddingLeft: '0px',
              fontSize: '17px',
            },
            labelStyles: {
              ...labelStyles,
              fontFamily: 'RobotoMedium',
              marginBottom: '26px',
            },
          },
        },
        {
          name: 'howDidYouFindUs',
          fieldControl: {
            type: 'single',
            control: new FormControl(''),
          },
          label: '¿Cómo nos conociste?',
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
              height: '164px',
            },
            containerStyles: {
              paddingBottom: '120px',
            },
          },
        },
      ],
      pageHeader: {
        text: '¿Como deseas realizar el pago?',
        styles: {
          fontFamily: 'RobotoBold',
          fontSize: '24px',
          margin: '0px',
          marginTop: '36px',
        },
      },
      asyncStepProcessingFunction: {
        type: 'promise',
        function: async (params) => {
          try {
            const { email } = params.dataModel.value['1'];

            const { instagramUser, name, lastname, birthday } =
              params.dataModel.value['2'];
            const { phoneNumber } = params.dataModel.value['3'];
            const { whatWouldYouOrder } = params.dataModel.value['4'];
            const {
              additionalDetails,
              balloonMessage,
              dedicationMessage1: dedicationMessage4thStep,
              howManyRoses,
              ribbonColor,
              rosesColor,
              wantToAddADedication: wantToAddADedication4thStep,
            } = params.dataModel.value['5'];
            const {
              dedicationMessage2: dedicationMessage5thStep,
              orderDetails,
              wantToAddADedication: wantToAddADedication5thStep,
            } = params.dataModel.value['6'];
            const {
              reservation
            } = params.dataModel.value['7'];
            const {
              deliveryAddress,
              deliveryMethod,
              location,
              receiver,
              receiverPhoneNumber,
              sender,
              typeOfBuilding,
            } = params.dataModel.value['8'];
            const {
              billType,
              howDidYouFindUs,
              orderMedium,
              paymentMethod,
              proofOfPayment,
              socialId,
            } = params.dataModel.value['9'];
            let totalAmount =
              '$' +
              this.formSteps[8].fieldsList[4].fieldControl.control.value.toLocaleString();
            let firstPayment =
              '$' +
              this.formSteps[8].fieldsList[5].fieldControl.control.value.toLocaleString();

            const whatsappMessagePartsOfThe7thStep = [];

            if (billType && billType !== '') {
              /*
              whatsappMessagePartsOfThe7thStep.push(
                `*Tipo de Factura:*\n${billType}\n\n`
              );*/

              if (billType === 'Comprobante Fiscal (B01)' && socialId !== '') {
                whatsappMessagePartsOfThe7thStep.push(
                  `*RNC o Cédula :*\n${socialId}\n\n`
                );
              }
            }

            /*
            if (paymentMethod && paymentMethod !== '') {
              whatsappMessagePartsOfThe7thStep.push(
                `*Vía de pago:*\n${paymentMethod}\n\n`
              );
            }
            */

            /*
            if (totalAmount) {
              whatsappMessagePartsOfThe7thStep.push(
                `*Total de la orden:*\n${totalAmount}\n\n`
              );
            }

            if (firstPayment) {
              whatsappMessagePartsOfThe7thStep.push(
                `*Total pagado:*\n${firstPayment}\n\n`
              );
            }
            */

            /*
            if (orderMedium && orderMedium !== '') {
              whatsappMessagePartsOfThe7thStep.push(
                `*Vía del pedido:*\n${orderMedium}\n\n`
              );
            }
            */

            /*
            if (howDidYouFindUs && howDidYouFindUs !== '') {
              whatsappMessagePartsOfThe7thStep.push(
                `*¿Cómo nos conociste?:*\n${howDidYouFindUs}\n\n`
              );
            }*/

            const convertedTotalAmount = Number(
              totalAmount
                .split('')
                .filter((char) => char !== ',' && char !== '$')
                .join('')
            );

            const convertedFirstPayment = Number(
              firstPayment
                .split('')
                .filter((char) => char !== ',' && char !== '$')
                .join('')
            );

            let birthYear, birthMonth, birthDay;
            let birthDayISOString = new Date().toISOString();

            if (birthDay) {
              const birthDayArray = birthday.split('-');
              (birthYear = birthDayArray[0]),
                (birthMonth = birthDayArray[1]),
                (birthDay = birthDayArray[2]);
              birthYear = Number(birthYear);
              birthMonth = Number(birthMonth);
              birthDay = Number(birthDay);

              birthDayISOString = new Date(
                birthYear,
                birthMonth - 1,
                birthDay
              ).toISOString();
            }

            let data: any = {
              instagramUser,
              name,
              lastname,
              socialId,
              email,
              phoneNumber:
                this.existingPhone && this.existingPhone.length
                  ? {
                      ...phoneNumber,
                      e164Number: '+' + this.existingPhone,
                    }
                  : phoneNumber,
              receiverPhoneNumber,
              articleDescription: orderDetails,
              sender: sender !== '' ? sender : 'Anónimo',
              receiver,
              dedicationMessage: this.choosedFlowers
                ? dedicationMessage4thStep
                : dedicationMessage5thStep,
              wantToAddADedication: this.choosedFlowers
                ? wantToAddADedication4thStep
                : wantToAddADedication5thStep,
              orderMedium,
              paymentMethod,
              timeOfDay: reservation?.timeOfDay || null,
              addressReference: deliveryAddress,
              deliveryAddress,
              deliveryMethod,
              location,
              typeOfBuilding,
              billType,
              totalAmount: convertedTotalAmount,
              firstPayment: convertedFirstPayment,
              howDidYouFindUs,
              birthday: birthDayISOString,
              whatWouldYouOrder,
              additionalDetails,
              balloonMessage,
              howManyRoses,
              ribbonColor,
              rosesColor: [],
              balloonsColor: [],
            };

            if (this.choosedFloralArrangement) {
              data.rosesColor = rosesColor;
            } else if (this.choosedHeliumBalloons) {
              data.balloonsColor = rosesColor; //rosesColor its for both balloons and flowers
            }

            const arrayOfReferenceImageFiles = [];
            const arrayOfProofOfPaymentFiles = [];

            if (
              this.formSteps[4].fieldsList[7].fieldControl.control.value
                .length > 0 &&
              this.formSteps[4].fieldsList[7].fieldControl.control.value[0] !==
                '' &&
              ['Globos de helio', 'Arreglo de flores'].includes(
                whatWouldYouOrder
              )
            ) {
              this.formSteps[4].fieldsList[7].fieldControl.control.value.forEach(
                (base64string) => {
                  if (base64string && base64string !== '')
                    arrayOfReferenceImageFiles.push(base64ToFile(base64string));
                }
              );
            }

            if (
              this.formSteps[5].fieldsList[3].fieldControl.control.value
                .length > 0 &&
              this.formSteps[5].fieldsList[3].fieldControl.control.value[0] !==
                '' &&
              !['Globos de helio', 'Arreglo de flores'].includes(
                whatWouldYouOrder
              )
            ) {
              this.formSteps[5].fieldsList[3].fieldControl.control.value.forEach(
                (base64string) => {
                  if (base64string && base64string !== '')
                    arrayOfReferenceImageFiles.push(base64ToFile(base64string));
                }
              );
            }

            if (
              this.formSteps[8].fieldsList[3].fieldControl.control.value
                .length > 0 &&
              this.formSteps[8].fieldsList[3].fieldControl.control.value[0] !==
                ''
            ) {
              this.formSteps[8].fieldsList[3].fieldControl.control.value.forEach(
                (base64string) => {
                  if (base64string && base64string !== '')
                    arrayOfProofOfPaymentFiles.push(base64ToFile(base64string));
                }
              );
            }

            if (this.registeredEmail) {
              // estaba
              await this.submitData(
                data,
                arrayOfReferenceImageFiles,
                arrayOfProofOfPaymentFiles,
                reservation,
                whatsappMessagePartsOfThe7thStep
              );
            } else {
              const phone =
                this.existingPhone && this.existingPhone.length
                  ? this.existingPhone
                  : phoneNumber.e164Number.split('+')[1];

              try {
                const phoneUser = await this.authService.checkUser(phone);

                if (phoneUser) this.registeredPhone = true;
                else this.registeredPhone = false;
              } catch (error) {
                this.registeredPhone = false;
              }

              const input: any = {
                email,
                name,
                lastname,
              };

              if (!this.registeredPhone) input.phone = phone;

              const registeredEmail = await this.authService.signup(
                input,
                'none',
                null,
                false
              );

              if (registeredEmail) {
                await this.submitData(
                  data,
                  arrayOfReferenceImageFiles,
                  arrayOfProofOfPaymentFiles,
                  reservation,
                  whatsappMessagePartsOfThe7thStep
                );
              }
            }

            return { ok: true };
          } catch (error) {
            const formData = this.formSteps.map((formStep, index) => {
              const stepData = {};

              formStep.fieldsList.map((field, index) => {
                stepData[field.name] = field.fieldControl.control.value;
              });

              return stepData;
            });

            console.log('El error ', error.message);

            this.dialog.open(GeneralFormSubmissionDialogComponent, {
              type: 'centralized-fullscreen',
              props: {
                icon: 'sadFace.svg',
                showCloseButton: true,
                message: window.navigator.onLine
                  ? 'Ocurrió un problema: ' + error
                  : 'Se perdió la conexion a internet',
              },
              customClass: 'app-dialog',
              flags: ['no-header'],
            });

            this.frontendLogsService.createFrontendLog({
              route: window.location.href,
              log: JSON.stringify({
                error: error.message,
                appVersion: version,
              }),
              dataJSON: JSON.stringify(formData),
            });

            return { ok: false };
          }
        },
      },
      customScrollToStepBackwards: (params) => {
        this.whatsAppMessageParts.pop();

        params.scrollToStep(7);
      },
      footerConfig,
      stepButtonInvalidText: 'INGRESA LOS DATOS',
      stepButtonValidText: 'CONTINUA CON TU ORDEN',
    },
  ];

  constructor(
    private route: ActivatedRoute,
    private decimalPipe: DecimalPipe,
    private dialog: DialogService,
    private merchantsService: MerchantsService,
    private frontendLogsService: FrontendLogsService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const { merchantId, automationName, calendarId } = params;

      this.merchantId = merchantId;
      this.automationName = automationName;
      this.calendarId = calendarId;

      this.formSteps[5].embeddedComponents[0].inputs.calendarId =
        this.calendarId;
      this.formSteps[5].embeddedComponents[0].shouldRerender = true;
    });

    setTimeout(() => {
      this.loading = false;
    }, 1000);
  }

  async submitData(
    data: any,
    arrayOfReferenceImageFiles: any[],
    arrayOfProofOfPaymentFiles: any[],
    reservation: any,
    whatsappMessagePartsOfThe7thStep: string[]
  ) {
    let uploadFilesResultReferenceImages = null;

    if (arrayOfReferenceImageFiles.length > 0)
      uploadFilesResultReferenceImages =
        await this.merchantsService.uploadAirtableAttachments(
          arrayOfReferenceImageFiles
        );

    let uploadFilesResultProofOfPayment = null;

    if (arrayOfProofOfPaymentFiles.length > 0)
      uploadFilesResultProofOfPayment =
        await this.merchantsService.uploadAirtableAttachments(
          arrayOfProofOfPaymentFiles
        );

    
    if (uploadFilesResultReferenceImages) {
      const fileRoutes = uploadFilesResultReferenceImages;
      /*
      whatsappMessagePartsOfThe7thStep.push(`*Foto de Referencia:*\n`);
      */

      data.referenceImage = fileRoutes;

      /*
      fileRoutes.forEach((route, index) => {
        whatsappMessagePartsOfThe7thStep.push(`${route}\n`);
      });
      */
    }

    if (uploadFilesResultProofOfPayment) {
      const fileRoutes = uploadFilesResultProofOfPayment;
      /*
      whatsappMessagePartsOfThe7thStep.push(`*Comprobante de pago:*\n`);
      */

      data.proofOfPayment = fileRoutes;

      /*
      fileRoutes.forEach((route, index) => {
        whatsappMessagePartsOfThe7thStep.push(`${route}\n`);
      });*/
    }

    if (reservation) {
      const deliveryISOString = new Date(
        reservation.year,
        reservation.monthNumber - 1,
        reservation.dayNumber
      ).toISOString();
      data.delivery = deliveryISOString;
    }

    Object.keys(data).forEach((key) => {
      if (
        [
          'ribbonColor',
          'rosesColor',
          'balloonsColor',
          'referenceImage',
          'proofOfPayment',
        ].includes(key)
      )
        data[key] = data[key] || [];
      else if (!['delivery', 'birthday'].includes(key) && key !== 'phoneNumber')
        data[key] = data[key] || '007';
      else if (key === 'phoneNumber') {
        data['phoneNumber'] = data['phoneNumber'] || '0000000000';
      }
    });

    if (window.navigator.onLine) {
      console.log(data);

      data = {
        data: encodeURIComponent(
          JSON.stringify({
            ...data,
          })
        ),
        appVersion: version,
      };

      const completeWhatsappParts = this.whatsAppMessageParts.concat(
        whatsappMessagePartsOfThe7thStep
      );

      //console.log(completeWhatsappParts);

      this.fullFormMessage = completeWhatsappParts.join('');

      const success = await this.merchantsService.uploadDataToClientsAirtable(
        this.merchantId,
        this.automationName,
        data,
        window.location.href
      );

      this.dialog.open(GeneralFormSubmissionDialogComponent, {
        type: 'centralized-fullscreen',
        props: {
          icon: success ? 'check-circle.svg' : 'sadFace.svg',
          showCloseButton: success ? false : true,
          message: success ? null : 'Ocurrió un problema',
        },
        customClass: 'app-dialog',
        flags: ['no-header'],
      });

      window.location.href =
        this.whatsappLink + encodeURIComponent(this.fullFormMessage);
    } else {
      throw new Error('Se perdió la conexion a internet');
    }
  }

  storeParams(params: any) {
    this.multistepFormData = params;
  }
}
