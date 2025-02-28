import { Component, OnInit } from '@angular/core';
import { FormField, FormStep } from 'src/app/core/types/multistep-form';
import { FormControl, Validators } from '@angular/forms';
import { PageComponentTabsComponent } from 'src/app/shared/components/page-component-tabs/page-component-tabs.component';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { EntityItemListComponent } from 'src/app/shared/dialogs/entity-item-list/entity-item-list.component';
import { EntityLists } from 'src/app/shared/dialogs/entity-item-list/entity-item-list.component';
import { FooterOptions } from 'src/app/core/types/multistep-form';
import { SwitchButtonComponent } from 'src/app/shared/components/switch-button/switch-button.component';
import { MultistepFormServiceService } from 'src/app/core/services/multistep-form-service.service';
import { Router } from '@angular/router';
import { HeaderService } from 'src/app/core/services/header.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { WalletService } from 'src/app/core/services/wallet.service';
import { base64ToFile } from 'src/app/core/helpers/files.helpers';
import { deleteIrrelevantDataFromObject } from 'src/app/core/helpers/objects.helpers';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { Location } from '@angular/common';

const labelStyles = {
  color: '#7B7B7B',
  fontFamily: 'RobotoMedium',
  fontSize: '17px',
  fontWeight: 500,
  margin: '0px',
  marginBottom: '20px'
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
      marginBottom: '58px',
      marginTop: '32px',
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

const tabsOptions = ["Recibir pagos", "Cuentas Sociales", "Contacto", "Bio", "Url"];

@Component({
  selector: 'app-user-creator',
  templateUrl: './user-creator.component.html',
  styleUrls: ['./user-creator.component.scss']
})
export class UserCreatorComponent implements OnInit {
  scrollableForm = false;
  isMerchant: boolean = false;
  multistepFormData: any = null;
  loggedIn: boolean = false;
  alreadyIsMerchant: boolean = false;
  userRequiredFields = {
    // userImage: false,
    name: false,
    // lastname: false,
    // subtext: false,
  };
  isClicked = false;
  merchantRequiredFields = {
    name: false,
    // userImage: false,
    businessName: false,
    // businessType: false
  }

  injectRequiredFunction(change: string, userType: 'both' | 'user' | 'merchant', propertyName: string) {
    if(change === null || change === '') {
      if(userType === 'both') {        
        this.userRequiredFields[propertyName] = false;
        this.merchantRequiredFields[propertyName] = false;
      } else if(userType === 'user') {        
        this.userRequiredFields[propertyName] = false;
      } else {        
        this.merchantRequiredFields[propertyName] = false;
      }
    } else {
      if(userType === 'both') {        
        this.userRequiredFields[propertyName] = true;
        this.merchantRequiredFields[propertyName] = true;
      } else if(userType === 'user') {        
        this.userRequiredFields[propertyName] = true;
      } else {        
        this.merchantRequiredFields[propertyName] = true;
      }
    }

    if(this.isMerchant) {
      let count = 0;
      const fields = Object.keys(this.merchantRequiredFields);
      fields.forEach(field => {
        count += this.merchantRequiredFields[field] ? 1 : 0;
      })

      if(count === fields.length) 
        this.formSteps[0].fieldsList[6].disabled = false;
      else
        this.formSteps[0].fieldsList[6].disabled = true;
    }

    if(!this.isMerchant) {
      let count = 0;
      const fields = Object.keys(this.userRequiredFields);
      fields.forEach(field => {
        count += this.userRequiredFields[field] ? 1 : 0;
      });

      if(count === fields.length)
        this.formSteps[0].fieldsList[6].disabled = false;
      else
        this.formSteps[0].fieldsList[6].disabled = true;
    }
  }

  footerConfig: FooterOptions = {
    bubbleConfig: {
      validStep: {
        left: { icon: '/arrow-left.svg', color: 'blue' },
        function: async (params) => {
          this.location.back();
        }
      },
      invalidStep: {
        left: { icon: '/arrow-left.svg', color: 'blue' },
        function: async (params) => {
          this.location.back();
        }
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

  tabsCallback(newTabName, params) {
    const newTabIndex = tabsOptions.findIndex(tabName => tabName === newTabName);
    
    if(newTabIndex === 0) {
      params.scrollToStep(1);
    } else if(newTabIndex === 2) {
      params.scrollToStep(2);
    } else if(newTabIndex === 1) {
      params.scrollToStep(3);
    } else if(newTabIndex === 3) {
      params.scrollToStep(5);
    } else if(newTabIndex === 4) {
      params.scrollToStep(6);
    };
  }

  //para casos de emergencia
  storeParams(params: any) {
    this.multistepFormData = params;
  }

  switchButton = {
    beforeIndex: 0,
    component: SwitchButtonComponent,
    inputs: {
      isClicked: this.isClicked,
      innerText: true,
      settings: {
        leftText: 'ES UN NEGOCIO?',
      },
      containerStyles: {
        paddingTop: '24px',
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
        callback: (params) => {
          this.changeMerchant();
        },
      }
    ]
  };

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
              marginTop: '16px'
            },
            labelStyles: {
              fontFamily: 'Roboto',
              fontWeight: 'bold',
              fontSize: '24px',
              color: '#2E2E2E',
              marginBottom: '24px',
            },
            subLabelStyles: {
              color: '#7B7B7B',
              fontFamily: 'RobotoMedium',
              fontSize: '17px',
              fontWeight: 500,
              marginBottom: '24px',
            },
            fieldStyles: {
              minWidth: '192px',
              maxHeight: '163px',
              width: 'calc((100% - 35px * 2) - 55.14%)',
              borderRadius: '7px'
            }
          },
          changeCallbackFunction: (change) => this.injectRequiredFunction(change, 'both', 'userImage')
        },
        {
          name: 'name',
          fieldControl: {
            type: 'single',
            control: new FormControl('')
          },
          label: 'Nombre(*)',
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
            },
            labelStyles: labelStyles,
          },
          changeCallbackFunction: (change) => this.injectRequiredFunction(change, 'both', 'name')
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
            },
            labelStyles: labelStyles,
          },
          changeCallbackFunction: (change) => this.injectRequiredFunction(change, 'user', 'lastname')
        },
        {
          name: 'subtext',
          fieldControl: {
            type: 'single',
            control: new FormControl('')
          },
          label: 'Titulo:',
          placeholder: 'Ej, CEO..',
          styles: {
            containerStyles: {
              display: !this.isMerchant ? 'inline-block' : 'none',
              marginTop: '60px',
            },
            fieldStyles: {
              maxWidth: '166px',
            },
            labelStyles: labelStyles,
          },
          changeCallbackFunction: (change) => this.injectRequiredFunction(change, 'user', 'subtext')
        },
        {
          name: 'businessName',
          fieldControl: {
            type: 'single',
            control: new FormControl('')
          },
          label: 'Nombre del negocio(*)',
          placeholder: 'Nombre del negocio es..',
          styles: {
            containerStyles: {
              display: this.isMerchant ? 'block' : 'none',
              marginTop: '60px'
              // width: '83.70%',
            },
            fieldStyles: {
              width: '100%',
            },
            labelStyles: labelStyles,
          },
          changeCallbackFunction: (change) => this.injectRequiredFunction(change, 'merchant', 'businessName')
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
            },
            labelStyles: labelStyles,
          },
        },
        injectSubmitButtom(async (params) => {
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

          const {
            facebook,
            twitter,
            tiktok,
            linkedin,
            instagram
          } = params.dataModel.get('4').value;

          const {
            bankName,
            accountNumber,
            owner,
            socialID
          } = params.dataModel.get('5').value;

          const {
            bio
          } = params.dataModel.get('6').value;

          const {
            websiteLink
          } = params.dataModel.get('7').value;

          this.formSteps[0].fieldsList[this.formSteps[0].fieldsList.length - 1].label = 'ESPERE...';

          const unformattedPhone = phoneNumber ? phoneNumber.e164Number.split('+')[1] : null;

          const socials = {
            facebook,
            twitter,
            tiktok,
            linkedin,
            instagram,
            phone: phoneNumber ? unformattedPhone : null,
            email: email ? email : null,
            location: address ? address : null,
            web: websiteLink
          };

          const bankInfo = {
            bankName,
            accountNumber,
            owner,
            socialID
          };

          this.multistepFormService.storeMultistepFormData('user-creation', this.formSteps, {
            isMerchant: this.isMerchant,
            userRequiredFields: this.userRequiredFields,
            merchantRequiredFields: this.merchantRequiredFields,
            businessName,
            businessType,
            lastname,
            name,
            submitButton,
            subtext,
            bio,
            userImage,
            venmo,
            paypal,
            cashapp,
            email,
            phoneNumber: unformattedPhone,
            address,
            socials,
            bankInfo
          });

          const checkIfStringIsBase64DataURI = (text: string)=> {
            return text.slice(0, 5) === 'data:';
          }
          
          if(!this.loggedIn) {
            this.router.navigate(['auth/authentication'], {queryParams: {
              type: 'create-user'
            }});
          } else {
            const socialsFiltered = Object.keys(socials).filter(socialNetworkKey => {
              return  (socials[socialNetworkKey] && socials[socialNetworkKey].length > 0) ? true : false;
            })
            .map(socialNetworkKey => ({
              name: socialNetworkKey,
              url: socials[socialNetworkKey]
            }));

            if(!this.isMerchant) {
              const userImageConverted = userImage.length > 0 ? (
                checkIfStringIsBase64DataURI(userImage) ? base64ToFile(userImage) : null
              ) : null;

              const updateMeInput =deleteIrrelevantDataFromObject({
                name,
                lastname,
                title: subtext,
                email: email,
                social: socialsFiltered,
                facebook: socials.facebook,
                instagram: socials.instagram,
                web: socials.web,
                bio,
              });

              const updatedUser = await this.authService.updateMe(updateMeInput, userImage ? userImageConverted : null);

              const exchangeData = await this.walletService.exchangeDataByUser(updatedUser._id);

              const exchangeDataInput = {
                electronicPayment: [
                  {
                    link: venmo,
                    name: 'venmo'
                  },
                  {
                    link: paypal,
                    name: 'paypal'
                  },
                  {
                    link: cashapp,
                    name: 'cashapp'
                  }
                ],
                bank: Object.keys(bankInfo).length > 3 ? [
                  {
                    bankName: bankInfo.bankName,
                    account: bankInfo.accountNumber,
                    isActive: true,
                    ownerAccount: bankInfo.owner,
                    routingNumber: Number(bankInfo.socialID)
                  }
                ] : null
              };

              if(updatedUser && exchangeDataInput) {
                const { bank, electronicPayment: electronicPaymentStored } = exchangeDataInput;
                const electronicPayment = [];
    
                electronicPaymentStored.forEach(paymentMethod => {
                  if(paymentMethod) {
                    electronicPayment.push({
                      name: paymentMethod.name,
                      link: paymentMethod.link
                    });
                  }
                })

                const exchangeDataMutationInput = deleteIrrelevantDataFromObject({
                  bank: [{
                    bankName: bank[0].bankName,
                    ownerAccount: bank[0].ownerAccount,
                    routingNumber: bank[0].routingNumber,
                    isActive: true,
                    account: bank[0].account
                  }],
                  electronicPayment
                });
    
                if(exchangeData) {
                  await this.walletService.updateExchangeData(exchangeDataMutationInput, exchangeData._id);
                } else {
                  await this.walletService.createExchangeData(exchangeDataMutationInput);    
                }
              }

              this.router.navigate([`/others/user-contact-landing/${updatedUser._id}`]);
            }

            if(this.isMerchant) {
              const defaultMerchant = await this.merchantsService.merchantDefault();
                    
              const merchantImageConverted = userImage.length > 0 ? (
                checkIfStringIsBase64DataURI(userImage) ? base64ToFile(userImage) : null
              ) : null;

              if(!defaultMerchant) {
                const createMerchantInput = deleteIrrelevantDataFromObject({
                  name: businessName,
                  title: subtext,
                  bio: bio,
                  activity: businessType,
                  social: socialsFiltered,
                  email,
                  instagram: socials.instagram,
                  facebook: socials.facebook,
                });

                if(!merchantImageConverted) createMerchantInput.image = 'https://www.gravatar.com/avatar/0?s=250&d=mp';

                const { createMerchant: createdMerchant } = await this.merchantsService.createMerchant(createMerchantInput, userImage ? merchantImageConverted : null);

                const { createSaleflow: createdSaleflow } = await this.saleflowsService.createSaleflow({
                  merchant: createdMerchant._id,
                  name: createdMerchant._id + " saleflow #" + Math.floor(Math.random() * 100000),
                  items: []
                });

                await this.merchantsService.setDefaultMerchant(createdMerchant._id);
                await this.saleflowsService.setDefaultSaleflow(createdMerchant._id, createdSaleflow._id);

                const exchangeData = await this.walletService.exchangeDataByUser(createdMerchant.owner._id);

                //se repite
                const exchangeDataInput = {
                  electronicPayment: [
                    {
                      link: venmo,
                      name: 'venmo'
                    },
                    {
                      link: paypal,
                      name: 'paypal'
                    },
                    {
                      link: cashapp,
                      name: 'cashapp'
                    }
                  ],
                  bank: Object.keys(bankInfo).length > 3 ? [
                    {
                      bankName: bankInfo.bankName,
                      account: bankInfo.accountNumber,
                      isActive: true,
                      ownerAccount: bankInfo.owner,
                      routingNumber: Number(bankInfo.socialID)
                    }
                  ] : null
                };
  
                if(createdMerchant && exchangeDataInput) {
                  const {bank, electronicPayment: electronicPaymentStored } = exchangeDataInput;
                  const electronicPayment = [];
      
                  electronicPaymentStored.forEach(paymentMethod => {
                    if(paymentMethod) {
                      electronicPayment.push({
                        name: paymentMethod.name,
                        link: paymentMethod.link
                      });
                    }
                  })

                  const exchangeDataMutationInput = deleteIrrelevantDataFromObject({
                    bank: [{
                      bankName: bank[0].bankName,
                      ownerAccount: bank[0].ownerAccount,
                      routingNumber: bank[0].routingNumber,
                      isActive: true,
                      account: bank[0].account
                    }],
                    electronicPayment
                  });
      
                  if(exchangeData) {
                    await this.walletService.updateExchangeData(exchangeDataMutationInput, exchangeData._id);
                  } else {
                    await this.walletService.createExchangeData(exchangeDataMutationInput);    
                  }
                }

                if(createdMerchant && createdSaleflow) {
                  this.router.navigate([`/others/user-contact-landing/${createdMerchant.owner._id}`]);
                }
              } else {
                const updateMeInput = deleteIrrelevantDataFromObject({
                  email: email,
                  name,
                  lastname,
                  title: subtext,
                  social: socialsFiltered,
                  facebook: socials.facebook,
                  instagram: socials.instagram,
                  web: socials.web,
                  bio,
                })

                const updatedUser = await this.authService.updateMe(updateMeInput, userImage ? merchantImageConverted : null);
                
                const updateMerchantInput = deleteIrrelevantDataFromObject({
                  name: businessName,
                  title: subtext,
                  bio: bio,
                  activity: businessType,
                  social: socialsFiltered,
                  email: email,
                  instagram: socials.instagram,
                  facebook: socials.facebook,
                });

                if(!merchantImageConverted) updateMerchantInput.image = 'https://www.gravatar.com/avatar/0?s=250&d=mp';

                const updatedMerchant = await this.merchantsService.updateMerchant(updateMerchantInput, defaultMerchant._id, userImage ? merchantImageConverted : null);

                const exchangeData = await this.walletService.exchangeDataByUser(defaultMerchant.owner._id);

                const exchangeDataInput = {
                  electronicPayment: [
                    {
                      link: venmo,
                      name: 'venmo'
                    },
                    {
                      link: paypal,
                      name: 'paypal'
                    },
                    {
                      link: cashapp,
                      name: 'cashapp'
                    }
                  ],
                  bank: Object.keys(bankInfo).length > 3 ? [
                    {
                      bankName: bankInfo.bankName,
                      account: bankInfo.accountNumber,
                      isActive: true,
                      ownerAccount: bankInfo.owner,
                      routingNumber: Number(bankInfo.socialID)
                    }
                  ] : null
                };
  
                if(updatedMerchant && exchangeDataInput) {
                  const {bank, electronicPayment: electronicPaymentStored } = exchangeDataInput;
                  const electronicPayment = [];
      
                  electronicPaymentStored.forEach(paymentMethod => {
                    if(paymentMethod) {
                      electronicPayment.push({
                        name: paymentMethod.name,
                        link: paymentMethod.link
                      });
                    }
                  })

                  const exchangeDataMutationInput = deleteIrrelevantDataFromObject({
                    bank: [{
                      bankName: bank[0].bankName,
                      ownerAccount: bank[0].ownerAccount,
                      routingNumber: bank[0].routingNumber,
                      isActive: true,
                      account: bank[0].account
                    }],
                    electronicPayment
                  });
      
                  if(exchangeData) {
                    await this.walletService.updateExchangeData(exchangeDataMutationInput, exchangeData._id);
                  } else {
                    await this.walletService.createExchangeData(exchangeDataMutationInput);    
                  }
                }

                if(updatedUser && updatedMerchant) {
                  this.router.navigate([`/others/user-contact-landing/${defaultMerchant.owner._id}`]);
                }
              }
            }
          }

          this.formSteps[0].fieldsList[this.formSteps[0].fieldsList.length - 1].label = 'SALVAR CONTACTO';

          this.headerService.flowRoute = this.router.url;
        })
      ],
      customScrollToStepBackwards: (params) => {
        this.location.back()
      },
      optionalLinksTo: {
        afterIndex: !this.isMerchant ? 3 : 5,
        groupOfLinksArray: [
          {
            topLabel: 'Contenido opcional',
            styles: {
              containerStyles: {
                marginTop: '60px',
                marginBottom: '32px'
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
                text: 'Contacto: Email, Telefonos, URL’s, Socials.',
                action: (params) => {
                  // this.currentTab = 2;
                  // this.formSteps[2].embeddedComponents[0].inputs.activeTag = this.currentTab;

                  // this.currentStep = 2;
                  // this.currentStepString = '3';

                  params.scrollToStep(2);
                  window.scroll(0, 0);
                }
              },
              {
                text: 'Pequeña descripción como tu Bio',
                action: (params) => {
                  params.scrollToStep(5);
                  window.scroll(0, 0);
                }
              },
              {
                text: 'Métodos de recibir pago',
                action: (params) => {
                  // this.currentStep = 1;
                  // this.currentStepString = '2';
                  params.scrollToStep(1);
                  window.scroll(0, 0);
                }
              },
            ]
          }
        ]
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
        this.switchButton
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
              marginTop: '52px'
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
              marginTop: '52px'
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
              marginTop: '52px'
            }
          },
        },
        injectSubmitButtom((params) => {
          params.scrollToStep(0);
          
          this.reinjectSwitchButtonAndMakeItFreeze(this.alreadyIsMerchant);

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
                marginTop: '32px',
                marginBottom: '32px'
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
          paddingTop: '24px',
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
        bubbleConfig: {
          ...this.footerConfig.bubbleConfig
        }
      },
      customScrollToStepBackwards: (params) => {
        params.scrollToStep(0);
        
        this.reinjectSwitchButtonAndMakeItFreeze(this.alreadyIsMerchant);

        window.scroll(0, 0);
      },
      stepProcessingFunction: () => {
        const paymentMethodIcons = {
          'PayPal': ''
        }

        const dialogList: EntityLists[] = [
          {
            name: !this.isMerchant && (
              this.formSteps[0].fieldsList[1].fieldControl.control.value !== ''
            ) ? this.formSteps[0].fieldsList[1].fieldControl.control.value :
              !this.isMerchant && (
                this.formSteps[0].fieldsList[1].fieldControl.control.value !== '' &&
                this.formSteps[0].fieldsList[2].fieldControl.control.value !== ''
              ) ? (
                this.formSteps[0].fieldsList[1].fieldControl.control.value
                  + ' ' + this.formSteps[0].fieldsList[2].fieldControl.control.value
                ) : this.isMerchant && this.formSteps[0].fieldsList[4].fieldControl.control.value !== '' ?
                    this.isMerchant && this.formSteps[0].fieldsList[4].fieldControl.control.value : '(NOMBRE)',
            title: (
                this.formSteps[1].fieldsList[0].fieldControl.control.value !== '' &&
                this.formSteps[1].fieldsList[1].fieldControl.control.value !== '' &&
                this.formSteps[1].fieldsList[2].fieldControl.control.value !== ''
              ) ? 'Selecciona el método de pago que te convenga:' : null,
            type: !this.isMerchant ? 'Usuario' : 'Tienda',
            isImageBase64: this.formSteps[0].fieldsList[0].fieldControl.control.value === '' ?
              false : true,
            image: this.formSteps[0].fieldsList[0].fieldControl.control.value !== '' ?
              this.formSteps[0].fieldsList[0].fieldControl.control.value : 
              '/user-default.png',
            shoudlAllowDeactivation: true,
            options: [
              {
                text: 'PayPal',
                icon: {
                  src: 'https://storage-rewardcharly.sfo2.digitaloceanspaces.com/new-assets/instagram-outline.svg',
                  alt: 'field.label',
                  width: 17,
                  height: 17
                },
                url: this.formSteps[1].fieldsList[0].fieldControl.control.value,
                active: this.formSteps[1].fieldsList[0].fieldControl.control.value !== ''
              },
              {
                text: 'Venmo',
                icon: {
                  src: 'https://storage-rewardcharly.sfo2.digitaloceanspaces.com/new-assets/instagram-outline.svg',
                  alt: 'field.label',
                  width: 17,
                  height: 17
                },
                url: this.formSteps[1].fieldsList[1].fieldControl.control.value,
                active: this.formSteps[1].fieldsList[1].fieldControl.control.value !== ''
              },
              {
                text: 'CashApp',
                icon: {
                  src: 'https://storage-rewardcharly.sfo2.digitaloceanspaces.com/new-assets/instagram-outline.svg',
                  alt: 'field.label',
                  width: 17,
                  height: 17
                },
                url: this.formSteps[1].fieldsList[2].fieldControl.control.value,
                active: this.formSteps[1].fieldsList[2].fieldControl.control.value !== ''
              },
              // {
              //   text: 'Transferencia a Banco',
              //   icon: {
              //     src: 'https://storage-rewardcharly.sfo2.digitaloceanspaces.com/new-assets/instagram-outline.svg',
              //     alt: 'field.label',
              //     width: 17,
              //     height: 17
              //   },
              //   url: ''
              // },
              // {
              //   text: 'Tarjeta de Crédito',
              //   icon: {
              //     src: 'https://storage-rewardcharly.sfo2.digitaloceanspaces.com/new-assets/instagram-outline.svg',
              //     alt: 'field.label',
              //     width: 17,
              //     height: 17
              //   },
              //   url: ''
              // },
              // {
              //   text: 'YoYo App',
              //   icon: {
              //     src: 'https://storage-rewardcharly.sfo2.digitaloceanspaces.com/new-assets/instagram-outline.svg',
              //     alt: 'field.label',
              //     width: 17,
              //     height: 17
              //   },
              //   url: ''
              // }
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
      showTabs: true,
      tabsOptions,
      currentTab: 0,
      tabsCallback: this.tabsCallback,
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
              marginTop: '12px',
              color: '#27A2FC',
              fontFamily: 'SfProRegular',
              textAlign: 'right'
            },
            fieldStyles: {
              boxShadow: '0px 0px 4px 1px inset rgb(0 0 0 / 20%)',
              borderRadius: '22px'
            },
            containerStyles: {
              marginTop: '35px'
            }
          },
        },
        {
          name: 'phoneNumber',
          fieldControl: {
            type: 'single',
            control: new FormControl('', Validators.required)
          },
          placeholder: 'Escribe tu número de teléfono',
          label: 'TELÉFONO',
          inputType: 'phone',
          cssClass: 'second-style',
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
              marginTop: '12px',
              color: '#27A2FC',
              fontFamily: 'SfProRegular',
              textAlign: 'right'
            },
            fieldStyles: {
              boxShadow: '0px 0px 4px 1px inset rgb(0 0 0 / 20%)',
              borderRadius: '22px'
            },
            containerStyles: {
              marginTop: '74px'
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
              marginTop: '74px',
              paddingBottom: '80px'
            }
          },
        },
      ],
      showTabs: true,
      tabsOptions,
      currentTab: 2,
      tabsCallback: this.tabsCallback,
      footerConfig: {
        ...this.footerConfig
      },
      customScrollToStepBackwards: (params) => {
        params.scrollToStep(0);
        
        this.reinjectSwitchButtonAndMakeItFreeze(this.alreadyIsMerchant);

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
              marginTop: '52px'
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
              marginTop: '52px'
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
              marginTop: '52px'
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
              marginTop: '52px'
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
              marginTop: '52px',
              paddingBottom: '80px'
            }
          },
        },
      ],
      showTabs: true,
      tabsOptions,
      currentTab: 1,
      tabsCallback: this.tabsCallback,
      footerConfig: {
        ...this.footerConfig
      },
      customScrollToStepBackwards: (params) => {
        params.scrollToStep(0);
        
        this.reinjectSwitchButtonAndMakeItFreeze(this.alreadyIsMerchant);

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
        params.scrollToStep(0);
        
        this.reinjectSwitchButtonAndMakeItFreeze(this.alreadyIsMerchant);

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
          name: 'bio',
          label: 'ESCRIBE EL BIO',
          inputType: 'textarea',
          fieldControl: {
            type: 'single',
            control: new FormControl('', Validators.required)
          },
          placeholder: '',
          styles: {
            containerStyles: {
              marginTop: '35px'
            },
            labelStyles: {
              ...labelStyles
            },
            fieldStyles: {
              borderRadius: '15px',
              padding: '23px 26px 23px 16px',
              background: 'white',
              height: '177px'
            },
          },
        },
      ],
      showTabs: true,
      tabsOptions,
      currentTab: 3,
      tabsCallback: this.tabsCallback,
      footerConfig: {
        ...this.footerConfig
      },
      customScrollToStepBackwards: (params) => {
        params.scrollToStep(0);
        
        this.reinjectSwitchButtonAndMakeItFreeze(this.alreadyIsMerchant);

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
          name: 'websiteLink',
          label: 'PASTE EL LINK DE TU SITIO WEB',
          fieldControl: {
            type: 'single',
            control: new FormControl('', Validators.required)
          },
          placeholder: '',
          styles: {
            labelStyles: {
              ...labelStyles,
              marginTop: '35px'
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
          },
        },
      ],
      showTabs: true,
      tabsOptions,
      currentTab: 4,
      tabsCallback: this.tabsCallback,
      footerConfig: {
        ...this.footerConfig
      },
      customScrollToStepBackwards: (params) => {
        params.scrollToStep(0);
        
        this.reinjectSwitchButtonAndMakeItFreeze(this.alreadyIsMerchant);

        window.scroll(0, 0);
      },
      avoidGoingToNextStep: true,
      headerText: '',
      stepButtonInvalidText: 'ADICIONA LA INFO DE LO QUE VENDES',
      stepButtonValidText: 'CONTINUAR CON LA ACTIVACIÓN',
      headerMode: 'v2'
    },
  ];

  constructor(
    private dialog: DialogService,
    private multistepFormService: MultistepFormServiceService,
    private router: Router,
    private headerService: HeaderService,
    private authService: AuthService,
    private saleflowsService: SaleFlowService,
    private merchantsService: MerchantsService,
    private walletService: WalletService,
    private location: Location
  ) { }

  async ngOnInit() {
    const storedData = this.multistepFormService.getMultiStepFormData('user-creation');
    let myUser;
    let myMerchant;

    if(storedData) {
      this.formSteps = storedData.reference;
      this.isClicked = storedData.essentialData.isMerchant;

      this.reinjectSwitchButtonAndMakeItFreeze(this.alreadyIsMerchant);

      this.isMerchant = storedData.essentialData.isMerchant;
      this.userRequiredFields = storedData.essentialData.userRequiredFields;
      this.merchantRequiredFields = storedData.essentialData.merchantRequiredFields;
      this.multistepFormService.removeMultiStepFormData('user-creation');
    }

    if(localStorage.getItem('session-token'))
      myUser = await this.authService.me();

    if(myUser) {
      this.loggedIn = true;
      myMerchant = await this.merchantsService.merchantDefault(myUser._id);

      //Sets up user basic data
      this.formSteps[0].fieldsList[0].fieldControl.control.setValue(myUser.image ? myUser.image : '');
      this.formSteps[0].fieldsList[1].fieldControl.control.setValue(myUser.name ? myUser.name : '');
      this.formSteps[0].fieldsList[2].fieldControl.control.setValue(myUser.lastname ? myUser.lastname : '');
      this.formSteps[0].fieldsList[3].fieldControl.control.setValue(myUser.title ? myUser.title : '');

      if(myMerchant) {
        this.formSteps[0].fieldsList[0].fieldControl.control.setValue(myMerchant.image ? myMerchant.image : '');
        this.formSteps[0].fieldsList[3].fieldControl.control.setValue(myMerchant.title ? myMerchant.title : '');

        this.formSteps[0].fieldsList[4].fieldControl.control.setValue(myMerchant.name ? myMerchant.name : '');
        this.formSteps[0].fieldsList[5].fieldControl.control.setValue(myMerchant.activity ? myMerchant.activity : '');
      }

      if(myMerchant) {
        this.reinjectSwitchButtonAndMakeItFreeze(true);
      }

      const exchangeData = await this.walletService.exchangeDataByUser(myUser._id);
      let bankData;
      let electronicPayments;

      if(exchangeData) {
        bankData = exchangeData.bank;
        electronicPayments = exchangeData.electronicPayment;
      }

      //Sets up electronic payment data
      if(electronicPayments && electronicPayments.length > 0) {
        for(let electronicPayment of electronicPayments) {
          const electronicPaymentHashTable = {
            paypal: 0,
            venmo: 1,
            cashapp: 2
          }

          if(this.formSteps[1].fieldsList[
            electronicPaymentHashTable[electronicPayment.name]
          ]) {
            this.formSteps[1].fieldsList[
              electronicPaymentHashTable[electronicPayment.name]
            ].fieldControl.control.setValue(electronicPayment.link);
          }
        }
      }

      const location = myUser.social.find(social => social.name === 'location');

      //Sets up contact data
      this.formSteps[2].fieldsList[0].fieldControl.control.setValue(myUser.email ? myUser.email : '');
      this.formSteps[2].fieldsList[2].fieldControl.control.setValue(location ? location.url : '');

      const socialsObject = {};

      myUser.social.forEach(social => {
        socialsObject[social.name] = social.url
      });

      this.formSteps[3].fieldsList[0].fieldControl.control.setValue(socialsObject['instagram'] ? socialsObject['instagram'] : '');
      this.formSteps[3].fieldsList[1].fieldControl.control.setValue(socialsObject['twitter'] ? socialsObject['twitter'] : '');
      this.formSteps[3].fieldsList[2].fieldControl.control.setValue(socialsObject['linkedin'] ? socialsObject['linkedin'] : '');      
      this.formSteps[3].fieldsList[3].fieldControl.control.setValue(socialsObject['tiktok'] ? socialsObject['tiktok'] : '');      
      this.formSteps[3].fieldsList[4].fieldControl.control.setValue(socialsObject['facebook'] ? socialsObject['facebook'] : '');      

      if(exchangeData) {
        this.formSteps[4].fieldsList[0].fieldControl.control.setValue(bankData[0].bankName ? bankData[0].bankName : '');
        this.formSteps[4].fieldsList[1].fieldControl.control.setValue(bankData[0].account ? bankData[0].account : '');
        this.formSteps[4].fieldsList[2].fieldControl.control.setValue(bankData[0].ownerAccount ? bankData[0].ownerAccount : '');
        this.formSteps[4].fieldsList[3].fieldControl.control.setValue(bankData[0].routingNumber ? bankData[0].routingNumber : '');
      }

      this.formSteps[5].fieldsList[0].fieldControl.control.setValue(myUser.bio ? myUser.bio : '');
      
      this.formSteps[6].fieldsList[0].fieldControl.control.setValue(socialsObject['web'] ? socialsObject['web'] : '');
    }
    
  }

  changeMerchant() {
    if(!(this.alreadyIsMerchant && this.loggedIn)) {
      this.isMerchant = !this.isMerchant;

      let userRequiredExclusiveFields = 1;
      let merchantRequiredExclusiveFields = 2;
      let requiredFieldsCount = 0;
  
      this.formSteps[0].fieldsList.forEach((field, index) => {
        if (index > 3 && index < 6) {
          field.styles.containerStyles.display = this.isMerchant ? 'block' : 'none';
        }
  
        // if(!this.isMerchant && [0, 1, 2, 3].includes(index)) 
        // {
        //   requiredFieldsCount += this.formSteps[0].fieldsList[index].fieldControl.control.value === '' ? 0 : 1;
  
        //   this.formSteps[0].fieldsList[6].disabled = requiredFieldsCount === userRequiredExclusiveFields ? false : true;
        // }

        if(!this.isMerchant && [1].includes(index)) 
        {
          requiredFieldsCount += this.formSteps[0].fieldsList[index].fieldControl.control.value === '' ? 0 : 1;
  
          this.formSteps[0].fieldsList[6].disabled = requiredFieldsCount === userRequiredExclusiveFields ? false : true;
        }
  
        // if(this.isMerchant && [0, 4, 5].includes(index)) 
        // { 
        //   requiredFieldsCount += this.formSteps[0].fieldsList[index].fieldControl.control.value === '' ? 0 : 1;
  
        //   this.formSteps[0].fieldsList[6].disabled = requiredFieldsCount === merchantRequiredExclusiveFields ? false : true;
        // }

        if(this.isMerchant && [1, 4].includes(index)) 
        { 
          requiredFieldsCount += this.formSteps[0].fieldsList[index].fieldControl.control.value === '' ? 0 : 1;
  
          this.formSteps[0].fieldsList[6].disabled = requiredFieldsCount === merchantRequiredExclusiveFields ? false : true;
        }
      })
  
      this.formSteps[0].optionalLinksTo.afterIndex = !this.isMerchant ? 3 : 5;
      this.isClicked = !this.isClicked;
    }
  }

  reinjectSwitchButtonAndMakeItFreeze(freezeInMerchantMode: boolean = false) {
    this.formSteps[0].embeddedComponents = [];  
    
    if(!this.alreadyIsMerchant && freezeInMerchantMode) {
      this.changeMerchant(); 
      this.alreadyIsMerchant = true;
    }
    this.formSteps[0].embeddedComponents[0] = {
      beforeIndex: 0,
      component: SwitchButtonComponent,
      inputs: {
        isClicked: this.isClicked,
        innerText: true,
        blockClickEvent: freezeInMerchantMode,
        settings: {
          leftText: 'ES UN NEGOCIO?',
        },
        containerStyles: {
          paddingTop: '24px',
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
          callback: (params) => {
            this.changeMerchant();
          },
        }
      ]
    };
  }
}
