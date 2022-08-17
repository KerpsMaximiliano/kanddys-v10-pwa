import { Component, OnInit } from '@angular/core';
import { FormStep, FooterOptions } from 'src/app/core/types/multistep-form';
import { HeaderInfoComponent } from 'src/app/shared/components/header-info/header-info.component';
import { FormControl, Validators } from '@angular/forms';
import { ReservationOrderlessComponent } from 'src/app/modules/airtable/pages/reservations-orderless/reservations-orderless.component';
import { ImageInputComponent } from 'src/app/shared/components/image-input/image-input.component';
import { DecimalPipe } from '@angular/common';
import { base64ToFile } from 'src/app/core/helpers/files.helpers';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { ActivatedRoute } from '@angular/router'
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { GeneralFormSubmissionDialogComponent } from 'src/app/shared/dialogs/general-form-submission-dialog/general-form-submission-dialog.component';
import { FrontendLogsService } from 'src/app/core/services/frontend-logs.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { User } from 'src/app/core/models/user';

const commonContainerStyles = {
  margin: '41px 39px auto 39px'
}

const footerConfig: FooterOptions = {
  bgColor: '#faa4a4',
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

@Component({
  selector: 'app-ll-studio-order-form',
  templateUrl: './ll-studio-order-form.component.html',
  styleUrls: ['./ll-studio-order-form.component.scss']
})
export class LlStudioOrderFormComponent implements OnInit {
  scrollableForm = true;
  reservation: {
    data: Record<string, any>,
    message: string;
  } = null;
  merchantId: string = null;
  automationName: string = null;
  choosedReservation: boolean = false;
  choosedPickup: boolean = false;
  fullFormMessage: string = null;
  formMessageInitialHistory: Record<string, any> = {};
  whatsappLink: string = 'https://wa.me/18095083344?text=';
  whatsappLinkSteps: string[] = [];
  calendarId: string = null;
  referenceDefaultImages: (string | ArrayBuffer)[] = [''];
  referenceImagefiles: File[] = [];
  proofOfPaymentDefaultImages: (string | ArrayBuffer)[] = [''];
  proofOfPaymentImagefiles: File[] = [];
  newUser = true;
  existingUserData: User = null;
  loading = true;
  logo = 'https://storage-rewardcharly.sfo2.digitaloceanspaces.com/new-assets/LL_Studio_logo_version_principal-fondo_transparente_180x.webp';
  emailAlreadyOnDatabase: boolean = false;
  
  formSteps: FormStep[] = [
    {
      headerText: '',
      fieldsList: [
        {
          name: 'phoneNumber',
          fieldControl: {
            type: 'single',
            control: new FormControl('', Validators.required)
          },
          label: 'Ayudanos a identificarte usando tu número de teléfono',
          inputType: 'phone',
          styles: {
            containerStyles: {
              paddingTop: '44px',
              paddingLeft: '33px',
              paddingRight: '33px',
              paddingBottom: '200px'
            },
            labelStyles: {
              fontFamily: 'RobotoBold',
              fontSize: '24px',
              margin: '0px',
              paddingBottom: '25px',
              color: "#faa4a4"
            },
            bottomLabelStyles: {
              fontWeight: 'normal',
              fontStyle: 'italic',
              fontSize: '15px',
              paddingTop: '22px',
              fontFamily: 'RobotoRegular'
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
      ],
      asyncStepProcessingFunction: {
        type: 'promise',
        function: async (params) => {
          console.log(params.dataModel.value['1'].phoneNumber);
          const phoneNumber = params.dataModel.value['1'].phoneNumber.e164Number.split('+')[1];
          try {
            const response = await this.authService.checkUser(phoneNumber);

            localStorage.setItem("lastLoggedPhone", JSON.stringify(params.dataModel.value['1'].phoneNumber));

            if(response) {
              this.existingUserData = response;
              this.newUser = false;

              if(this.existingUserData.name) {
                this.formSteps[1].fieldsList[0].fieldControl.control.setValue(this.existingUserData.name);
                this.formSteps[1].fieldsList[0].fieldControl.control.disable();
              } else {
                this.formSteps[1].fieldsList[0].fieldControl.control.reset();
                this.formSteps[1].fieldsList[0].fieldControl.control.enable();
              }
              
              if(this.existingUserData.lastname){
                this.formSteps[1].fieldsList[1].fieldControl.control.setValue(this.existingUserData.lastname);
                this.formSteps[1].fieldsList[1].fieldControl.control.disable();
              } else {
                this.formSteps[1].fieldsList[1].fieldControl.control.reset();
                this.formSteps[1].fieldsList[1].fieldControl.control.enable();
              }

              for(let social of this.existingUserData.social) {
                if(social.name === 'instagram') {
                  if(social.userName && social.userName.length > 0) {
                    this.formSteps[1].fieldsList[2].fieldControl.control.setValue(social.userName);
                    this.formSteps[1].fieldsList[2].fieldControl.control.disable();
                  } else {
                    this.formSteps[1].fieldsList[2].fieldControl.control.reset();
                    this.formSteps[1].fieldsList[2].fieldControl.control.enable();
                  }
                }

                if(social.name === 'location') {
                  if(social.url && social.url.length > 0) {
                    this.formSteps[9].fieldsList[1].fieldControl.control.setValue(social.url || '');
                    this.formSteps[9].fieldsList[1].fieldControl.control.disable();
                  } else {
                    this.formSteps[9].fieldsList[1].fieldControl.control.reset();
                    this.formSteps[9].fieldsList[1].fieldControl.control.enable();
                  }
                }
              }

              let birthdayValue: any = this.existingUserData.birthdate;

              if(birthdayValue !== '' && birthdayValue) {
                birthdayValue = new Date(birthdayValue);
                birthdayValue = birthdayValue.getFullYear() + '-' + '0' + (Number(birthdayValue.getMonth()) + 1) + '-' + (Number(birthdayValue.getDate()) + 1);
                this.formSteps[1].fieldsList[4].fieldControl.control.setValue(birthdayValue);              
                this.formSteps[1].fieldsList[4].fieldControl.control.disable();
              } else {
                this.formSteps[1].fieldsList[4].fieldControl.control.reset();    
                this.formSteps[1].fieldsList[4].fieldControl.control.enable();
              }

              if(this.existingUserData.email){
                this.formSteps[1].fieldsList[3].fieldControl.control.setValue(this.existingUserData.email);              
                this.formSteps[1].fieldsList[3].fieldControl.control.disable();
              } else {
                this.formSteps[1].fieldsList[3].fieldControl.control.reset();
                this.formSteps[1].fieldsList[3].fieldControl.control.enable();
              }

              if(this.existingUserData.deliveryLocations.length > 0 && this.existingUserData.deliveryLocations[0].nickName !== ''){
                this.formSteps[9].fieldsList[0].fieldControl.control.setValue(this.existingUserData.deliveryLocations[0].nickName);              
                this.formSteps[9].fieldsList[0].fieldControl.control.disable();
              } else {
                this.formSteps[9].fieldsList[0].fieldControl.control.reset();
                this.formSteps[9].fieldsList[0].fieldControl.control.enable();
              }
            } else {
              this.formSteps[1].fieldsList.forEach(field => {
                field.fieldControl.control.reset()
                field.fieldControl.control.enable()
              });

              this.formSteps[9].fieldsList.forEach(field => {
                field.fieldControl.control.reset()
                field.fieldControl.control.enable()
              });
            }
          } catch (error) {
            this.newUser = true;
            console.log("nuevo usuario");
          }

          return {ok: true};
        }
      },
      embeddedComponents: [
        {
          component: HeaderInfoComponent,
          beforeIndex: 0,
          inputs: {
            title: 'LL Studio',
            description: 'Formulario de Ordenes',
            type: 'dialog',
            profileImage: this.logo,
            socials: [
              {
                name: 'instagram',
                url: 'https://instagram.com/llstudiord?igshid=YmMyMTA2M2Y='
              },
              {
                name: 'phone',
                url: '18098718288'
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
              },
              title: {
                color: "#faa4a4"
              }
            }
          },
          outputs: [],
        }
      ],
      styles: {
        padding: '0px',
      },
      hideHeader: true,
      footerConfig,
      stepButtonInvalidText: 'ESCRIBE TU NÚMERO DE TELÉFONO',
      stepButtonValidText: 'CONTINÚA CON TU ORDEN'
    },
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
            text: 'Cuéntanos sobre ti',
            clickable: false
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
              color: "#faa4a4"
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
          label: 'Apellido (*)',
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
          name: 'instagramUser',
          fieldControl: {
            type: 'single',
            control: new FormControl('', Validators.required)
          },
          placeholder: 'Ejemplo: @_heavenlyballoons',
          label: 'Instagram User (*)',
          styles: {
            containerStyles: {
              width: '100%',
              padding: '0px'
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
          name: 'email',
          fieldControl: {
            type: 'single',
            control: new FormControl('', Validators.compose([Validators.required, Validators.email]))
          },
          placeholder: 'ejemplo@hotmail.com...',
          label: 'E-Mail (*)',
          inputType: 'email',
          styles: {
            containerStyles: {
              width: '100%',
              padding: '0px'
            },
            fieldStyles: {
              marginTop: '21px',
              width: '100%',
            },
            labelStyles: {
              ...labelStyles,
              paddingTop: '65px',
              backgroundPositionX: '8px',
              backgroundPositionY: '64.5px',
              backgroundImage: 'url(https://storage-rewardcharly.sfo2.digitaloceanspaces.com/new-assets/mail-gray.svg)',
              backgroundRepeat: 'no-repeat',
              paddingLeft: '40px',
              paddingBottom: '5px',
              display: 'flex',
              alignItems: 'center',
              backgroundSize: '1.7rem'
            }
          },
        },
        {
          name: 'birthday',
          fieldControl: {
            type: 'single',
            control: new FormControl('')
          },
          placeholder: 'YYYY-MM-DD',
          label: 'Fecha de cumpleaños',
          inputType: 'date',
          maxDate: `${new Date().getFullYear()}-${('0' + (new Date().getMonth() + 1)).slice(-2)}-${('0' + new Date().getDate()).slice(-2)}`,
          styles: {
            containerStyles: {
              width: '100%',
              padding: '0px',
              paddingBottom: '60px'
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
      styles: {
        padding: '0px',
      },
      asyncStepProcessingFunction: {
        type: 'promise',
        function: async (params) => {
          this.whatsappLinkSteps.push(`*Nombre:*\n${this.formSteps[1].fieldsList[0].fieldControl.control.value}\n\n`);
          this.whatsappLinkSteps.push(`*Apellido:*\n${this.formSteps[1].fieldsList[1].fieldControl.control.value}\n\n`);
          this.whatsappLinkSteps.push(`*Instagram User:*\n${this.formSteps[1].fieldsList[2].fieldControl.control.value}\n\n`);
          this.whatsappLinkSteps.push(`*E-Mail:*\n${this.formSteps[1].fieldsList[3].fieldControl.control.value}\n\n`);

          if(this.formSteps[1].fieldsList[4].fieldControl.control.value && this.formSteps[1].fieldsList[4].fieldControl.control.value.length > 0) {
            this.whatsappLinkSteps.push(`*Fecha de Cumpleaños:*\n${this.formSteps[1].fieldsList[4].fieldControl.control.value}\n\n`);
          }

          try {
            const foundEmail = await this.authService.checkUser(
              this.formSteps[1].fieldsList[3].fieldControl.control.value
            );

            if(foundEmail) this.emailAlreadyOnDatabase = true;
          } catch (error) {
            this.emailAlreadyOnDatabase = false;
          }

          return { ok: true }
        },
      },
      footerConfig,
      stepButtonInvalidText: 'ADICIONA TUS DATOS PERSONALES',
      stepButtonValidText: 'CONTINUA CON TU ORDEN'
    },
    {
      headerText: '',
      fieldsList: [
        {
          name: 'aboutYourOrder',
          fieldControl: {
            type: 'single',
            control: new FormControl('', Validators.required)
          },
          label: 'Descripción de tu orden - Especifica todos los detalles (*)',
          placeholder: 'Favor indicar artículo(s), color, material, personalización, aclaraciones y demás datos relevantes a tu orden. En base a esta información se trabajará tu pedido',
          inputType: 'textarea',
          styles: {
            labelStyles: {
              fontFamily: 'RobotoBold',
              fontSize: '24px',
              margin: '0px',
              marginBottom: '25px',
              color: "#faa4a4"
            },
            containerStyles: {
              marginTop: '44px'
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
          name: 'referenceImage',
          fieldControl: {
            type: 'single',
            control: new FormControl([''])
          },
          label: 'Foto de referencia',
          sublabel: 'Adjuntar foto de referencia de su orden:',
          inputType: 'file2',
          fileObjects: [],
          placeholder: 'sube una imagen',
          styles: {
            labelStyles: {
              fontFamily: 'RobotoLight',
              fontWeight: 300,
              fontSize: '19px',
              margin: '0px',
              marginBottom: '18px',
            },
            fieldStyles: {
              width: '157px',
              height: '137px',
              padding: '34px',
              textAlign: 'center',
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
            containerStyles: {
              marginTop: '0px',
              paddingTop: '64px',
              paddingBottom: '270px',
            },
            innerContainerStyles: {
              width: '157px',
              textAlign: 'center',
            }
          },
        },
      ],
      stepProcessingFunction: () => {
        this.whatsappLinkSteps.push(`*Descripción de la orden:*\n${this.formSteps[2].fieldsList[0].fieldControl.control.value}\n\n`);

        return { ok: true }
      },
      customScrollToStepBackwards: (params) => {
        this.whatsappLinkSteps.pop();
        this.whatsappLinkSteps.pop();
        this.whatsappLinkSteps.pop();
        this.whatsappLinkSteps.pop();
        this.whatsappLinkSteps.pop();

        params.scrollToStep(1, false);
      },
      footerConfig,
      stepButtonInvalidText: 'AÑADE LA DESCRIPCIÓN DE TU ORDEN',
      stepButtonValidText: 'CONTINÚA CON TU ORDEN'
    },
    {
      headerText: '',
      fieldsList: [
        {
          name: 'wouldYourOrderIncludeAGiftWrap',
          fieldControl: {
            type: 'single',
            control: new FormControl('', Validators.required)
          },
          selectionOptions: [
            'Si, ya la he seleccionado y pagado.', 
            'No llevaría envoltura de regalo', 
            'Si, me gustaría agregarla (aplican cargos adicionales)', 
            'Quiero decidir después'
          ],
          changeCallbackFunction: (change, params) => {
            this.formSteps[3].fieldsList[0].fieldControl.control.setValue(change, {
              emitEvent: false,
            });
          },
          label: '¿Su orden llevaría envoltura de regalo? (*)',
          inputType: 'radio',
          styles: {
            containerStyles: {
              marginTop: '48px',
            },
            labelStyles: {
              fontFamily: 'RobotoBold',
              fontWeight: 'bold',
              fontSize: '24px',
              margin: '0px',
              marginBottom: '25px',
              color: "#faa4a4"
            },
            fieldStyles: {
              paddingLeft: '0px'
            }
          },
        },
      ],
      stepProcessingFunction: () => {
        this.whatsappLinkSteps.push(`*¿Su orden llevaría envoltura de regalo?:*\n${this.formSteps[3].fieldsList[0].fieldControl.control.value}\n\n`);

        return { ok: true }
      },
      customScrollToStepBackwards: (params) => {
        this.whatsappLinkSteps.pop();

        params.scrollToStep(1, false);
      },
      footerConfig,
      stepButtonInvalidText: 'SELECCIONA UNA OPCIÓN',
      stepButtonValidText: 'CONTINÚA CON TU ORDEN'
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
          label: 'Monto Total de Compra:',
          inputType: 'number',
          placeholder: 'Si no estas segur(x) puedes dejarlo en blanco',
          changeCallbackFunction: (change, params) => {
            const { firstPayment, totalAmount } = params.dataModel.value['5'];

            if(Number(change) < Number(firstPayment)) {
              this.formSteps[4].fieldsList[1].fieldControl.control.setValue(0, {
                emitEvent: false,
              });

              this.formSteps[4].fieldsList[1].formattedValue = '$' + this.decimalPipe.transform(
                Number(0),
                '1.2'
              );
            } 
            
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
                    this.formSteps[4].fieldsList[0].placeholder = '';
                  }

                  this.formSteps[4].fieldsList[0].formattedValue = '$' + formatted;
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
                    this.formSteps[4].fieldsList[0].placeholder = '';
                  }

                  this.formSteps[4].fieldsList[0].formattedValue = '$' + formatted;
                }
              } else {
                const convertedNumber = Number(change.split('').filter(char => char !== '.').join(''));
                this.formSteps[4].fieldsList[0].fieldControl.control.setValue(convertedNumber, {
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
              Validators.min(0)
            ])
          },
          shouldFormatNumber: true,
          label: 'Monto Pagado',
          inputType: 'number',
          placeholder: 'Si no has realizado ningún pago favor colocar "0"',
          changeCallbackFunction: (change, params) => {
            const { firstPayment, totalAmount } = params.dataModel.value['5'];

            if(Number(change) > Number(totalAmount) && totalAmount !== "" && Number(totalAmount) !== 0) {
              this.formSteps[4].fieldsList[1].fieldControl.control.setValue(firstPayment, {
                emitEvent: false,
              });
            } else {
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
          selectionOptions: ['Banco Popular', 'Banreservas', 'Banco BHD', 'Yoyo App', 'PayPal', 'Otro'],
          changeCallbackFunction: (change, params) => {
            this.formSteps[4].fieldsList[2].fieldControl.control.setValue(change, {
              emitEvent: false,
            });
          },
          label: 'Vía de Pago (*)',
          inputType: 'radio',
          styles: {
            containerStyles: {
              marginTop: '48px',
            },
            labelStyles: {
              marginBottom: '21px',
              fontSize: '19px',
              fontFamily: 'RobotoRegular',
              fontWeight: 500
            },
            fieldStyles: {
              paddingLeft: '0px'
            }
          },
        },
        {
          name: 'proofOfPayment',
          fieldControl: {
            type: 'single',
            control: new FormControl([''])
          },
          label: 'Comprobante de Pago',
          sublabel: 'Adjuntar foto de referencia de su orden:',
          inputType: 'file2',
          fileObjects: [],
          placeholder: 'sube una imagen',
          styles: {
            labelStyles: {
              fontFamily: 'RobotoLight',
              fontWeight: 300,
              fontSize: '19px',
              margin: '0px',
              marginBottom: '18px',
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
              paddingTop: '64px',
              paddingBottom: '270px',
            },
            innerContainerStyles: {
              width: '157px',
              textAlign: 'center',
            }
          },
        },
      ],
      stepProcessingFunction: () => {
        this.whatsappLinkSteps.push(`*Monto total de Compra:*\n${this.formSteps[4].fieldsList[0].formattedValue}\n\n`);
        this.whatsappLinkSteps.push(`*Monto pagado:*\n${this.formSteps[4].fieldsList[1].formattedValue}\n\n`);
        this.whatsappLinkSteps.push(`*Vía de pago:*\n${this.formSteps[4].fieldsList[2].fieldControl.control.value}\n\n`);

        return { ok: true }
      },
      customScrollToStepBackwards: (params) => {
        this.whatsappLinkSteps.pop();
        params.scrollToStep(2, false);
      },
      footerConfig,
      stepButtonInvalidText: 'ESCRIBE DATOS DEL PAGO',
      stepButtonValidText: 'CONTINUA CON TU ORDEN'
    },
    {
      headerText: '',
      fieldsList: [
        {
          name: 'fromWhereAreYouPaying',
          fieldControl: {
            type: 'single',
            control: new FormControl('', Validators.required)
          },
          selectionOptions: ['Instagram @llstudiord', 'WhatsApp 809-871-8288', 'WhatsApp 809-508-3344', 'Correo Electrónico'],
          changeCallbackFunction: (change, params) => {
            console.log(change)

            this.formSteps[5].fieldsList[0].fieldControl.control.setValue(change, {
              emitEvent: false,
            });
          },
          label: 'Via por la que está colocando esta orden (*)',
          sublabel: 'Favor seleccionar la via por la que estamos conversando para futuras referencias',
          inputType: 'radio',
          styles: {
            containerStyles: {
              marginTop: '44px',
            },
            fieldStyles: {
              paddingLeft: '0px'
            },
            labelStyles: {
              marginBottom: '21px',
              fontSize: '24px',
              fontFamily: 'RobotoBold',
              color: "#faa4a4"
            },
            subLabelStyles: {
              color: '#7B7B7B',
              fontSize: '1rem',
              margin: '0px',
              marginTop: '20px',
              marginBottom: '34px',
              fontFamily: 'RobotoRegular',
              fontWeight: 500
            },
          },
        }
      ],
      stepProcessingFunction: () => {
        this.whatsappLinkSteps.push(`*Via por la que está colocando esta orden:*\n${this.formSteps[5].fieldsList[0].fieldControl.control.value}\n\n`)

        return { ok: true }
      },
      customScrollToStepBackwards: (params) => {
        this.whatsappLinkSteps.pop();
        this.whatsappLinkSteps.pop();
        this.whatsappLinkSteps.pop();

        params.scrollToStep(4, false);
      },
      footerConfig,
      stepButtonInvalidText: 'SELECCIONA UNA OPCIÓN',
      stepButtonValidText: 'ENVIANOS TU ORDEN POR WHATSAPP'
    },
    {
      headerText: '',
      fieldsList: [
        {
          name: 'dateConfirmation',
          fieldControl: {
            type: 'single',
            control: new FormControl('', Validators.required)
          },
          selectionOptions: ['Si', 'No'],
          changeCallbackFunction: (change, params) => {
            this.formSteps[6].fieldsList[0].fieldControl.control.setValue(change, {
              emitEvent: false,
            });

            if (change === 'Si') {
              params.scrollToStep(7);
              this.choosedReservation = true;
            } else {
              this.formSteps[7].fieldsList[0].fieldControl.control.setValue('');
              this.reservation = null;
              this.choosedReservation = false;
              params.scrollToStep(8);
            }
          },
          label: 'Hemos acordado y confirmado una fecha y hora de entrega? (*)',
          sublabel: `
          Si la fecha de entrega de tu orden no ha sido previamente acordada y confirmada por LL Studio, favor dejar este campo en blanco. Si marcas una fecha que no ha sido anteriormente validada por LL Studio, esta información no será válida.
          El plazo de entrega es de 4 a 8 dias laborables. Si no hemos acordado una fecha favor marcar NO.
          `,
          inputType: 'radio',
          styles: {
            containerStyles: {
              marginTop: '44px',
            },
            fieldStyles: {
              paddingLeft: '0px'
            },
            labelStyles: {
              fontSize: '24px',
              fontFamily: 'RobotoBold',
              color: "#faa4a4"
            },
            subLabelStyles: {
              color: '#7B7B7B',
              fontSize: '1rem',
              margin: '0px',
              marginTop: '30px',
              marginBottom: '25px',
              fontFamily: 'RobotoRegular',
              fontWeight: 500
            },
          },
        },
      ],
      stepProcessingFunction: () => {
        return { ok: true }
      },
      customScrollToStepBackwards: (params) => {
        this.whatsappLinkSteps.pop();
        params.scrollToStep(5, false);
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
            calendarId: this.calendarId,
            hourRangeInDays: {
              'MONDAY': [
                {from: 9, to: 11},
                {from: 14, to: 18}
              ],
              'TUESDAY': [
                {from: 9, to: 11},
                {from: 14, to: 18}
              ],
              'WEDNESDAY': [
                {from: 9, to: 11},
                {from: 14, to: 18}
              ],
              'THURSDAY': [
                {from: 9, to: 11},
                {from: 14, to: 18}
              ],
              'FRIDAY': [
                {from: 9, to: 11},
                {from: 14, to: 18}
              ],
              'SATURDAY': [
                {from: 9, to: 11},
                {from: 14, to: 15}
              ],
            },
            //calendarId: "62ead89938496128082e4ddd"
          },
          outputs: [
            {
              name: 'onReservation',
              callback: (reservationOutput) => {
                this.reservation = reservationOutput;
                
                if(reservationOutput) {
                  this.formSteps[7].fieldsList[0].fieldControl.control.setValue(reservationOutput.message);
                } else {
                  this.formSteps[7].fieldsList[0].fieldControl.control.setValue('');
                }
              },
            }
          ]
        }
      ],
      stepProcessingFunction: () => {
        if (this.reservation) {
          this.whatsappLinkSteps.push(
            `*Fecha de entrega:*\n${this.formSteps[7].fieldsList[0].fieldControl.control.value}\n\n`
          );

          return { ok: true };
        }

        return { ok: false };
      },
      footerConfig,
      stepButtonInvalidText: 'ADICIONA LA FECHA ACORDADA',
      stepButtonValidText: 'CONTINUA CON TU ORDEN'
    },
    {
      headerText: '',
      fieldsList: [
        {
          name: 'about-delivery',
          label: 'Forma de entrega (*)',
          sublabel: 'Si no has realizado el pago de tu delivery o envío, favor cominicarte con nosotros para hacerlo',
          fieldControl: {
            type: 'single',
            control: new FormControl('', Validators.required)
          },
          selectionOptions: [
            'Pick Up en Tienda (Por Citas)',
            'Delivery Zona Metropolitana (A partir de +RD$250)',
            'Envío al Interior (A partir de +RD$350)',
            'Envío Internacional (Cotizar)'
          ],
          inputType: 'radio',
          changeCallbackFunction: (change, params) => {
            if (change === 'Pick Up en Tienda (Por Citas)') {
              this.choosedPickup = true;
              params.scrollToStep(10);
            }
          },
          styles: {
            containerStyles: {
              marginTop: '44px',
            },
            labelStyles: {
              fontSize: '24px',
              fontFamily: 'RobotoBold',
              margin: '0px',
              color: "#faa4a4"
            },
            subLabelStyles: {
              color: '#7B7B7B',
              fontSize: '1rem',
              margin: '0px',
              marginTop: '16px',
              marginBottom: '27px',
              fontFamily: 'RobotoRegular',
              fontWeight: 500
            },
          }
        }
      ],
      customScrollToStepBackwards: (params) => {
        if (!this.choosedReservation)
          params.scrollToStep(6, false);
        else {
          this.whatsappLinkSteps.pop();
          params.scrollToStep(7, false);
        }
      },
      stepProcessingFunction: () => {
        this.whatsappLinkSteps.push(`*Sobre la entrega:*\n${this.formSteps[8].fieldsList[0].fieldControl.control.value}\n\n`);

        return { ok: true }
      },
      footerConfig,
      stepButtonInvalidText: 'SELECCIONA UNA OPCIÓN',
      stepButtonValidText: 'CONTINÚA CON TU ORDEN'
    },
    {
      fieldsList: [
        {
          name: 'whereToDeliver',
          label: 'Dirección o Destino de Entrega',
          sublabel: 'El delivery en Santo Domingo sólo aplica a la zona metropolitana y su costo es a partir de RD$250. El envío al interior se hace vía courrier, a partir de RD$350',
          inputType: 'textarea',
          fieldControl: {
            type: 'single',
            control: new FormControl('')
          },
          placeholder: 'Escriba la Calle, número, (nombre del edificio).',
          styles: {
            containerStyles: {
              marginTop: '40px'
            },
            fieldStyles: {
              borderRadius: '10px',
              padding: '23px 26px 23px 16px',
              background: 'white',
              height: '164px'
            },
            labelStyles: {
              color: "#faa4a4",
              fontFamily: 'RobotoBold'
            },
            subLabelStyles: {
              color: '#7B7B7B',
              fontSize: '1rem',
              margin: '0px',
              marginTop: '17px',
              marginBottom: '40px',
              fontFamily: 'RobotoRegular',
              fontWeight: 500
            },
          }
        },
        {
          name: 'location',
          fieldControl: {
            type: 'single',
            control: new FormControl('')
          },
          label: 'Si deseas, puedes anexar el link de tu ubicación(por ej. Google Maps) para una mejor referencia de tu ubicación',
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
      stepProcessingFunction: () => {
        if (this.formSteps[9].fieldsList[0].fieldControl.control.value && this.formSteps[9].fieldsList[0].fieldControl.control.value.length > 1) {
          this.whatsappLinkSteps.push(`*¿Donde entregaremos?:*\n${this.formSteps[9].fieldsList[0].fieldControl.control.value}\n\n`);
        }

        return {ok: true};
      },
      customScrollToStepBackwards: (params) => {
        this.whatsappLinkSteps.pop();
        params.scrollToStep(8, false);
      },
      footerConfig,
      stepButtonInvalidText: 'SELECCIONA COMO INFORMARNOS',
      stepButtonValidText: 'CONTINUA CON TU ORDEN'
    },
    {
      headerText: '',
      fieldsList: [
        {
          name: 'firstTime',
          fieldControl: {
            type: 'single',
            control: new FormControl('', Validators.required)
          },
          selectionOptions: ['Si', 'No'],
          label: '¿Es tu primera vez comprando con nosotros? (*)',
          inputType: 'radio',
          styles: {
            containerStyles: {
              marginTop: '44px',
            },
            fieldStyles: {
              paddingLeft: '0px'
            },
            labelStyles: {
              fontSize: '24px',
              fontFamily: 'RobotoBold',
              color: "#faa4a4"
            },
            subLabelStyles: {
              color: '#7B7B7B',
              fontSize: '1rem',
              margin: '0px',
              marginTop: '30px',
              marginBottom: '25px',
              fontFamily: 'Roboto',
              fontWeight: 500
            },
          },
        },
      ],
      stepProcessingFunction: () => {
        this.whatsappLinkSteps.push(`*¿Es tu primera vez comprando con nosotros?:*\n${this.formSteps[10].fieldsList[0].fieldControl.control.value}\n\n`);

        return { ok: true }
      },
      customScrollToStepBackwards: (params) => {

        this.whatsappLinkSteps.pop();
        if(!this.choosedPickup)
          params.scrollToStep(9, false);
        else 
          params.scrollToStep(8, false);
      },
      footerConfig,
      stepButtonInvalidText: 'SELECCIONA UNA OPCIÓN',
      stepButtonValidText: 'CONTINUA CON TU ORDEN'
    },
    {
      fieldsList: [
        {
          name: 'whyDidYouChooseUs',
          label: '¿Por qué decidiste colocar esta orden con nosotros?',
          inputType: 'textarea',
          fieldControl: {
            type: 'single',
            control: new FormControl('')
          },
          placeholder: 'Escribe aquí...',
          styles: {
            containerStyles: {
              marginTop: '40px'
            },
            fieldStyles: {
              borderRadius: '10px',
              padding: '23px 26px 23px 16px',
              background: 'white',
              height: '164px'
            },
            labelStyles: {
              color: "#faa4a4",
              fontFamily: 'RobotoBold'
            },
            subLabelStyles: {
              color: '#7B7B7B',
              fontSize: '1rem',
              margin: '0px',
              marginTop: '17px',
              marginBottom: '40px',
              fontFamily: 'Roboto',
              fontWeight: 500
            },
          }
        },
      ],
      stepProcessingFunction: () => {
        this.whatsappLinkSteps.push(`*¿Por qué decidiste colocar esta orden con nosotros?:*\n${this.formSteps[11].fieldsList[0].fieldControl.control.value}\n\n`);

        return { ok: true }
      },
      customScrollToStepBackwards: (params) => {
        this.whatsappLinkSteps.pop();
        params.scrollToStep(10, false);
      },
      footerConfig,
      stepButtonInvalidText: 'SELECCIONA COMO INFORMARNOS',
      stepButtonValidText: 'CONTINUA CON TU ORDEN'
    },
    {
      headerText: '',
      fieldsList: [
        {
          name: 'canWeMentionYou',
          fieldControl: {
            type: 'single',
            control: new FormControl('')
          },
          selectionOptions: ['Si', 'No'],
          label: 'Podemos mencionarte en nuestra sección "Veo, Veo"',
          sublabel: 'En esta sección publicamos todos los sábados en Instagram las órdenes realizadas en la semana anterior (no la semana en curso)',
          inputType: 'radio',
          styles: {
            containerStyles: {
              marginTop: '44px',
            },
            fieldStyles: {
              paddingLeft: '0px'
            },
            labelStyles: {
              fontSize: '24px',
              fontFamily: 'RobotoBold',
              color: "#faa4a4"
            },
            subLabelStyles: {
              color: '#7B7B7B',
              fontSize: '1rem',
              margin: '0px',
              marginTop: '30px',
              marginBottom: '25px',
              fontFamily: 'RobotoRegular',
              fontWeight: 500
            },
          },
        },
      ],
      asyncStepProcessingFunction: {
        type: 'promise',
        function: async (params) => {
          this.whatsappLinkSteps.push(`*Podemos mencionarte en nuestra sección "Veo, Veo":*\n${this.formSteps[this.formSteps.length - 1].fieldsList[0].fieldControl.control.value}\n\n`);

          try {
            const { phoneNumber } = params.dataModel.value['1'];
            const name = this.formSteps[1].fieldsList[0].fieldControl.control.value;
            const lastname = this.formSteps[1].fieldsList[1].fieldControl.control.value;
            const instagramUser = this.formSteps[1].fieldsList[2].fieldControl.control.value;
            const email = this.formSteps[1].fieldsList[3].fieldControl.control.value;
            const birthday = this.formSteps[1].fieldsList[4].fieldControl.control.value;


            let fileRoutesReferenceImages = null;
            let proofOfPaymentImages = null;

            if(this.newUser) {
              const requestData: any = {
                phone: phoneNumber.e164Number.split('+')[1],
                name,
                lastname,
                social: [
                  {
                    name: 'instagram',
                    url: 'https://www.instagram.com/' + instagramUser,
                    userName: instagramUser
                  },
                ],
                deliveryLocations: [
                  {
                    nickName: this.formSteps[9].fieldsList[0].fieldControl.control.value
                  }
                ],
                instagram: 'https://www.instagram.com/' + instagramUser,
                clientOfMerchants: [
                  this.merchantId
                ]
              };
              
              if(email && email !== '' && !this.emailAlreadyOnDatabase)
                requestData.email = email;

              if(birthday && birthday !== "") {
                requestData['birthdate'] = birthday;
              }

              if(this.formSteps[9].fieldsList[1].fieldControl.control.value && this.formSteps[9].fieldsList[1].fieldControl.control.value !== '') {
                requestData.social.push({
                  name: 'location',
                  url: this.formSteps[9].fieldsList[1].fieldControl.control.value
                })
              }

              console.log(requestData);

              await this.authService.signup(requestData, 'none', null, false);
            }

            
            if(this.formSteps[2].fieldsList[1].fieldControl.control.value.length > 0 && (
              this.formSteps[2].fieldsList[1].fieldControl.control.value[0] !== ""
            )) {
              fileRoutesReferenceImages = await this.merchantsService.uploadAirtableAttachments(
                this.formSteps[2].fieldsList[1].fieldControl.control.value.map(base64string => base64ToFile(base64string))
              );

              this.whatsappLinkSteps.push(`*Foto de Referencia:*\n`);

              for(let route of fileRoutesReferenceImages) {
                this.whatsappLinkSteps.push(`${route}\n`);
              }
              this.whatsappLinkSteps.push(`\n`);
            }

            if(this.formSteps[4].fieldsList[3].fieldControl.control.value.length > 0 && (
              this.formSteps[4].fieldsList[3].fieldControl.control.value[0] !== ""
            )) {
              proofOfPaymentImages = await this.merchantsService.uploadAirtableAttachments(
                this.formSteps[4].fieldsList[3].fieldControl.control.value.map(base64string => base64ToFile(base64string))
              );              

              this.whatsappLinkSteps.push(`*Comprobante de pago:*\n`);

              for(let route of proofOfPaymentImages) {
                this.whatsappLinkSteps.push(`${route}\n`);
              }
              this.whatsappLinkSteps.push(`\n`);
            }

            const convertedTotalAmount = Number(
              this.formSteps[4].fieldsList[0].formattedValue
                .split('').filter(char => char !== ',' && char !== '$').join(''));
            
            const convertedPayedAmount = Number(
              this.formSteps[4].fieldsList[1].formattedValue
                .split('').filter(char => char !== ',' && char !== '$').join(''));    

            const dateOffset = new Date().getTimezoneOffset() / 60;

            const data = {
              data: encodeURIComponent(JSON.stringify({
                phoneNumber: this.formSteps[0].fieldsList[0].fieldControl.control.value,
                name: this.formSteps[1].fieldsList[0].fieldControl.control.value,
                lastname: this.formSteps[1].fieldsList[1].fieldControl.control.value,
                instagramUser: this.formSteps[1].fieldsList[2].fieldControl.control.value,
                email: this.formSteps[1].fieldsList[3].fieldControl.control.value,
                birthday: this.formSteps[1].fieldsList[4].fieldControl.control.value,
                details: this.formSteps[2].fieldsList[0].fieldControl.control.value,
                wouldYourOrderIncludeAGiftWrap: this.formSteps[3].fieldsList[0].fieldControl.control.value,
                referenceImage: fileRoutesReferenceImages,
                totalAmount: convertedTotalAmount,
                payedAmount: convertedPayedAmount,
                paymentMethod: this.formSteps[4].fieldsList[2].fieldControl.control.value,
                proofOfPayment: proofOfPaymentImages,
                fromWhereAreYouPaying: this.formSteps[5].fieldsList[0].fieldControl.control.value,
                dateConfirmation: this.formSteps[6].fieldsList[0].fieldControl.control.value,
                reservation: this.reservation ? new Date(
                  this.reservation.data.dateInfo,
                  this.reservation.data.monthNumber,
                  this.reservation.data.day,
                  this.reservation.data.hour.slice(-2) === 'pm' &&
                    this.reservation.data.hour.slice(0, 2) !== '12' ? this.reservation.data.hourNumber + 12 - dateOffset :
                    this.reservation.data.hour.slice(-2) === 'am' &&
                      this.reservation.data.hour.slice(0, 2) !== '12' ? this.reservation.data.hourNumber - dateOffset :
                      this.reservation.data.hour.slice(-2) === 'pm' ? 12 - dateOffset : 0 - dateOffset,
                  this.reservation.data.minutesNumber
                ).toISOString() : '',
                'about-delivery': this.formSteps[8].fieldsList[0].fieldControl.control.value,
                whereToDeliver: this.formSteps[9].fieldsList[0].fieldControl.control.value,
                location: this.formSteps[9].fieldsList[1].fieldControl.control.value,
                canWeMentionYou: this.formSteps[this.formSteps.length - 1].fieldsList[0].fieldControl.control.value,
                whyDidYouChooseUs: this.formSteps[this.formSteps.length - 2].fieldsList[0].fieldControl.control.value,
                firstTime: this.formSteps[this.formSteps.length - 3].fieldsList[0].fieldControl.control.value
              }))
            };


            this.fullFormMessage = this.whatsappLinkSteps.join('');

            console.log("full form message", this.fullFormMessage);
            console.log("data", data);

            const success = await this.merchantsService.uploadDataToClientsAirtable(
              this.merchantId,
              this.automationName,
              data
            );

            this.dialog.open(GeneralFormSubmissionDialogComponent, {
               type: 'centralized-fullscreen',
               props: {
                 icon: success ? 'check-circle.svg' : 'sadFace.svg',
                 message: success ? null : 'Ocurrió un problema',
                 showCloseButton: success ? false : true
               },
               customClass: 'app-dialog',
               flags: ['no-header'],
             });

             window.location.href = this.whatsappLink + encodeURIComponent(this.fullFormMessage);
            
             return { ok: true };
          } catch (error) {
            console.log("El error ", error.message)
            
            this.dialog.open(GeneralFormSubmissionDialogComponent, {
              type: 'centralized-fullscreen',
              props: {
                icon: 'sadFace.svg',
                showCloseButton: true,
                message: window.navigator.onLine ? 'Ocurrió un problema: ' + error : 'Se perdió la conexion a internet'
              },
              customClass: 'app-dialog',
              flags: ['no-header'],
            });

            this.frontendLogsService.createFrontendLog({
              route: window.location.href,
              log: JSON.stringify({
                error: error.message
              })
            });

            return { ok: false };
          }
        },
      },
      customScrollToStepBackwards: (params) => {
        this.whatsappLinkSteps.pop();
        params.scrollToStep(11, false);
      },
      footerConfig,
      stepButtonInvalidText: 'SELECCIONA UNA OPCIÓN',
      stepButtonValidText: 'ENVIAR LA ORDEN POR WHATSAPP'
    },
  ];

  constructor(
    private decimalPipe: DecimalPipe,
    private merchantsService: MerchantsService,
    private route: ActivatedRoute,
    private dialog: DialogService,
    private frontendLogsService: FrontendLogsService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const { merchantId, automationName, calendarId } = params;

      this.merchantId = merchantId;
      this.calendarId = calendarId;

      let lastLoggedPhone: any = localStorage.getItem('lastLoggedPhone');

      if(lastLoggedPhone) {
        lastLoggedPhone = JSON.parse(lastLoggedPhone);
        this.formSteps[0].fieldsList[0].fieldControl.control.setValue(lastLoggedPhone);
        this.formSteps[0].fieldsList[0].phoneCountryCode = lastLoggedPhone.countryCode;
      }
      
      this.formSteps[7].embeddedComponents[0].inputs.calendarId = this.calendarId;
      this.formSteps[7].embeddedComponents[0].shouldRerender = true;

      this.automationName = automationName;
    })

    setTimeout(() => {
      this.loading = false;
    }, 1000);
  }

}
