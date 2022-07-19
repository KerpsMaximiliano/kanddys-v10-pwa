import { Component, OnInit } from '@angular/core';
import { FormStep, FooterOptions, FormField } from 'src/app/core/types/multistep-form';
import { FormControl, Validators } from '@angular/forms';
import { AuthService } from 'src/app/core/services/auth.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { UsersService } from 'src/app/core/services/users.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HeaderService } from 'src/app/core/services/header.service';
import { MultistepFormServiceService, MultistepFormStorage } from 'src/app/core/services/multistep-form-service.service';
import { base64ToFile } from 'src/app/core/helpers/files.helpers';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { GeneralFormSubmissionDialogComponent } from 'src/app/shared/dialogs/general-form-submission-dialog/general-form-submission-dialog.component';
import { deleteIrrelevantDataFromObject } from 'src/app/core/helpers/objects.helpers';

const checkIfStringIsBase64DataURI = (text: string)=> {
  return text.slice(0, 5) === 'data:';
}

const defaultUserImage = 'https://www.gravatar.com/avatar/0?s=250&d=mp';              

@Component({
  selector: 'app-authentication',
  templateUrl: './authentication.component.html',
  styleUrls: ['./authentication.component.scss']
})
export class Authentication implements OnInit {
  scrollableForm: boolean = false;
  itemId: string;
  storedFormData: MultistepFormStorage;
  type: string;

  footerConfig: FooterOptions = {
    bubbleConfig: {
      validStep: {
        left: { icon: '/arrow-left.svg', color: 'yellow' },
        function: async (params) => {
        }
      },
      invalidStep: {
        left: { icon: '/arrow-left.svg', color: 'yellow' },
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
          name: 'phoneNumber',
          fieldControl: {
            type: 'single',
            control: new FormControl('', Validators.required)
          },
          label: '¿En cuál o cuáles # de WhatsApp recibirás las notificaciones de las ordenes?',
          inputType: 'phone',
          styles: {
            containerStyles: {
              marginTop: '38px',
            },
            labelStyles: {
              fontFamily: 'Roboto',
              fontWeight: 'bold',
              fontSize: '24px',
              margin: '0px',
              marginTop: '48px',
              marginBottom: '27px',
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
        {
          name: 'submit-button',
          fieldControl: {
            type: 'single',
            control: new FormControl(true)
          },
          hovered: false,
          inputType: 'button',
          label: '',
          bottomLabel: {
            text: 'Recibirás un mensaje con el link de acceso para compartirlo o editarlo.',
            clickable: false
          },
          callbackOnClick: null,
          disabled: true,
          styles: {
            containerStyles: {
              margin: '0px',
              marginTop: '46px',
            },
            bottomLabelStyles: {
              color: 'black',
              fontSize: '19px',
              fontWeight: '500',
              fontFamily: 'RobotoLight',
              margin: '0px 27px',
              marginTop: '39px',
              cursor: 'default'
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
          }
        }
      ],
      asyncStepProcessingFunction: {
        type: 'promise',
        function: async (params) => {
          try {
            const phoneNumber = params.dataModel.get('1').value.phoneNumber.e164Number.split('+')[1];

            try {
              if(this.type === 'create-item') {
                await this.authService.generateMagicLink(phoneNumber, `ecommerce/item-display`, this.itemId, 'NewItem', null);
                params.scrollToStep(1);

                return { ok: true };
              } else if(!this.type) {
                const myUser = await this.authService.checkUser(phoneNumber);
                params.scrollToStep(1);

                if(myUser) {
                  await this.authService.generateMagicLink(phoneNumber, `ecommerce/entity-detail-metrics`, myUser._id , 'MerchantAccess', null);
                }

                return { ok: true };
              }
            } catch (error) {
              console.log(error);

              return { ok: false };
            }
          } catch (error) {
            console.log(error);
            return { ok: false };
          }
        }
      },
      statusChangeCallbackFunction: (change) => {
        if(change === 'VALID')
          this.formSteps[0].fieldsList[1].disabled = false;
        else
          this.formSteps[0].fieldsList[1].disabled = true;
      },
      customScrollToStepBackwards: (params) => {
        // console.log("FLOW ROUTE", this.headerService.flowRoute);
        if (this.headerService.flowRoute)
          this.router.navigate([this.headerService.flowRoute]);
      },
      headerText: "",
      stepButtonValidText: "RECIBE UN LINK PARA CONFIRMAR LOS ACCESOS",
      stepButtonInvalidText: "ESCRIBE LOS CONTACTOS CON ACCESO DE ADMIN",
      headerMode: 'v2',
      footerConfig: {
        ...this.footerConfig,
      },
      avoidGoingToNextStep: true,
      customStickyButton: {
        text: 'POSIBILIDADES',
        text2: '',
        bgcolor: '#2874AD',
        bgcolorInactive: '#2874AD',
        color: '#E9E371',
        colorInactive: '#E9E371',
        height: '30px',
        heightInactive: '30px',
        mode: 'double',
      },
      hideMainStepCTA: true
    },
    {
      fieldsList: [],
      pageHeader: {
        text: 'Magik-Link con acceso a compartir, vender y editar el item fue enviado!!',
        styles: {
          fontFamily: 'Roboto',
          fontWeight: 'bold',
          fontSize: '24px',
          margin: '0px',
          marginTop: '48px'
        }
      },
      customScrollToStepBackwards: (params) => {
        console.log("FLOW ROUTE", this.headerService.flowRoute);
        if (this.headerService.flowRoute)
          this.router.navigate([this.headerService.flowRoute]);
      },
      pageSubHeader: {
        text: 'Puedes continuar desde el Magik-Link que recibiste por WhatsApp.',
        styles: {
          fontFamily: 'Roboto',
          fontWeight: '200',
          fontSize: '19px',
          margin: '0px',
          marginTop: '24px',
        }
      },
      headerText: "",
      headerMode: 'v2',
      footerConfig: {
        ...this.footerConfig,
      },
      avoidGoingToNextStep: true,
      customStickyButton: {
        text: 'POSIBILIDADES',
        text2: '',
        bgcolor: '#2874AD',
        color: '#E9E371',
        mode: 'double',
        height: '30px'
      },
      hideMainStepCTA: true
    }
  ];

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private headerService: HeaderService,
    private multistepService: MultistepFormServiceService,
    private merchantService: MerchantsService,
    private saleflowService: SaleFlowService,
    private dialog: DialogService,
    private usersService: UsersService
  ) {
  }

  ngOnInit(): void {
    this.route.params.subscribe(async (params) => {
      this.route.queryParams.subscribe(queryParams => {
        const {type} = queryParams;

        if(type && type.length > 0) this.type = type;

        if(type === 'create-user') {
          this.storedFormData = this.multistepService.getMultiStepFormData('user-creation');

          if(!this.storedFormData) this.router.navigate(['ecommerce/error-screen']);

          this.formSteps[0].fieldsList[0].label = '¿En cuál # de WhatsApp guardarás el contacto?';
          this.formSteps[0].fieldsList[0].bottomLabel = {
            text: 'Otras maneras de guardar >',
            clickable: true,
            callback: () => {
              console.log('Se ha clickeado el callback');
            },            
          };
          this.formSteps[0].stepButtonValidText = 'SALVAR LO GUARDADO';
          this.formSteps[0].stepButtonInvalidText = 'SALVAR LO GUARDADO';
          this.formSteps[0].asyncStepProcessingFunction = {
            type: 'promise',
            function: async (params) => {
          
                const { essentialData } = this.storedFormData;
                const { 
                  isMerchant,
                  businessName,
                  businessType,
                  lastname,
                  name,
                  submitButton,
                  subtext,
                  userImage,
                  venmo,
                  paypal,
                  bio,
                  cashapp,
                  email,
                  socials,
                  bankInfo,
                  phoneNumber,
                  address
                } = essentialData;

  
                if(!isMerchant) {
                  const phoneNumber = params.dataModel.get('1').value.phoneNumber.e164Number.split('+')[1];
                  
                  const foundUser = await this.authService.checkUser(phoneNumber);

                  if(!foundUser) {
                    const socialsFiltered = Object.keys(socials).filter(socialNetworkKey => {
                      return (socials[socialNetworkKey] && socials[socialNetworkKey].length > 0) ? true : false;
                    })
                    .map(socialNetworkKey => ({
                      name: socialNetworkKey,
                      url: socials[socialNetworkKey]
                    }));
                    
                    const createdUser = await this.authService.signup({
                      phone: phoneNumber,
                      email: email && email.length > 0 ? email : null,
                      name,
                      lastname,
                      title: subtext,
                      bio,
                      social: socialsFiltered
                    }, 'none', null, true, userImage ? (
                      checkIfStringIsBase64DataURI(userImage) ? base64ToFile(userImage) : null
                    ) : null);


                    const magicLinkCreated = await this.authService.generateMagicLink(
                      createdUser.phone, 
                      "/ecommerce/user-contact-landing",
                      createdUser._id,
                      'NewUser',
                      {
                        type: 'from-user-creation',
                        jsondata: JSON.stringify({
                          exchangeData: {
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
                          }
                        })
                      }  
                    );

                    if(!createdUser || !magicLinkCreated) {
                      this.dialog.open(GeneralFormSubmissionDialogComponent, {
                        type: 'centralized-fullscreen',
                        props: {
                          icon: 'sadFace.svg',
                          message: 'Ocurrió un problema'
                        },
                        customClass: 'app-dialog',
                        flags: ['no-header'],
                      });
                    } else {
                      params.scrollToStep(1);
                    }
                  } else {
                    console.log("!founduser");
                    const userImageConverted = userImage.length > 0 ? (
                      checkIfStringIsBase64DataURI(userImage) ? base64ToFile(userImage) : null
                    ) : null;
                    const socialsFiltered = Object.keys(socials).filter(socialNetworkKey => {
                      return (socials[socialNetworkKey] && socials[socialNetworkKey].length > 0) ? true : false;
                    })
                    .map(socialNetworkKey => ({
                      name: socialNetworkKey,
                      url: socials[socialNetworkKey]
                    }));

                    const magicLinkCreated = await this.authService.generateMagicLink(
                      phoneNumber,
                      '/ecommerce/user-contact-landing',
                      foundUser._id,
                      'UserUpdate',
                      {
                        type: 'from-user-creation-update',
                        jsondata: JSON.stringify({
                          email: email && email.length > 0 ? email : null,
                          name,
                          lastname,
                          title: subtext,
                          social: socialsFiltered,
                          bio,
                          facebook: socials.facebook,
                          instagram: socials.instagram,
                          exchangeData: {
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
                          }
                        }),
                      },
                      userImageConverted ?
                      [
                        userImageConverted
                      ] : null
                    );

                    if(!magicLinkCreated) {
                      this.dialog.open(GeneralFormSubmissionDialogComponent, {
                        type: 'centralized-fullscreen',
                        props: {
                          icon: 'sadFace.svg',
                          message: 'Ocurrió un problema'
                        },
                        customClass: 'app-dialog',
                        flags: ['no-header'],
                      });
                    } else {
                      params.scrollToStep(1);
                    }
                  }
  
                  // await this.authService.generateMagicLink(phoneNumber, `ecommerce/user-contact-landing/`, null, 'NewUser', {
  
                  // });                              
                } 

                if(isMerchant) {
                  const phoneNumber = params.dataModel.get('1').value.phoneNumber.e164Number.split('+')[1];
                  
                  const foundUser = await this.authService.checkUser(phoneNumber);

                  const socialsFiltered = Object.keys(socials).filter(socialNetworkKey => {
                    return (socials[socialNetworkKey] && socials[socialNetworkKey].length > 0) ? true : false;
                  })
                  .map(socialNetworkKey => ({
                    name: socialNetworkKey,
                    url: socials[socialNetworkKey]
                  }));

                  if(!foundUser) {
                    const createdUser = await this.authService.signup({
                      email: email && email.length > 0 ? email : null,
                      name,
                      lastname,
                      phone: phoneNumber,
                      title: subtext,
                      bio,
                      social: socialsFiltered
                    }, 'none', null, true, userImage ? (
                      checkIfStringIsBase64DataURI(userImage) ? base64ToFile(userImage) : null
                    ) : null);

                    
                    const merchantImageConverted = userImage ? (
                      checkIfStringIsBase64DataURI(userImage) ? base64ToFile(userImage) : null
                    ) : null;

                    const createMerchantInput = deleteIrrelevantDataFromObject({
                      name: businessName,
                      title: subtext,
                      bio,
                      activity: businessType,
                      social: socialsFiltered,
                      email,
                      instagram: socials.instagram,
                      facebook: socials.facebook,
                    });

                    if(!merchantImageConverted) createMerchantInput.image = 'https://www.gravatar.com/avatar/0?s=250&d=mp';
                    
                    const { createMerchant: createdMerchant } = await this.merchantService.createMerchant(createMerchantInput, userImage ? merchantImageConverted : null);

                    const magicLinkCreated = await this.authService.generateMagicLink(
                      createdUser.phone, 
                      "/ecommerce/user-contact-landing",
                      createdUser._id,
                      'NewMerchant',
                      {
                        type: 'from-merchant-creation',
                        merchantId: createdMerchant._id,
                        venmo,
                        paypal,
                        cashapp,
                        bankName: bankInfo.bankName,
                        accountNumber: bankInfo.accountNumber,
                        ownerAccount: bankInfo.owner,
                        socialID: bankInfo.socialID
                      }  
                    );

                    if(!magicLinkCreated || !createdUser) {
                      this.dialog.open(GeneralFormSubmissionDialogComponent, {
                        type: 'centralized-fullscreen',
                        props: {
                          icon: 'sadFace.svg',
                          message: 'Ocurrió un problema'
                        },
                        customClass: 'app-dialog',
                        flags: ['no-header'],
                      });
                    } else {
                      params.scrollToStep(1);
                    }
                  } else {
                    const defaultMerchant = await this.merchantService.merchantDefault();
                    
                    const merchantImageConverted = userImage.length > 0 ? (
                      checkIfStringIsBase64DataURI(userImage) ? base64ToFile(userImage) : null
                    ) : null;
                    const socialsFiltered = Object.keys(socials).filter(socialNetworkKey => {
                      return (socials[socialNetworkKey] && socials[socialNetworkKey].length > 0) ? true : false;
                    })
                    .map(socialNetworkKey => ({
                      name: socialNetworkKey,
                      url: socials[socialNetworkKey]
                    }));

                    if(!defaultMerchant) {
                      const createMerchantInput = deleteIrrelevantDataFromObject({
                        name: businessName,
                        title: subtext,
                        bio,
                        activity: businessType,
                        social: socialsFiltered,
                        email,
                        instagram: socials.instagram,
                        facebook: socials.facebook,
                      });
  
                      if(!merchantImageConverted) createMerchantInput.image = 'https://www.gravatar.com/avatar/0?s=250&d=mp';

                      const { createMerchant: createdMerchant } = await this.merchantService.createMerchant(createMerchantInput, userImage ? merchantImageConverted : null);
                      
                      const magicLinkCreated = await this.authService.generateMagicLink(
                        phoneNumber, 
                        "/ecommerce/user-contact-landing",
                        foundUser._id,
                        'NewMerchantToExistingUser',
                        {
                          type: 'from-merchant-creation-user-exists',
                          merchantId: createdMerchant._id,
                          jsondata: JSON.stringify({
                            userData: {
                              phone: phoneNumber,
                              email: email && email.length > 0 ? email : null,
                              social: socialsFiltered,
                              instagram: socials.instagram,
                              facebook: socials.facebook
                            },
                            exchangeData: {
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
                              bank: [
                                {
                                  bankName: bankInfo.bankName,
                                  account: bankInfo.accountNumber,
                                  isActive: true,
                                  ownerAccount: bankInfo.owner,
                                  routingNumber: Number(bankInfo.socialID)
                                }
                              ]
                            }
                          })
                        }
                      );

                      if(!createdMerchant || !magicLinkCreated) {
                        this.dialog.open(GeneralFormSubmissionDialogComponent, {
                          type: 'centralized-fullscreen',
                          props: {
                            icon: 'sadFace.svg',
                            message: 'Ocurrió un problema'
                          },
                          customClass: 'app-dialog',
                          flags: ['no-header'],
                        });
                      } else {
                        params.scrollToStep(1);
                      }
                    } else {
                      const magicLinkCreated = await this.authService.generateMagicLink(
                        phoneNumber, 
                        "/ecommerce/user-contact-landing",
                        foundUser._id,
                        'UpdateExistingMerchant',
                        {
                          type: 'update-merchant',
                          merchantId: defaultMerchant._id,
                          jsondata: JSON.stringify({
                            userData: {
                              name: businessName,
                              phone: phoneNumber,
                              email: email && email.length > 0 ? email : null,
                              social: socialsFiltered,
                              instagram: socials.instagram,
                              facebook: socials.facebook
                            },
                            merchantData: {
                              name: businessName,
                              email: email && email.length > 0 ? email : null,
                              // bio: businessType,
                              title: subtext,
                              image: !merchantImageConverted ? 'https://www.gravatar.com/avatar/0?s=250&d=mp' : null,
                              activity: businessType,
                              social: socialsFiltered,
                              instagram: socials.instagram,
                              facebook: socials.facebook
                            },
                            exchangeData: {
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
                            }
                          })
                        },
                        merchantImageConverted ? [
                          merchantImageConverted
                        ] : null
                      );

                      if(!magicLinkCreated) {
                        this.dialog.open(GeneralFormSubmissionDialogComponent, {
                          type: 'centralized-fullscreen',
                          props: {
                            icon: 'sadFace.svg',
                            message: 'Ocurrió un problema'
                          },
                          customClass: 'app-dialog',
                          flags: ['no-header'],
                        });
                      } else {
                        params.scrollToStep(1);
                      }
                    }
                  }
                }
              
            }
          }
        } else if (type === 'create-item') {
          if (params.itemId) {
            this.itemId = params.itemId;
          }
        } else {

        }
      })
    })
  }

}
