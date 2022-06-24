import { Component, OnInit } from '@angular/core';
import { FormStep, FooterOptions, FormField } from 'src/app/core/types/multistep-form';
import { FormControl, Validators } from '@angular/forms';
import { AuthService } from 'src/app/core/services/auth.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HeaderService } from 'src/app/core/services/header.service';
import { MultistepFormServiceService, MultistepFormStorage } from 'src/app/core/services/multistep-form-service.service';
import { base64ToFile } from 'src/app/core/helpers/files.helpers';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { GeneralFormSubmissionDialogComponent } from 'src/app/shared/dialogs/general-form-submission-dialog/general-form-submission-dialog.component';

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

            await this.authService.generateMagicLink(phoneNumber, `ecommerce/item-display`, this.itemId, 'NewItem', null);

            return { ok: true };
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
        console.log("FLOW ROUTE", this.headerService.flowRoute);
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
    private dialog: DialogService
  ) {
  }

  ngOnInit(): void {
    this.route.params.subscribe(async (params) => {
      this.route.queryParams.subscribe(queryParams => {
        const {type} = queryParams;

        if(type === 'create-user') {
          this.type = type;
          this.storedFormData = this.multistepService.getMultiStepFormData('user-creation');
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
              try {
                const { essentialData } = this.storedFormData;
                const { 
                  isMerchant,
                  userRequiredFields,
                  merchantRequiredFields,
                  businessName,
                  businessType,
                  lastname,
                  name,
                  submitButton,
                  subtext,
                  userImage,
                  venmo,
                  paypal,
                  cashapp,
                  email,
                  socials,
                  bankInfo,
                  phoneNumber,
                  address
                } = essentialData;

                console.log("Banco", bankInfo, essentialData)
  
                if(!isMerchant) {
                  const phoneNumber = params.dataModel.get('1').value.phoneNumber.e164Number.split('+')[1];
                  
                  const foundUser = await this.authService.checkUser(phoneNumber);

                  if(!foundUser) {
                    const createdUser = await this.authService.signup({
                      phone: phoneNumber,
                      email,
                      name,
                      lastname,
                      bio: subtext,
                      social: Object.keys(socials).map(socialNetworkKey => ({
                        name: socialNetworkKey,
                        url: socials[socialNetworkKey]
                      }))
                    }, 'none', null, true, base64ToFile(userImage));


                    const magicLinkCreated = await this.authService.generateMagicLink(
                      createdUser.phone, 
                      "/ecommerce/user-contact-landing",
                      createdUser._id,
                      'NewUser',
                      {
                        type: 'from-user-creation',
                        venmo,
                        paypal,
                        cashapp
                      }  
                    );

                    this.dialog.open(GeneralFormSubmissionDialogComponent, {
                      type: 'centralized-fullscreen',
                      props: {
                        icon: createdUser && magicLinkCreated ? 'check-circle.svg' : 'sadFace.svg',
                        message: createdUser && magicLinkCreated ? 
                          "Se ha enviado un mLink a tu WhatsApp" : 'Ocurrió un problema'
                      },
                      customClass: 'app-dialog',
                      flags: ['no-header'],
                    });
                  }
  
                  // await this.authService.generateMagicLink(phoneNumber, `ecommerce/user-contact-landing/`, null, 'NewUser', {
  
                  // });                              
                } 

                if(isMerchant) {

                  const phoneNumber = params.dataModel.get('1').value.phoneNumber.e164Number.split('+')[1];
                  
                  const foundUser = await this.authService.checkUser(phoneNumber);

                  if(!foundUser) {
                    const createdUser = await this.authService.signup({
                      phone: phoneNumber,
                      email,
                      name: businessName,
                      bio: businessType,
                      social: Object.keys(socials).map(socialNetworkKey => ({
                        name: socialNetworkKey,
                        url: socials[socialNetworkKey]
                      }))
                    }, 'none', null, true, base64ToFile(userImage));
                    
                    const { createMerchant: createdMerchant } = await this.merchantService.createMerchant({
                      name: businessName,
                      bio: businessType
                    });

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
                        owner: bankInfo.owner,
                        socialID: bankInfo.socialID
                      }  
                    );

                    this.dialog.open(GeneralFormSubmissionDialogComponent, {
                      type: 'centralized-fullscreen',
                      props: {
                        icon: createdUser && magicLinkCreated ? 'check-circle.svg' : 'sadFace.svg',
                        message: createdUser && magicLinkCreated ? 
                          "Se ha enviado un mLink a tu WhatsApp" : 'Ocurrió un problema'
                      },
                      customClass: 'app-dialog',
                      flags: ['no-header'],
                    });
                  }
                }
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

              }
            }
          }
        } else {
          if (params.itemId) {
            this.itemId = params.itemId;
          }
        }
      })
    })
  }

}
