import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { FormStep, FooterOptions } from 'src/app/core/types/multistep-form';
import { HeaderInfoComponent } from 'src/app/shared/components/header-info/header-info.component';

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


const headerInfoEmbeddedComponent = {
  component: HeaderInfoComponent,
  beforeIndex: 0,
  inputs: {
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
};

@Component({
  selector: 'app-webform-client',
  templateUrl: './webform-client.component.html',
  styleUrls: ['./webform-client.component.scss']
})
export class WebformClientComponent implements OnInit {
  showPhoneBottomLabel = false;

  formSteps: FormStep[] = [
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
              paddingLeft: '33px',
              marginTop: '24px',
              position: 'relative'
              // width: '83.70%',
            },
            fieldStyles: {
              width: '100%',
              marginTop: '12px',
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
              paddingRight: '33px',
              // width: '83.70%',
            },
            fieldStyles: {
              width: '100%',
              marginTop: '12px',
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
            labelStyles: labelStyles,
            bottomLabelStyles: this.showPhoneBottomLabel ? {
              color: '#2874AD',
              fontWeight: '400',
              fontFamily: 'Roboto'
            } : null,
            containerStyles: {
              padding: '0rem 33px',
              paddingBottom: '21px',
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
              fontFamily: 'Roboto',
              fontWeight: '400',
              fontSize: '16px',
              margin: 0,
              color: '#7B7B7B'
            },
            subLabelStyles: {
              color: '#7B7B7B',
              fontSize: '16px',
              fontFamily: 'Roboto',
              fontWeight: '500',
              display: 'block',
              width: '100%',
              paddingBottom: '44px'
            },
            containerStyles: {
              paddingTop: '24px',
              paddingBottom: '21px',
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
              padding: '0px 33px',
              paddingTop: '67px',
              paddingBottom: '121px'
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
      embeddedComponents: [
        headerInfoEmbeddedComponent
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
      stepButtonInvalidText: 'ESCRIBE TU CÉLULAR',
      stepButtonValidText: 'VERIFICAR SI YA TIENES MIS DATOS'
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
            containerStyles: {
              padding: '0px 33px',
            }
          }
        },
      ],
      embeddedComponents: [
        headerInfoEmbeddedComponent
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
      stepButtonInvalidText: 'SELECCIONA CUANDO ENTREGAREMOS',
      stepButtonValidText: 'CONTINUAR'
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
              padding: '0px 33px',
            }
          }
        },
      ],
      embeddedComponents: [
        headerInfoEmbeddedComponent
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
      stepButtonInvalidText: 'SELECCIONA CUANDO ENTREGAREMOS',
      stepButtonValidText: 'CONTINUAR'
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
            subLabelStyles: labelStyles,
            containerStyles: {
              padding: '0px 33px',
            }
          }
        },
      ],
      embeddedComponents: [
        headerInfoEmbeddedComponent
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
      stepButtonInvalidText: 'ESCRIBE TU CÉLULAR',
      stepButtonValidText: 'VERIFICAR SI YA TIENES MIS DATOS'
    },
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
              paddingTop: '47px'
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
              padding: '0rem 39px',
              paddingBottom: '4rem',
            }
          },
        },
      ],
      embeddedComponents: [
        headerInfoEmbeddedComponent
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
              paddingBottom: '17px',
              paddingTop: '47px',
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
              paddingBottom: '44px'
            },
            labelStyles: labelStyles,
            bottomLabelStyles: this.showPhoneBottomLabel ? {
              color: '#2874AD',
              fontWeight: '400',
              fontFamily: 'Roboto'
            } : null,
            containerStyles: {
              padding: '0rem 33px',
              paddingBottom: '21px',
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
              color: '#7B7B7B'
            },
            containerStyles: {
              paddingTop: '24px',
              paddingBottom: '21px',
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
            containerStyles: {
              display: 'inline-block',
              width: 'calc(100% / 2)',
              paddingRight: '6px',
              paddingLeft: '33px',
              marginTop: '24px',
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
              paddingRight: '33px',
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
              padding: '0rem 33px',
              paddingBottom: '21px',
            },
            fieldStyles: {
              marginTop: '26px'
            }
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
              color: '#7B7B7B'
            },
            containerStyles: {
              paddingTop: '24px',
              paddingBottom: '21px',
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
              padding: '0px 33px',
              paddingTop: '67px',
              paddingBottom: '121px'
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
      embeddedComponents: [
        headerInfoEmbeddedComponent
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
      stepButtonInvalidText: 'ESCRIBE TU CÉLULAR',
      stepButtonValidText: 'VERIFICAR SI YA TIENES MIS DATOS'
    },
  ];

  constructor() { }

  ngOnInit(): void {
  }

}
