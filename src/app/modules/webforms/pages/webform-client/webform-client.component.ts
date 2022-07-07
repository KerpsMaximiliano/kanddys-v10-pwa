import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { FormStep, FooterOptions } from 'src/app/core/types/multistep-form';
import { DecimalPipe } from '@angular/common';
import { ShortCalendarComponent } from 'src/app/shared/components/short-calendar/short-calendar.component';

const footerConfig: FooterOptions = {
  bgColor: '#2874AD',
  color: '#FFFFFF',
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

const labelStyles = {
  fontFamily: 'RobotoMedium',
  fontWeight: '400',
  fontSize: '17px',
  paddingBottom: '24px',
  paddingLeft: '4px',
  margin: 0,
  color: '#7B7B7B'
};


@Component({
  selector: 'app-webform-client',
  templateUrl: './webform-client.component.html',
  styleUrls: ['./webform-client.component.scss']
})
export class WebformClientComponent implements OnInit {
  showPhoneBottomLabel = false;

  headerInfoConfig = {
    title: 'D’Licianthus, TIENDA',
    description: 'Formulario de Ordenes',
    profileImage: 'https://storage-rewardcharly.sfo2.digitaloceanspaces.com/new-assets/flores_logo.png',
    socials: [
      {
        name: 'instagram',
        url: 'https://www.instagram.com/dlicianthus/?utm_medium=copy_link'
      },
      {
        name: 'phone',
        url: '18492203488'
      }
    ],
    reverseInfoOrder: true,
    customStyles: {
      wrapper: {
        margin: '0px',
        backgroundColor: 'white',
        background: '#FFF',
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
    },
    fixedMode: true
  };
  

  formSteps: FormStep[] = [
    {
      fieldsList: [
        {
          name: 'referenceImage',
          fieldControl: {
            type: 'single',
            control: new FormControl('', Validators.required)
          },
          label: 'Referencia de tu orden *',
          sublabel: 'Sube la foto del Instagram o de donde la tengas.',
          inputType: 'file',
          placeholder: 'Upload / Camera',
          showImageBottomLabel: "CONNECT RESPONSE TO AIRTABLE (OPTIONAL)",
          styles: {
            labelStyles: {
              margin: '0px',
              paddingBottom: '18px',
              paddingTop: '54px'
            },
            subLabelStyles: {
              color: '#7B7B7B',
              fontSize: '16px',
              fontFamily: 'Roboto',
              fontWeight: '500'
            },
            fieldStyles: {
              minWidth: '192px',
              maxHeight: '163px',
              width: 'calc((100% - 35px * 2) - 55.14%)',
              borderRadius: '7px'
            },
            bottomLabelStyles: {
              color: '#2874AD',
              fontWeight: '400',
              fontFamily: 'Roboto'
            },
            containerStyles: {
              padding: '0rem',
              paddingBottom: '4rem',
            }
          },
        },
      ],
      hideHeader: true,
      styles: {
        padding: '0px',
        paddingBottom: '4rem'
      },
      footerConfig,
      stepProcessingFunction: () => {
        return {ok: true}
      },
      headerInfoInputs: this.headerInfoConfig,
      headerMode: 'header-info-component',
      stepButtonInvalidText: 'ESCRIBE QUIÉN ERES Y COMO TE CONTACTAMOS',
      stepButtonValidText: 'CONTINUA CON TU ORDEN'
    },
    {
      fieldsList: [
        {
          name: 'phoneNumber',
          fieldControl: {
            type: 'single',
            control: new FormControl('', Validators.required)
          },
          label: 'Célular',
          inputType: 'phone',
          placeholder: 'Mi celular es..',
          showImageBottomLabel: this.showPhoneBottomLabel ? "CONNECT RESPONSE TO ANY TABLE (OPTIONAL)" : null,
          topLabelAction: {
            text: 'Datos del comprador',
            clickable: false
          },
          topSubLabelAction: {
            text: 'Informaciones de Contacto.',
            clickable: false
          },
          styles: {
            topLabelActionStyles: {
              margin: '0px',
              paddingBottom: '12px',
              paddingTop: '54px',
              display: 'block',
              width: '100%',
              fontSize: '24px',
              fontWeight: 'bold',
              fontFamily: 'Roboto'
            },
            topSubLabelActionStyles: {
              color: '#7B7B7B',
              fontSize: '16px',
              fontFamily: 'Roboto',
              fontWeight: '500',
              display: 'block',
              width: '100%',
              paddingBottom: '53px'
            },
            labelStyles: labelStyles,
            bottomLabelStyles: this.showPhoneBottomLabel ? {
              color: '#2874AD',
              fontWeight: '400',
              fontFamily: 'Roboto'
            } : null,
            containerStyles: {
              padding: '0rem',
              paddingRight: '51px'
            }
          },
        },
        {
          name: 'notifyMeThroughWhatApp',
          fieldControl: {
            type: 'single',
            control: new FormControl(false, Validators.required)
          },
          label: 'NOTIFICAME POR WHATSAPP',
          inputType: 'radio-simple',
          styles: {
            labelStyles: {
              fontFamily: 'Roboto',
              fontWeight: '400',
              fontSize: '16px',
              margin: 0,
              color: '#7B7B7B',
              paddingLeft: '16px'
            },
            fieldStyles: {
              paddingRight: '51px',
            },
            containerStyles: {
              paddingTop: '10px',
            }
          },
        },
        {
          name: 'name',
          fieldControl: {
            type: 'single',
            control: new FormControl('')
          },
          label: 'Nombre',
          bottomLabel: {
            text: 'CONNECT RESPONSE TO AIRTABLE (OPTIONAL)',
            clickable: false
          },
          topLabelAction: {
            text: 'Por Favor Adiciona Tus Datos',
            clickable: false,
          },
          topSubLabelAction: {
            text: 'Esta info no te la pediremos en tus futuras ordenes.',
            clickable: false
          },
          placeholder: 'Me llamo..',
          styles: {
            labelStyles: {
              fontFamily: 'RobotoMedium',
              fontWeight: '400',
              fontSize: '17px',
              paddingBottom: '24px',
              paddingLeft: '4px',
              margin: 0,
              color: '#7B7B7B'
            },
            topLabelActionStyles: {
              fontFamily: 'Roboto',
              fontWeight: '500',
              fontSize: '19px',
              paddingTop: '79px',
              color: 'black',
              width: '200%',
              display: 'block'
            },
            topSubLabelActionStyles: {
              fontFamily: 'Roboto',
              fontWeight: '600',
              fontSize: '16px',
              paddingTop: '15px',
              paddingBottom: '48px',
              color: '#7B7B7B',
              width: '200%',
              display: 'block'
            },
            containerStyles: {
              display: 'inline-block',
              width: 'calc(100% / 2)',
              paddingRight: '6px',
              position: 'relative'
              // width: '83.70%',
            },
            fieldStyles: {
              width: '100%',
              marginTop: '12px',
            },
            bottomLabelStyles: {
              color: '#2874AD',
              fontWeight: '400',
              fontFamily: 'Roboto',
              position: 'absolute',
              minWidth: '350px',
            }
          },
        },
        {
          name: 'lastname',
          fieldControl: {
            type: 'single',
            control: new FormControl('')
          },
          label: 'Apellido',
          placeholder: 'Mi apellido es..',
          styles: {
            labelStyles: {
              fontFamily: 'RobotoMedium',
              fontWeight: '400',
              fontSize: '17px',
              paddingBottom: '24px',
              paddingLeft: '4px',
              margin: 0,
              color: '#7B7B7B'
            },
            containerStyles: {
              display: 'inline-block',
              width: 'calc(100% / 2)',
              paddingLeft: '6px',
              // width: '83.70%',
            },
            fieldStyles: {
              width: '100%',
              marginTop: '12px',
            },
          },
        },
        {
          name: 'email',
          fieldControl: {
            type: 'single',
            control: new FormControl('')
          },
          label: 'Correo Eléctronico',
          placeholder: 'example@domain',
          inputType: 'email',
          styles: {
            labelStyles: {
              ...labelStyles,
              paddingTop: '81px'
            },
            containerStyles: {
              padding: '0rem',
              paddingRight: '51px'
            },
          }
        },
        {
          name: 'notifyMeThroughEmail',
          fieldControl: {
            type: 'single',
            control: new FormControl(false, Validators.required)
          },
          label: 'USA MI EMAIL PARA NOTIFICARME',
          inputType: 'radio-simple',
          styles: {
            labelStyles: {
              fontFamily: 'Roboto',
              fontWeight: '400',
              fontSize: '16px',
              margin: 0,
              color: '#7B7B7B',
              paddingLeft: '16px'
            },
            containerStyles: {
              paddingTop: '10px',
            }
          },
        },
        {
          name: 'birthday',
          fieldControl: {
            type: 'single',
            control: new FormControl('', Validators.required)
          },
          label: 'Fecha de mi Cumpleaños',
          placeholder: 'Mi cumple es...',
          topLabelAction: {
            text: 'Recibe SORPRESAS En Tu Cumple:',
            clickable: false
          },
          inputType: 'date',
          maxDate: `${new Date().getFullYear()}-${('0' + (new Date().getMonth() + 1)).slice(-2)}-${('0' + new Date().getDate()).slice(-2)}`,
          styles: {
            labelStyles: {
              ...labelStyles,
              paddingTop: '28px',
            },
            containerStyles: {
              padding: '0px',
              paddingTop: '79px',
              paddingBottom: '121px',
              paddingRight: '51px'
            },
            topLabelActionStyles: {
              fontFamily: 'Roboto',
              fontSize: '19px',
              fontWeight: '500',
              color: 'black',
              margin: 0,
              paddingLeft: '4px',
            }
          },
        },
      ],
      hideHeader: true,
      styles: {
        padding: '0px',
        paddingBottom: '4rem'
      },
      footerConfig: {
        ...footerConfig,
        bubbleConfig: {
          validStep: {
            left: { icon: '/arrow-left.svg', color: 'blue' },
            function: async (params) => {
            }
          },
          invalidStep: {
            left: { icon: '/arrow-left.svg', color: 'blue' },
          }
        },
      },
      stepProcessingFunction: () => {
        return {ok: true}
      },
      headerInfoInputs: this.headerInfoConfig,
      headerMode: 'header-info-component',
      stepButtonInvalidText: 'ESCRIBE TU CÉLULAR',
      stepButtonValidText: 'VERIFICAR SI YA TIENES MIS DATOS'
    },
    {
      fieldsList: [
        {
          name: 'deliveryMethod',
          fieldControl: {
            type: 'single',
            control: new FormControl('', Validators.required)
          },
          selectionOptions: [
            'Pick Up en tienda (gratis)',
            'Nueva dirección lejana a D’Licianthus, entre 6km a 10km de D’licianthus (RD$200.00)',
            'Nueva dirección lejana a D’Licianthus, entre 10km a 14km de D’licianthus (RD$350.00)',
          ],
          inputType: 'radio',
          label: 'Hola NameID,',
          sublabel: 'Por favor dejanos saber donde te conviene que entreguemos',
          styles: {
            labelStyles: {
              margin: '0px',
              padding: '0px',
              paddingBottom: '20px',
              paddingTop: '55px',
              fontSize: '24px',
              fontWeight: 'bold',
              fontFamily: 'Roboto'
            },
            subLabelStyles: {
              ...labelStyles,
              fontFamily: 'RobotoRegular',
              fontWeight: '100'
            },
            fieldStyles: {
              marginBottom: '15px'
            },
            containerStyles: {
              padding: '0px',
            }
          }
        },
      ],
      hideHeader: true,
      styles: {
        padding: '0px',
        paddingBottom: '166px'
      },
      footerConfig: {
        ...footerConfig,
        bubbleConfig: {
          validStep: {
            left: { icon: '/arrow-left.svg', color: 'blue' },
            function: async (params) => {
            }
          },
          invalidStep: {
            left: { icon: '/arrow-left.svg', color: 'blue' },
          }
        },
      },
      stepProcessingFunction: () => {
        return {ok: true}
      },
      headerInfoInputs: this.headerInfoConfig,
      headerMode: 'header-info-component',
      stepButtonInvalidText: 'ESCRIBE TU CÉLULAR',
      stepButtonValidText: 'VERIFICAR SI YA TIENES MIS DATOS'
    },
    {
      fieldsList: [
        {
          name: 'whereToDeliver',
          label: '¿Dónde entregaremos?',
          inputType: 'textarea',
          fieldControl: {
            type: 'single',
            control: new FormControl('', Validators.required)
          },
          placeholder: 'Escriba la Calle, número, (nombre del edificio, color de la casa).',
          styles: {
            containerStyles: {
              marginTop: '50px'
            },
            labelStyles: {
              marginBottom: '26px'
            },
            fieldStyles: {
              borderRadius: '10px',
              padding: '23px 26px 23px 16px',
              background: 'white',
              height: '164px'
            },
          },
        },
      ],
      hideHeader: true,
      styles: {
        padding: '0px',
        paddingBottom: '4rem'
      },
      footerConfig: {
        ...footerConfig,
        bubbleConfig: {
          validStep: {
            left: { icon: '/arrow-left.svg', color: 'blue' },
            function: async (params) => {
            }
          },
          invalidStep: {
            left: { icon: '/arrow-left.svg', color: 'blue' },
          }
        },
      },
      stepProcessingFunction: () => {
        return {ok: true}
      },
      headerInfoInputs: this.headerInfoConfig,
      headerMode: 'header-info-component',
      stepButtonInvalidText: 'ESCRIBE QUIÉN ERES Y COMO TE CONTACTAMOS',
      stepButtonValidText: 'CONTINUA CON TU ORDEN'
    },
    {
      fieldsList: [
        {
          name: 'timeOfDayForDeliverySelection',
          fieldControl: {
            type: 'single',
            control: new FormControl('', Validators.required)
          },
          selectionOptions: [
            'Hoy desde que puedan',
            'Mañana, Sábado 14 de Marzo',
            'Pasado mañana, Lunes 14 de Marzo',
            'Más opciones',
          ],
          inputType: 'radio',
          label: 'La entrega la necesitas en un dia y bloque de tiempo determinado?',
          styles: {
            labelStyles: {
              margin: '0px',
              padding: '0px',
              paddingBottom: '20px',
              paddingTop: '55px',
              fontSize: '24px',
              fontWeight: 'bold',
              fontFamily: 'Roboto'
            },
            containerStyles: {
              padding: '0px',
            }
          }
        },
      ],
      hideHeader: true,
      styles: {
        padding: '0px',
        paddingBottom: '166px'
      },
      footerConfig: {
        ...footerConfig,
        bubbleConfig: {
          validStep: {
            left: { icon: '/arrow-left.svg', color: 'blue' },
            function: async (params) => {
            }
          },
          invalidStep: {
            left: { icon: '/arrow-left.svg', color: 'blue' },
          }
        },
      },
      stepProcessingFunction: () => {
        return {ok: true}
      },
      headerInfoInputs: this.headerInfoConfig,
      headerMode: 'header-info-component',
      stepButtonInvalidText: 'SELECCIONA CUANDO ENTREGAREMOS',
      stepButtonValidText: 'CONTINUAR'
    },
    {
      fieldsList: [
        {
          name: 'convenientSchedule',
          fieldControl: {
            type: 'single',
            control: new FormControl('', Validators.required)
          },
          selectionOptions: [
            'Antes de las 10:00 AM',
            'Entre las 10:00 AM y la 2:00PM',
            'Entre las 2:00pm y las 5:00 PM',
            'Después de las 5pm',
          ],
          inputType: 'radio',
          label: 'Bloque Conveniente:',
          styles: {
            labelStyles: {
              margin: '0px',
              padding: '0px',
              paddingBottom: '24px',
              paddingTop: '60px',
              fontSize: '19px',
              fontWeight: '300',
              fontFamily: 'Roboto'
            },
            fieldStyles: {
              marginBottom: '6px'
            },
            containerStyles: {
              padding: '0px',
              paddingBottom: '156px'
            }
          }
        },
      ],
      hideHeader: true,
      styles: {
        padding: '0px',
        paddingBottom: '166px'
      },
      footerConfig: {
        ...footerConfig,
        bubbleConfig: {
          validStep: {
            left: { icon: '/arrow-left.svg', color: 'blue' },
            function: async (params) => {
            }
          },
          invalidStep: {
            left: { icon: '/arrow-left.svg', color: 'blue' },
          }
        },
      },
      stepProcessingFunction: () => {
        return {ok: true}
      },
      pageHeader: {
        text: 'La entrega la necesitas en un dia y bloque de tiempo determinado?',
        styles: {
          paddingBottom: '31px',
          paddingTop: '45px',
          fontSize: '24px',
          fontWeight: 'bold',
          fontFamily: 'Roboto'
        }
      },
      pageSubHeader: {
        text: 'Mas opciones',
        styles: {
          color: '#7B7B7B',
          fontFamily: 'RobotoMedium',
          borderRadius: '5px',
          fontSize: '19px',
          backgroundColor: '#82F18D',
          padding: '14px 39px'
        }
      },
      embeddedComponents: [
        {
          label: 'DIA CONVENIENTE De Abril',
          labelStyles: {
            margin: '0px',
            padding: '0px',
            paddingBottom: '24px',
            paddingTop: '60px',
            fontSize: '19px',
            fontWeight: '300',
            fontFamily: 'Roboto'
          },
          beforeIndex: 0,
          component: ShortCalendarComponent,
          inputs: {},
          outputs: [
            {
              name: 'selectedDate',
              callback: (params) => {
                console.log(params, "algo pasó")
              }
            }
          ]
        }
      ],
      headerInfoInputs: this.headerInfoConfig,
      headerMode: 'header-info-component',
      stepButtonInvalidText: 'SELECCIONA CUANDO ENTREGAREMOS',
      stepButtonValidText: 'CONTINUAR'
    },
    {
      fieldsList: [
        {
          name: 'aboutDelivery',
          fieldControl: {
            type: 'single',
            control: new FormControl('', Validators.required)
          },
          selectionOptions: [
            'No es un regalo',
            'Es un regalo con remitente',
            'Es un regalo anónimo'
          ],
          inputType: 'radio',
          label: 'Sobre la Entrega',
          styles: {
            labelStyles: {
              margin: '0px',
              padding: '0px',
              paddingBottom: '20px',
              paddingTop: '55px',
              fontSize: '24px',
              fontWeight: 'bold',
              fontFamily: 'Roboto'
            },
            fieldStyles: {
              marginBottom: '5px'
            },
            containerStyles: {
              padding: '0px',
            }
          }
        },
      ],
      hideHeader: true,
      styles: {
        padding: '0px',
        paddingBottom: '166px'
      },
      footerConfig: {
        ...footerConfig,
        bubbleConfig: {
          validStep: {
            left: { icon: '/arrow-left.svg', color: 'blue' },
            function: async (params) => {
            }
          },
          invalidStep: {
            left: { icon: '/arrow-left.svg', color: 'blue' },
          }
        },
      },
      stepProcessingFunction: () => {
        return {ok: true}
      },
      headerInfoInputs: this.headerInfoConfig,
      headerMode: 'header-info-component',
      stepButtonInvalidText: 'SELECCIONA CUANDO ENTREGAREMOS',
      stepButtonValidText: 'CONTINUAR'
    },
    {
      fieldsList: [
        {
          name: 'name',
          fieldControl: {
            type: 'single',
            control: new FormControl('')
          },
          label: 'Nombre',
          placeholder: 'Me llamo..',
          topLabelAction: {
            text: 'Para Quien Es?',
          },
          styles: {
            labelStyles: {
              fontFamily: 'RobotoMedium',
              fontWeight: '400',
              fontSize: '17px',
              paddingBottom: '24px',
              paddingLeft: '4px',
              margin: 0,
              color: '#7B7B7B'
            },
            containerStyles: {
              display: 'inline-block',
              width: 'calc(100% / 2)',
              paddingRight: '6px',
              marginTop: '24px',
              position: 'relative'
              // width: '83.70%',
            },
            topLabelActionStyles: {
              fontSize: '19px',
              fontWeight: '200',
              fontFamily: 'Roboto',
              paddingTop: '60px',
              paddingBottom: '31px',
              display: 'block'
            },
            fieldStyles: {
              width: '100%',
            }
          },
        },
        {
          name: 'lastname',
          fieldControl: {
            type: 'single',
            control: new FormControl('')
          },
          label: 'Apellido',
          placeholder: 'Mi apellido es..',
          styles: {
            labelStyles: {
              fontFamily: 'RobotoMedium',
              fontWeight: '400',
              fontSize: '17px',
              paddingBottom: '24px',
              paddingLeft: '4px',
              margin: 0,
              color: '#7B7B7B'
            },
            containerStyles: {
              display: 'inline-block',
              width: 'calc(100% / 2)',
              paddingLeft: '6px',
              // width: '83.70%',
            },
            fieldStyles: {
              width: '100%',
            },
          },
        },
        {
          name: 'receiverPhoneNumber',
          fieldControl: {
            type: 'single',
            control: new FormControl('', Validators.required)
          },
          label: 'Celular de quien recibe (opcional)',
          inputType: 'phone',
          placeholder: 'Mi celular es..',
          showImageBottomLabel: this.showPhoneBottomLabel ? "CONNECT RESPONSE TO ANY TABLE (OPTIONAL)" : null,
          styles: {
            labelStyles: {
              ...labelStyles,
              paddingTop: '52px'
            },
            bottomLabelStyles: this.showPhoneBottomLabel ? {
              color: '#2874AD',
              fontWeight: '400',
              fontFamily: 'Roboto'
            } : null,
            containerStyles: {
              padding: '0rem',
            }
          },
        },
        {
          name: 'itsASurprise',
          fieldControl: {
            type: 'single',
            control: new FormControl(false, Validators.required)
          },
          label: 'ES UNA SORPRESA',
          sublabel: 'No se notificará a quien recibe',
          inputType: 'radio-simple',
          shouldWrapLabelAndSublabelInsideADiv: true,
          styles: {
            labelStyles: {
              margin: 0,
              fontFamily: 'RobotoMedium',
              fontSize: '16px',
              fontWeight: 'normal',
              color: '#7B7B7B',
              paddingBottom: '11px'
            },
            subLabelStyles: {
              margin: 0,
              color: '#7B7B7B',
              fontSize: '16px',
              fontFamily: 'Roboto',
              fontWeight: '500',
              display: 'block',
              width: '100%',
            },
            containerStyles: {
              paddingTop: '26px',
            }
          },
        },
        {
          name: 'message',
          fieldControl: {
            type: 'single',
            control: new FormControl('')
          },
          label: 'Mensaje del regalo (opcional)',
          inputType: 'textarea',
          placeholder: 'El mensaje sería..',
          styles: {
            labelStyles: {
              ...labelStyles,
              paddingBottom: '20px'
            },
            containerStyles: {
              padding: '0px',
              marginTop: '55px',
              borderTop: '0.5px solid #d4d4d4',
              paddingTop: '44px',
              paddingBottom: '56px'
            },
            fieldStyles: {
              boxShadow: '0px 4px 5px 0px #ddd inset',
              color: '#0b1f38',
              width: '100%',
              fontFamily: 'RobotoMedium',
              height: '164px',
              padding: '23px',
              resize: 'none',
              fontSize: '20px',
              // border: '2px solid #31a4f9',
              borderRadius: '10px',
              backgroundColor: '#fff',
            },
            topLabelActionStyles: {
              fontFamily: 'Roboto',
              fontSize: '19px',
              fontWeight: '500',
              color: 'black',
              margin: 0,
              paddingLeft: '4px',
            },
          },
        },
        {
          name: 'fromWho',
          fieldControl: {
            type: 'single',
            control: new FormControl('', Validators.required)
          },
          label: '¿Departe de quién o quienes? (opcional)',
          placeholder: 'De..',
          styles: {
            labelStyles: {
              ...labelStyles,
              paddingBottom: '20px'
            },
            containerStyles: {
              padding: '0rem',
              paddingBottom: '47px',
              borderBottom: '0.5px solid #d4d4d4',
            }
          },
        },
        {
          name: 'reminder',
          fieldControl: {
            type: 'single',
            control: new FormControl(false, Validators.required)
          },
          label: 'RECORDATORIO',
          sublabel: 'Recibe un recordatorio con opciones de regalos el próximo año.',
          inputType: 'radio-simple',
          shouldWrapLabelAndSublabelInsideADiv: true,
          styles: {
            labelStyles: {
              margin: 0,
              fontFamily: 'RobotoMedium',
              fontSize: '16px',
              fontWeight: 'normal',
              color: '#7B7B7B',
              paddingBottom: '11px'
            },
            subLabelStyles: {
              margin: 0,
              color: '#7B7B7B',
              fontSize: '16px',
              fontFamily: 'Roboto',
              fontWeight: '500',
              display: 'block',
              width: '100%',
            },
            containerStyles: {
              paddingTop: '53px',
              paddingBottom: '150px'
            }
          },
        },
      ],
      hideHeader: true,
      styles: {
        padding: '0px',
        paddingBottom: '4rem'
      },
      footerConfig: {
        ...footerConfig,
        bubbleConfig: {
          validStep: {
            left: { icon: '/arrow-left.svg', color: 'blue' },
            function: async (params) => {
            }
          },
          invalidStep: {
            left: { icon: '/arrow-left.svg', color: 'blue' },
          }
        },
      },
      stepProcessingFunction: () => {
        return {ok: true}
      },
      pageHeader: {
        text: 'Sobre la Entrega',
        styles: {
          paddingBottom: '31px',
          paddingTop: '45px',
          fontSize: '24px',
          fontWeight: 'bold',
          fontFamily: 'Roboto'
        }
      },
      pageSubHeader: {
        text: 'Es un regalo con remitente',
        styles: {
          color: '#7B7B7B',
          fontFamily: 'RobotoMedium',
          borderRadius: '5px',
          fontSize: '19px',
          backgroundColor: '#82F18D',
          padding: '14px 39px'
        }
      },
      headerInfoInputs: this.headerInfoConfig,
      headerMode: 'header-info-component',
      stepButtonInvalidText: 'ESCRIBE TU CÉLULAR',
      stepButtonValidText: 'VERIFICAR SI YA TIENES MIS DATOS'
    },
    {
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
                    this.formSteps[8].fieldsList[0].placeholder = '';
                  }

                  this.formSteps[8].fieldsList[0].formattedValue = '$' + formatted;
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
                    this.formSteps[8].fieldsList[0].placeholder = '';
                  }

                  this.formSteps[8].fieldsList[0].formattedValue = '$' + formatted;
                }
              } else {
                const convertedNumber = Number(change.split('').filter(char => char !== '.').join(''));
                this.formSteps[8].fieldsList[0].fieldControl.control.setValue(convertedNumber, {
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
              marginBottom: '20px',
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
              marginTop: '49px',
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
          name: 'methodOfPayment',
          fieldControl: {
            type: 'single',
            control: new FormControl('', Validators.required)
          },
          selectionOptions: ['Banco Popular. A nombre de D’licianthus. CTA #154874-54-52', 'Banco BHD. A nombre de D’licianthus. CTA #154874-54-52', 'PayPal. A: d’lcianthus@gmail.com', 'Otro'],
          changeCallbackFunction: (change, params) => {
          },
          label: 'Via de Pago (*)',
          inputType: 'radio',
          styles: {
            labelStyles: {
              ...labelStyles,
              fontFamily: 'Roboto',
              color: 'black',
              fontWeight: 500,
              fontSize: '19px',
              paddingBottom: '21px',
              paddingTop: '60px'
            },
            fieldStyles: {
              paddingLeft: '0px'
            },
            containerStyles: {
              paddingBottom: '60px'
            }
          },
        },
        {
          name: 'paymentReference',
          fieldControl: {
            type: 'single',
            control: new FormControl('', Validators.required)
          },
          label: 'Comprobante de Pago',
          sublabel: 'Anexar el comprabante de su pago',
          inputType: 'file',
          placeholder: 'Upload / Camera',
          styles: {
            labelStyles: {
              margin: '0px',
              paddingBottom: '18px',
            },
            subLabelStyles: {
              color: '#7B7B7B',
              fontSize: '16px',
              fontFamily: 'Roboto',
              fontWeight: '500'
            },
            fieldStyles: {
              minWidth: '192px',
              maxHeight: '163px',
              width: 'calc((100% - 35px * 2) - 55.14%)',
              borderRadius: '7px'
            },
            containerStyles: {
              padding: '0px',
              paddingBottom: '113px',
            }
          },
        },
      ],
      hideHeader: true,
      styles: {
        padding: '0px',
        paddingBottom: '4rem'
      },
      footerConfig: {
        ...footerConfig
      },
      stepProcessingFunction: () => {
        return {ok: true}
      },
      // pageHeader: {
      //   text: 'RD$1,455',
      //   styles: {
      //     paddingBottom: '16px',
      //     paddingTop: '50px',
      //     fontSize: '24px',
      //     fontWeight: 'bold',
      //     fontFamily: 'Roboto'
      //   }
      // },
      // pageSubHeader: {
      //   text: 'Es el total a pagar por PrudctoID $1,457.00 y el delivery $450.00',
      //   styles: {
      //     color: '#7B7B7B',
      //     fontFamily: 'RobotoMedium',
      //     fontSize: '16px',
      //     padding: '0px',
      //   }
      // },
      headerInfoInputs: this.headerInfoConfig,
      headerMode: 'header-info-component',
      stepButtonInvalidText: 'ESCRIBE TU CÉLULAR',
      stepButtonValidText: 'VERIFICAR SI YA TIENES MIS DATOS'
    },
  ];

  constructor(
    private decimalPipe: DecimalPipe
  ) { }

  ngOnInit(): void {
  }

}
