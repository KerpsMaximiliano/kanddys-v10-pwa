import { Component, OnInit } from '@angular/core';
import { FormField, FormStep } from 'src/app/core/types/multistep-form';
import { FormControl, Validators } from '@angular/forms';
import { PageComponentTabsComponent } from 'src/app/shared/components/page-component-tabs/page-component-tabs.component';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { EntityItemListComponent } from 'src/app/shared/dialogs/entity-item-list/entity-item-list.component';
import { EntityLists } from 'src/app/shared/dialogs/entity-item-list/entity-item-list.component';
import { FooterOptions } from 'src/app/core/types/multistep-form';
import { SwitchButtonComponent } from 'src/app/shared/components/switch-button/switch-button.component';

const labelStyles = {
  color: '#7B7B7B',
  fontFamily: 'RobotoMedium',
  fontSize: '17px',
  fontWeight: 500,
  margin: '0px'
};

const labelStyles2 = {
  fontFamily: "SfProLight",
  marginLeft: '17px',
  marginBottom: '25px',
  color: '#7B7B7B',
  fontSize: '14px',
  fontWeight: 'normal',
}

const commonFieldStyles = {
  boxShadow: '0px 0px 4px 1px inset rgb(0 0 0 / 20%)',
  borderRadius: '22px'
};

const commonFieldContainerStyles = {
  marginTop: '55px'
};

const injectSubmitButtom = (callback: any, step = 0, buttonText: string = 'SALVAR CONTACTO'): FormField => ({
  name: 'submit-button',
  fieldControl: {
    type: 'single',
    control: new FormControl(true)
  },
  hovered: false,
  inputType: 'button',
  label: buttonText,
  callbackOnClick: callback ? callback : null,
  disabled: step === 0 ? true : false,
  styles: {
    containerStyles: {
      marginBottom: '60px',
      marginTop: '58px',
    },
    hoverStyles: {
      backgroundColor: '#ECB010',
      outline: 0,
      width: '100%',
      color: '#174B72',
      fontWeight: 500,
      textAlign: 'center',
      padding: '20px 0px',
      border: '0px',
      borderRadius: '30px',
      cursor: 'pointer'
    },
    fieldStyles: {
      backgroundColor: '#FED230',
      outline: 0,
      width: '100%',
      color: '#174B72',
      fontWeight: 500,
      textAlign: 'center',
      padding: '20px 0px',
      border: '0px',
      borderRadius: '30px',
      cursor: 'pointer'
    },
    disabledStyles: {
      backgroundColor: '#AFAFAF',
      outline: 0,
      width: '100%',
      color: '#fff',
      fontWeight: 500,
      textAlign: 'center',
      padding: '20px 0px',
      border: '0px',
      borderRadius: '30px',
    },
  },
});

const tabsOptions = ["Recibir pagos", "Cuentas Sociales", "Contacto"];

@Component({
  selector: 'app-user-creator',
  templateUrl: './user-creator.component.html',
  styleUrls: ['./user-creator.component.scss']
})
export class UserCreatorComponent implements OnInit {
  scrollableForm = false;
  isMerchant: boolean = false;
  currentTab: number = 0;
  currentStep: number = 0;
  currentStepString: string = '1';

  tabComponent = {
    containerStyles: {
      position: 'fixed',
      top: '0',
      left: '0',
      right: '0',
      maxWidth: '500px',
      margin: 'auto'
    },
    beforeIndex: 0,
    component: PageComponentTabsComponent,
    inputs: {
      tabsOptions,
      activeTag: this.currentTab
    },
    outputs: [
      {
        name: 'changeValue',
        callback: (newTabName) => {
          const newTabIndex = tabsOptions.findIndex(tabName => tabName === newTabName);

          this.currentTab = newTabIndex;
          this.formSteps[this.currentStep].embeddedComponents[0].inputs.activeTag = this.currentTab;
          if(newTabIndex === 0) {
            this.currentStep = 1;
          } else if(newTabIndex === 2) {
            this.currentStep = 2;
          } else if(newTabIndex === 1) {
            this.currentStep = 3;
          };;
          this.currentStepString = this.currentStep + 1 + '';
          
          this.formSteps[this.currentStep].embeddedComponents[0].inputs.activeTag = this.currentTab;
          this.formSteps[this.currentStep].embeddedComponents[0].shouldRerender = true;
        },
      }
    ]
  };

  footerConfig: FooterOptions = {
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
          name: 'userImage',
          fieldControl: {
            type: 'single',
            control: new FormControl('')
          },
          label: 'Informaciones de Contacto',
          sublabel: 'Adiciona la imagen que te representa:',
          inputType: 'file',
          placeholder: 'Sube una imagen',
          styles: {
            containerStyles: {
              // minWidth: '281px',
              marginTop: '30px'
            },
            labelStyles: {
              fontFamily: 'Roboto',
              fontWeight: 'bold',
              fontSize: '24px',
              color: '#2E2E2E',
              marginBottom: '51px',
            },
            subLabelStyles: {
              color: '#7B7B7B',
              fontFamily: 'RobotoMedium',
              fontSize: '17px',
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
        {
          name: 'name',
          fieldControl: {
            type: 'single',
            control: new FormControl('')
          },
          label: 'Nombre:',
          placeholder: 'Me llamo..',
          styles: {
            containerStyles: {
              display: !this.isMerchant ? 'inline-block' : 'none',
              width: 'calc(100% / 2)',
              paddingRight: '6px',
              marginTop: '73px'
              // width: '83.70%',
            },
            fieldStyles: {
              width: '100%',
              marginTop: '19px',
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
          label: 'Apellido:',
          placeholder: 'Mi apellido es..',
          styles: {
            containerStyles: {
              display: !this.isMerchant ? 'inline-block' : 'none',
              width: 'calc(100% / 2)',
              paddingLeft: '6px'
              // width: '83.70%',
            },
            fieldStyles: {
              width: '100%',
              marginTop: '19px',
            },
            labelStyles: labelStyles,
          },
        },
        {
          name: 'subtext',
          fieldControl: {
            type: 'single',
            control: new FormControl('')
          },
          label: 'Escribe lo que irá debajo del nombre:',
          placeholder: 'Ej, CEO..',
          styles: {
            containerStyles: {
              display: !this.isMerchant ? 'inline-block' : 'none',
              marginTop: '60px',
            },
            fieldStyles: {
              maxWidth: '166px',
              marginTop: '19px',
            },
            labelStyles: labelStyles,
          },
        },
        {
          name: 'businessName',
          fieldControl: {
            type: 'single',
            control: new FormControl('')
          },
          label: 'Nombre del negocio',
          placeholder: 'Nombre del negocio es..',
          styles: {
            containerStyles: {
              display: this.isMerchant ? 'block' : 'none',
              marginTop: '73px'
              // width: '83.70%',
            },
            fieldStyles: {
              width: '100%',
              marginTop: '19px',
            },
            labelStyles: labelStyles,
          },
        },
        {
          name: 'businessType',
          fieldControl: {
            type: 'single',
            control: new FormControl('')
          },
          label: 'Escribe el tipo de negocio',
          placeholder: 'Ej, TIENDA..',
          styles: {
            containerStyles: {
              display: this.isMerchant ? 'block' : 'none',
              marginTop: '60px',
            },
            fieldStyles: {
              maxWidth: '166px',
              marginTop: '19px',
            },
            labelStyles: labelStyles,
          },
        },
        injectSubmitButtom((params) => {
          const {
            businessName,
            businessType,
            lastname,
            name,
            'submit-button': submitButton,
            subtext,
            userImage
          } = params.dataModel.get('1').value;

          const {
            venmo,
            paypal,
            cashapp
          } = params.dataModel.get('2').value;

          const {
            email,
            phoneNumber,
            address
          } = params.dataModel.get('3').value;

          this.initValidatorsExclusiveToMerchantOrRegularUser();
        })
      ],
      optionalLinksTo: {
        afterIndex: !this.isMerchant ? 3 : 5,
        groupOfLinksArray: [
          {
            topLabel: 'Contenido opcional',
            styles: {
              containerStyles: {
                marginTop: '60px',
                marginBottom: '58px'
              },
              fieldStyles: {
                marginTop: '20px',
                paddingLeft: '16px',
                fontSize: '17px',
                width: 'fit-content',
                color: '#2874AD',
                fontFamily: 'SfProRegular'
              },
              labelStyles: labelStyles
            },
            links: [
              {
                text: 'Contacto: Email, Telefonos, URL’s.',
                action: (params) => {
                  this.currentTab = 2;
                  this.formSteps[2].embeddedComponents[0].inputs.activeTag = this.currentTab;

                  this.currentStep = 2;
                  this.currentStepString = '3';

                  console.log("cs", this.currentStep, this.currentStepString);
                  window.scroll(0, 0);
                }
              },
              {
                text: 'Pequeña descripción como tu Bio',
                action: (params) => {
                }
              },
              {
                text: 'Métodos de recibir pago',
                action: (params) => {
                  this.currentStep = 1;
                  this.currentStepString = '2';
                  window.scroll(0, 0);
                }
              },
            ]
          }
        ]
      },
      statusChangeCallbackFunction: (status) => {
        console.log("El estatus de " + this.currentStep + " ha cambiado a", status);

        if(status === 'INVALID')
          this.formSteps[0].fieldsList[6].disabled = true;
        if(status === 'VALID')
          this.formSteps[0].fieldsList[6].disabled = false;

        console.log(this.formSteps[0].fieldsList[6]);
      },
      avoidGoingToNextStep: true,
      headerText: '',
      stepButtonInvalidText: 'ADICIONA LA INFO DE LO QUE VENDES',
      stepButtonValidText: 'CONTINUAR CON LA ACTIVACIÓN',
      headerMode: 'v2',
      hideHeader: true,
      footerConfig: {
        ...this.footerConfig
      },
      customStickyButton: {
        text: 'POSIBILIDADES',
        text2: 'WebApps STORE',
        bgcolor: '#2874AD',
        color: '#E9E371',
        mode: 'double',
        height: '30px'
      },
      embeddedComponents: [
        {
          beforeIndex: 0,
          component: SwitchButtonComponent,
          inputs: {
            settings: {
              leftText: 'ES UN NEGOCIO?',
            },
            containerStyles: {
              paddingTop: '58px',
              justifyContent: 'flex-end'
            },
            textStyles: {
              fontFamily: 'SfProRegular',
              paddingRight: '6px',
              color: '#7B7B7B'
            }
          },
          outputs: [
            {
              name: 'switched',
              callback: (params) => this.changeMerchant(),
            }
          ]
        }
      ]
    },
    {
      hideHeader: true,
      fieldsList: [
        {
          name: 'paypal',
          fieldControl: {
            type: 'single',
            control: new FormControl('')
          },
          placeholder: '',
          label: 'PAYPAL',
          styles: {
            labelStyles: {
              ...labelStyles,
              marginBottom: '24px',
              display: 'inline-block',
              backgroundImage: 'url(https://storage-rewardcharly.sfo2.digitaloceanspaces.com/new-assets/instagram-outline.svg)',
              backgroundRepeat: 'no-repeat',
              paddingLeft: '38px',
              backgroundPositionX: '8px',
            },
            fieldStyles: {
              boxShadow: '0px 0px 4px 1px inset rgb(0 0 0 / 20%)',
              borderRadius: '22px'
            },
            containerStyles: {
              marginTop: '57px'
            }
          },
        },
        {
          name: 'venmo',
          fieldControl: {
            type: 'single',
            control: new FormControl('')
          },
          placeholder: '',
          label: 'VENMO',
          styles: {
            labelStyles: {
              ...labelStyles,
              marginBottom: '24px',
              display: 'inline-block',
              backgroundImage: 'url(https://storage-rewardcharly.sfo2.digitaloceanspaces.com/new-assets/instagram-outline.svg)',
              backgroundRepeat: 'no-repeat',
              paddingLeft: '38px',
              backgroundPositionX: '8px'
            },
            fieldStyles: {
              boxShadow: '0px 0px 4px 1px inset rgb(0 0 0 / 20%)',
              borderRadius: '22px'
            },
            containerStyles: {
              marginTop: '57px'
            }
          },
        },
        {
          name: 'cashapp',
          fieldControl: {
            type: 'single',
            control: new FormControl('')
          },
          placeholder: '',
          label: 'CASHAPP',
          styles: {
            labelStyles: {
              ...labelStyles,
              marginBottom: '24px',
              display: 'inline-block',
              backgroundImage: 'url(https://storage-rewardcharly.sfo2.digitaloceanspaces.com/new-assets/instagram-outline.svg)',
              backgroundRepeat: 'no-repeat',
              paddingLeft: '38px',
              backgroundPositionX: '8px'
            },
            fieldStyles: {
              boxShadow: '0px 0px 4px 1px inset rgb(0 0 0 / 20%)',
              borderRadius: '22px'
            },
            containerStyles: {
              marginTop: '57px'
            }
          },
        },
        injectSubmitButtom((params) => {
          this.currentTab = 0;
          this.formSteps[2].embeddedComponents[0].inputs.activeTag = this.currentTab;
          this.currentStep = 0;
          this.currentStepString = '1';
  
          params.scrollToStep(0);
          window.scroll(0, 0);
        }, 1, "SALVAR METODOS DE RECIBIR $")
      ],
      optionalLinksTo: {
        afterIndex: 2,
        groupOfLinksArray: [
          {
            topLabel: 'Otras formas de recibir pagos:',
            styles: {
              containerStyles: {
                marginTop: '60px',
                marginBottom: '58px'
              },
              fieldStyles: {
                marginTop: '20px',
                paddingLeft: '16px',
                fontSize: '17px',
                width: 'fit-content',
                color: '#2874AD',
                fontFamily: 'SfProRegular'
              },
              labelStyles: labelStyles
            },
            links: [
              {
                text: 'Cuentas Bancarias',
                action: (params) => {
                  this.currentTab = 0;
                  // this.formSteps[2].embeddedComponents[0].inputs.activeTag = this.currentTab;
                  this.currentStep = 4;
                  this.currentStepString = '5';
          
                  params.scrollToStep(4);
                  window.scroll(0, 0);
                }
              },
              {
                text: 'Pagos con tarjeta de crédito',
                action: (params) => {
                  params.scrollToStep(2);
                }
              },
              {
                text: 'Otro enlace como el de YoYo App',
                action: (params) => {
                  params.scrollToStep(1);
                }
              },
            ]
          }
        ]
      },
      pageHeader: {
        text: 'Adiciona los links que usualmente mandas para que ta paguen',
        styles: {
          paddingTop: '92px',
          fontFamily: 'Roboto',
          fontWeight: 'bold',
          fontSize: '24px',
          color: '#2E2E2E'
        }
      },
      footerConfig: {
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
        },
      },
      stepProcessingFunction: () => {
        const paymentMethodIcons = {
          'PayPal': ''
        }

        const dialogList: EntityLists[] = [
          {
            name: !this.isMerchant ? (
              this.formSteps[0].fieldsList[1].fieldControl.control.value  + 
              ' ' + this.formSteps[0].fieldsList[2].fieldControl.control.value
            ) : null,
            title: 'Selecciona el método de pago que te convenga:',
            type: !this.isMerchant ? 'Usuario' : 'Tienda',
            isImageBase64: true,
            image: this.formSteps[0].fieldsList[0].fieldControl.control.value,
            options: [
              {
                text: 'PayPal',
                icon: {
                  src: 'https://storage-rewardcharly.sfo2.digitaloceanspaces.com/new-assets/instagram-outline.svg',
                  alt: 'field.label',
                  width: 17,
                  height: 17
                },
                url: this.formSteps[1].fieldsList[0].fieldControl.control.value
              },
              {
                text: 'Venmo',
                icon: {
                  src: 'https://storage-rewardcharly.sfo2.digitaloceanspaces.com/new-assets/instagram-outline.svg',
                  alt: 'field.label',
                  width: 17,
                  height: 17
                },
                url: this.formSteps[1].fieldsList[2].fieldControl.control.value
              },
              {
                text: 'CashApp',
                icon: {
                  src: 'https://storage-rewardcharly.sfo2.digitaloceanspaces.com/new-assets/instagram-outline.svg',
                  alt: 'field.label',
                  width: 17,
                  height: 17
                },
                url: this.formSteps[1].fieldsList[3].fieldControl.control.value
              },
              {
                text: 'Transferencia a Banco',
                icon: {
                  src: 'https://storage-rewardcharly.sfo2.digitaloceanspaces.com/new-assets/instagram-outline.svg',
                  alt: 'field.label',
                  width: 17,
                  height: 17
                },
                url: ''
              },
              {
                text: 'Tarjeta de Crédito',
                icon: {
                  src: 'https://storage-rewardcharly.sfo2.digitaloceanspaces.com/new-assets/instagram-outline.svg',
                  alt: 'field.label',
                  width: 17,
                  height: 17
                },
                url: ''
              },
              {
                text: 'YoYo App',
                icon: {
                  src: 'https://storage-rewardcharly.sfo2.digitaloceanspaces.com/new-assets/instagram-outline.svg',
                  alt: 'field.label',
                  width: 17,
                  height: 17
                },
                url: ''
              }
            ]
          } 
        ]

        this.dialog.open(EntityItemListComponent, {
          type: 'fullscreen-translucent',
          props: {
            list: dialogList
          },
          customClass: 'app-dialog',
          flags: ['no-header'],
        });

        return {ok: true};
      },
      embeddedComponents: [
        this.tabComponent
      ],
      avoidGoingToNextStep: true,
      headerText: '',
      stepButtonInvalidText: '',
      stepButtonValidText: 'EJEMPLO AL COMPARTIRLO',
      headerMode: 'v2'
    },
    {
      hideHeader: true,
      hideMainStepCTA: true,
      fieldsList: [
        {
          name: 'email',
          fieldControl: {
            type: 'single',
            control: new FormControl('', Validators.required)
          },
          placeholder: '',
          label: 'CORREO ELECTRONICO',
          bottomLabel: {
            text: 'Adiciona otro como el celular, oficina, casa +',
            callback(...params) {
              console.log("click");
            },
          },
          styles: {
            labelStyles: {
              ...labelStyles,
              marginBottom: '24px',
              display: 'inline-block',
              backgroundImage: 'url(https://storage-rewardcharly.sfo2.digitaloceanspaces.com/new-assets/instagram-outline.svg)',
              backgroundRepeat: 'no-repeat',
              paddingLeft: '38px',
              backgroundPositionX: '8px',
            },
            bottomLabelStyles: {
              fontWeight: 'normal',
              fontSize: '14px',
              marginTop: '22px',
              color: '#27A2FC',
              fontFamily: 'SfProRegular',
              textAlign: 'right'
            },
            fieldStyles: {
              boxShadow: '0px 0px 4px 1px inset rgb(0 0 0 / 20%)',
              borderRadius: '22px'
            },
            containerStyles: {
              marginTop: '81px'
            }
          },
        },
        {
          name: 'phoneNumber',
          fieldControl: {
            type: 'single',
            control: new FormControl('', Validators.required)
          },
          placeholder: '',
          label: 'TELÉFONO',
          bottomLabel: {
            text: 'Adiciona otro como LinkedIn, Twitter, TikTok +',
            callback(...params) {
              console.log("click");
            },
          },
          styles: {
            labelStyles: {
              ...labelStyles,
              marginBottom: '24px',
              display: 'inline-block',
              backgroundImage: 'url(https://storage-rewardcharly.sfo2.digitaloceanspaces.com/new-assets/instagram-outline.svg)',
              backgroundRepeat: 'no-repeat',
              paddingLeft: '38px',
              backgroundPositionX: '8px',
            },
            bottomLabelStyles: {
              fontWeight: 'normal',
              fontSize: '14px',
              marginTop: '22px',
              color: '#27A2FC',
              fontFamily: 'SfProRegular',
              textAlign: 'right'
            },
            fieldStyles: {
              boxShadow: '0px 0px 4px 1px inset rgb(0 0 0 / 20%)',
              borderRadius: '22px'
            },
            containerStyles: {
              marginTop: '81px'
            }
          },
        },
        {
          name: 'address',
          fieldControl: {
            type: 'single',
            control: new FormControl('', Validators.required)
          },
          placeholder: '',
          label: 'DIRECCIÓN',
          styles: {
            labelStyles: {
              ...labelStyles,
              marginBottom: '24px',
              display: 'inline-block',
              backgroundImage: 'url(https://storage-rewardcharly.sfo2.digitaloceanspaces.com/new-assets/instagram-outline.svg)',
              backgroundRepeat: 'no-repeat',
              paddingLeft: '38px',
              backgroundPositionX: '8px',
            },
            fieldStyles: {
              boxShadow: '0px 0px 4px 1px inset rgb(0 0 0 / 20%)',
              borderRadius: '22px'
            },
            containerStyles: {
              marginTop: '81px',
              paddingBottom: '259px'
            }
          },
        },
      ],
      embeddedComponents: [
        this.tabComponent
      ],
      footerConfig: {
        ...this.footerConfig
      },
      customScrollToStepBackwards: (params) => {
        this.currentTab = 0;
        this.formSteps[2].embeddedComponents[0].inputs.activeTag = this.currentTab;
        this.currentStep = 0;
        this.currentStepString = '1';

        params.scrollToStep(0);
        window.scroll(0, 0);
      },
      avoidGoingToNextStep: true,
      headerText: '',
      stepButtonInvalidText: 'ADICIONA LA INFO DE LO QUE VENDES',
      stepButtonValidText: 'CONTINUAR CON LA ACTIVACIÓN',
      headerMode: 'v2'
    },
    {
      hideHeader: true,
      hideMainStepCTA: true,
      fieldsList: [
        {
          name: 'instagram',
          fieldControl: {
            type: 'single',
            control: new FormControl('')
          },
          placeholder: '',
          label: 'INSTAGRAM URL',
          styles: {
            labelStyles: {
              ...labelStyles,
              marginBottom: '24px',
              display: 'inline-block',
              backgroundImage: 'url(https://storage-rewardcharly.sfo2.digitaloceanspaces.com/new-assets/instagram-outline.svg)',
              backgroundRepeat: 'no-repeat',
              paddingLeft: '38px',
              backgroundPositionX: '8px',
            },
            fieldStyles: {
              boxShadow: '0px 0px 4px 1px inset rgb(0 0 0 / 20%)',
              borderRadius: '22px'
            },
            containerStyles: {
              marginTop: '107px'
            }
          },
        },
        {
          name: 'twitter',
          fieldControl: {
            type: 'single',
            control: new FormControl('')
          },
          placeholder: '',
          label: 'TWITTER',
          styles: {
            labelStyles: {
              ...labelStyles,
              marginBottom: '24px',
              display: 'inline-block',
              backgroundImage: 'url(https://storage-rewardcharly.sfo2.digitaloceanspaces.com/new-assets/instagram-outline.svg)',
              backgroundRepeat: 'no-repeat',
              paddingLeft: '38px',
              backgroundPositionX: '8px',
            },
            fieldStyles: {
              boxShadow: '0px 0px 4px 1px inset rgb(0 0 0 / 20%)',
              borderRadius: '22px'
            },
            containerStyles: {
              marginTop: '57px'
            }
          },
        },
        {
          name: 'linkedin',
          fieldControl: {
            type: 'single',
            control: new FormControl('')
          },
          placeholder: '',
          label: 'LINKED IN',
          styles: {
            labelStyles: {
              ...labelStyles,
              marginBottom: '24px',
              display: 'inline-block',
              backgroundImage: 'url(https://storage-rewardcharly.sfo2.digitaloceanspaces.com/new-assets/instagram-outline.svg)',
              backgroundRepeat: 'no-repeat',
              paddingLeft: '38px',
              backgroundPositionX: '8px',
            },
            fieldStyles: {
              boxShadow: '0px 0px 4px 1px inset rgb(0 0 0 / 20%)',
              borderRadius: '22px'
            },
            containerStyles: {
              marginTop: '57px'
            }
          },
        },
        {
          name: 'tiktok',
          fieldControl: {
            type: 'single',
            control: new FormControl('')
          },
          placeholder: '',
          label: 'TIKTOK',
          styles: {
            labelStyles: {
              ...labelStyles,
              marginBottom: '24px',
              display: 'inline-block',
              backgroundImage: 'url(https://storage-rewardcharly.sfo2.digitaloceanspaces.com/new-assets/instagram-outline.svg)',
              backgroundRepeat: 'no-repeat',
              paddingLeft: '38px',
              backgroundPositionX: '8px',
            },
            fieldStyles: {
              boxShadow: '0px 0px 4px 1px inset rgb(0 0 0 / 20%)',
              borderRadius: '22px'
            },
            containerStyles: {
              marginTop: '57px'
            }
          },
        },
        {
          name: 'facebook',
          fieldControl: {
            type: 'single',
            control: new FormControl('')
          },
          placeholder: '',
          label: 'FACEBOOK',
          styles: {
            labelStyles: {
              ...labelStyles,
              marginBottom: '24px',
              display: 'inline-block',
              backgroundImage: 'url(https://storage-rewardcharly.sfo2.digitaloceanspaces.com/new-assets/instagram-outline.svg)',
              backgroundRepeat: 'no-repeat',
              paddingLeft: '38px',
              backgroundPositionX: '8px',
            },
            fieldStyles: {
              boxShadow: '0px 0px 4px 1px inset rgb(0 0 0 / 20%)',
              borderRadius: '22px'
            },
            containerStyles: {
              marginTop: '57px',
              paddingBottom: '124px'
            }
          },
        },
      ],
      embeddedComponents: [
        this.tabComponent
      ],
      footerConfig: {
        ...this.footerConfig
      },
      customScrollToStepBackwards: (params) => {
        this.currentTab = 0;
        this.formSteps[2].embeddedComponents[0].inputs.activeTag = this.currentTab;
        this.currentStep = 0;
        this.currentStepString = '1';

        params.scrollToStep(0);
        window.scroll(0, 0);
      },
      avoidGoingToNextStep: true,
      headerText: '',
      stepButtonInvalidText: 'ADICIONA LA INFO DE LO QUE VENDES',
      stepButtonValidText: 'CONTINUAR CON LA ACTIVACIÓN',
      headerMode: 'v2'
    },
    {
      hideHeader: true,
      fieldsList: [
        {
          name: 'bankName',
          fieldControl: {
            type: 'single',
            control: new FormControl('', Validators.required)
          },
          label: 'NOMBRE DEL BANCO',
          placeholder: '',
          styles: {
            labelStyles: {
              ...labelStyles2,
              marginTop: '33px'
            },
            fieldStyles: commonFieldStyles,
            topLabelActionStyles: {
              fontFamily: 'Roboto',
              fontWeight: 'bold',
              fontSize: '24px',
              margin: '0px',
              marginTop: '37px',
              marginBottom: '47px',
            },
            containerStyles: commonFieldContainerStyles
          },
          topLabelAction: {
            text: '¿En cuál Banco Dominicano te harán la transferencia de los pagos?',
            clickable: true,
          },
        },
        {
          name: 'accountNumber',
          fieldControl: {
            type: 'single',
            control: new FormControl('', Validators.required)
          },
          label: 'NÚMERO DE CUENTA',
          inputType: 'number',
          placeholder: '',
          styles: {
            labelStyles: labelStyles2,
            fieldStyles: commonFieldStyles,
            containerStyles: commonFieldContainerStyles
          }
        },
        {
          name: 'owner',
          fieldControl: {
            type: 'single',
            control: new FormControl('', Validators.required)
          },
          label: 'TITULAR',
          placeholder: '',
          styles: {
            labelStyles: labelStyles2,
            fieldStyles: commonFieldStyles,
            containerStyles: commonFieldContainerStyles
          }
        },
        {
          name: 'socialID',
          fieldControl: {
            type: 'single',
            control: new FormControl('', Validators.required)
          },
          label: 'DOC. DE IDENTIDAD',
          inputType: 'number',
          placeholder: '',
          styles: {
            labelStyles: labelStyles2,
            fieldStyles: commonFieldStyles,
            containerStyles: {
              ...commonFieldContainerStyles,
              paddingBottom: '161px'
            }
          }
        },
      ],
      hideMainStepCTA: true,
      // embeddedComponents: [
      //   this.tabComponent
      // ],
      footerConfig: {
        ...this.footerConfig
      },
      customScrollToStepBackwards: (params) => {
        this.currentTab = 0;
        this.formSteps[1].embeddedComponents[0].inputs.activeTag = this.currentTab;
        this.currentStep = 1;
        this.currentStepString = '2';

        // params.scrollToStep(0);
        window.scroll(0, 0);
      },
      avoidGoingToNextStep: true,
      headerText: '',
      stepButtonInvalidText: 'ADICIONA LA INFO DE LO QUE VENDES',
      stepButtonValidText: 'CONTINUAR CON LA ACTIVACIÓN',
      headerMode: 'v2'
    },
  ];

  constructor(private dialog: DialogService) { }

  ngOnInit(): void {
    this.initValidatorsExclusiveToMerchantOrRegularUser()
  }

  initValidatorsExclusiveToMerchantOrRegularUser() {
    this.formSteps[0].fieldsList.forEach((field, index) => {
      if(index < 4 && !this.isMerchant) {
        field.fieldControl.control.setValidators(Validators.required);
      } else if ((index === 0 || (index > 3 && index < 6)) && this.isMerchant) {
        field.fieldControl.control.setValidators(Validators.required);
      }
    });
  }

  changeMerchant() {
    this.isMerchant = !this.isMerchant;

    this.formSteps[0].fieldsList.forEach((field, index) => {
      if(index > 0 && index < 4) {
        field.styles.containerStyles.display = !this.isMerchant ? 'inline-block' : 'none';
      } else if (index > 3 && index < 6) {
        field.styles.containerStyles.display = this.isMerchant ? 'block' : 'none';
      }
    })
    this.formSteps[0].optionalLinksTo.afterIndex = !this.isMerchant ? 3 : 5;
  }

}
