import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormStep } from 'src/app/core/types/multistep-form';
import { FormControl, Validators } from '@angular/forms';
import { HeaderInfoComponent } from 'src/app/shared/components/header-info/header-info.component';
import { ImageInputComponent } from 'src/app/shared/components/image-input/image-input.component';
import { ReservationOrderlessComponent } from '../reservations-orderless/reservations-orderless.component';

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
        }
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
            control: new FormControl('', Validators.required)
          },
          label: 'Número de teléfono (*)',
          inputType: 'phone',
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
          styles: {
            labelStyles: {
              ...labelStyles,
            },
            containerStyles: {
              display: 'none'
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
              marginTop: '25px'
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
          label: 'Remitente (Si no deseas que indiquemos de parte de quien proviene este arreglo puedes escribir "Anónimo"',
          placeholder: 'Escribe aquí',
          styles: {
            labelStyles: {
              ...labelStyles,
            },
            containerStyles: {
              marginTop: '25px'
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
              marginTop: '25px'
            }
          }
        },
      ],
      embeddedComponents: [
        {
          afterIndex: 1,
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
              text: 'Tienes fotos de referencia? Adjúntalas aquí:',
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
            marginTop: '44px',
          },
        }
      ],
      stepProcessingFunction: () => {
        return { ok: true }
      },
      stepButtonInvalidText: 'ESPECIFICA LOS DETALLES DE TU ORDEN',
      stepButtonValidText: 'CONTINUA CON TU ORDEN'
    },
  ]

  constructor(
    private route: ActivatedRoute
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
