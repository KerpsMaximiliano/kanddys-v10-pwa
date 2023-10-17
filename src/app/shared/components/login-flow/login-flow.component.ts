import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { HeaderService } from 'src/app/core/services/header.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { OptionsMenuComponent, DialogTemplate } from 'src/app/shared/dialogs/options-menu/options-menu.component';
import { GoogleSigninService } from 'src/app/core/services/google-signin.service';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { FormComponent } from 'src/app/shared/dialogs/form/form.component';
import { LoginFormComponent, FormData } from 'src/app/shared/dialogs/login-form/login-form.component';
import { FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { AuthService } from 'src/app/core/services/auth.service';
import { AppService } from 'src/app/app.service';
import { Router } from '@angular/router';
import { GeneralFormSubmissionDialogComponent } from 'src/app/shared/dialogs/general-form-submission-dialog/general-form-submission-dialog.component';


@Component({
  selector: 'app-login-flow',
  templateUrl: './login-flow.component.html',
  styleUrls: ['./login-flow.component.scss']
})
export class LoginFlowComponent implements OnInit {

  @Input() redirectionRoute: string = '/ecommerce/club-landing';
  @Input() redirectionRouteId: string | null = null;
  @Input() entity: string = 'MerchantAccess';
  @Input() jsondata: string = JSON.stringify({
    openNavigation: true,
  });
  @Input() loginEmail: string | null = null;
  @Input() magicLink: boolean = false;
  openNavigation: boolean = false;

  @Output() dialogIsOpen: EventEmitter<boolean> = new EventEmitter();

  constructor(
    private headerService: HeaderService,
    private dialog: MatDialog,
    private bottomSheet: MatBottomSheet,
    private googleSigninService: GoogleSigninService,
    private authService: AuthService,
    private snackbar: MatSnackBar,
    private router: Router,
    private dialogService: DialogService,
    private merchantsService: MerchantsService,
    private saleFlowService: SaleFlowService,
    private appService: AppService
  ) { }

  emailDialogRef: MatDialogRef<LoginFormComponent, any> = null;

  ngOnInit(): void {
    if(this.loginEmail) {
      if(this.magicLink) {
        this.authService.generateMagicLink(
          this.loginEmail,
          this.redirectionRoute,
          this.redirectionRouteId,
          this.entity,
          {
            jsondata: this.jsondata,
          },
          []
        );

        this.dialogIsOpen.emit(false);

        this.dialogService.open(
          GeneralFormSubmissionDialogComponent,
          {
            type: 'centralized-fullscreen',
            props: {
              icon: 'check-circle.svg',
              showCloseButton: false,
              message:
                'Se ha enviado un link mágico a tu correo electrónico',
            },
            customClass: 'app-dialog',
            flags: ['no-header'],
          }
        );
        this.magicLink = false;
      } else {
        let loginEmail = this.loginEmail;
        this.addPassword(loginEmail)
      }
    } else {
      this.share()
    }
  }

  share() {
      let dialogRef = this.bottomSheet.open(OptionsMenuComponent, {
        data: {
          title: 'Correo electrónico:',
          options: [
            {
              value: 'Adiciona tu correo',
              callback: () => {
                this.openMagicLinkDialog();
              },
            },
            // {
            //   value: 'Usa tu cuenta de Google',
            //   callback: async () => {
            //     this.googleSigninService.signIn()
            //     this.appService.events.subscribe(async (res) => {
            //       console.log(res)
            //       await this.merchantCheck(res.data)
            //     })
            //   },
            // },
          ],
        },
        disableClose: true
      })
      dialogRef.backdropClick().subscribe(() => {
        console.log('backdrop')
        this.dialogIsOpen.emit(false);
        dialogRef.dismiss()
      })
  }

  async merchantCheck(userData) {
    await this.merchantsService.merchantDefault().then((res) => {
      console.log(res)
      return res ? true : false;
    }).then(async (merchant) => {
      console.log(merchant)
      console.log(userData)
      if (!merchant) {
        await this.newMerchantCreation(userData)
      }
    })
    this.dialogIsOpen.emit(false);
  }

  async newMerchantCreation(userData) {
    console.log(userData)
    let newMerchant;
    await this.merchantsService.createMerchant({ owner: userData.user._id }).then((res) => {
      console.log(res)
      newMerchant = res.createMerchant._id;
    })
    await this.merchantsService.setDefaultMerchant(newMerchant).then((res) => {
      console.log(res)
    })
    let saleflow;
    await this.saleFlowService.createSaleflow({
      merchant: newMerchant,
    }).then((res) => {
      console.log(res)
      saleflow = res.createSaleflow._id;
    })
    await this.saleFlowService.setDefaultSaleflow(newMerchant, saleflow).then((res) => {
      console.log(res)
    })
  }

  async openMagicLinkDialog() {
    let fieldsToCreateInEmailDialog: FormData = {
      title: {
        text: 'Correo Electrónico:',
      },
      buttonsTexts: {
        accept: 'Recibir el enlace con acceso',
        cancel: 'Cancelar',
      },
      containerStyles: {
        padding: '35px 23px 38px 18px',
      },
      hideBottomButtons: true,
      fields: [
        {
          name: 'magicLinkEmailOrPhone',
          type: 'email',
          placeholder: 'Escribe el correo electrónico..',
          validators: [Validators.email, Validators.required],
          inputStyles: {
            padding: '11px 6px',
          },
          styles: {
            gap: '0px',
          },
          bottomTexts: [
            {
              text: 'Este correo también sirve para accesar al Club y aprovechar todas las herramientas que se están creando.',
              styles: {
                color: '#FFF',
                fontFamily: 'InterLight',
                fontSize: '19px',
                fontStyle: 'normal',
                fontWeight: '300',
                lineHeight: 'normal',
                marginBottom: '28px',
                marginTop: '36px',
              },
            },
          ],
          submitButton: {
            text: '>',
            styles: {
              borderRadius: '8px',
              background: '#87CD9B',
              padding: '6px 15px',
              color: '#181D17',
              textAlign: 'center',
              fontFamily: 'InterBold',
              fontSize: '17px',
              fontStyle: 'normal',
              fontWeight: '700',
              lineHeight: 'normal',
              position: 'absolute',
              right: '1px',
              top: '8px',
            },
            disabledStyles: {
              borderRadius: '8px',
              background: '#7b7b7b',
              padding: '6px 15px',
              color: 'white',
              textAlign: 'center',
              fontFamily: 'InterBold',
              fontSize: '17px',
              fontStyle: 'normal',
              fontWeight: '700',
              lineHeight: 'normal',
              position: 'absolute',
              right: '1px',
              top: '8px',

            }
          },
        },
      ],
    };

    this.emailDialogRef = this.dialog.open(LoginFormComponent, {
      data: fieldsToCreateInEmailDialog,
      position: {
        bottom: '0px'
      },
      disableClose: true,
    });

    this.emailDialogRef.backdropClick().subscribe(() => {
      this.dialogIsOpen.emit(false);
      this.emailDialogRef.close()
    })

    this.emailDialogRef.afterClosed().subscribe(async (result: FormGroup) => {
      if (result?.controls?.magicLinkEmailOrPhone.valid) {
        const exists = await this.checkIfUserExists(result?.controls?.magicLinkEmailOrPhone.value);
        if (exists) {
          await this.existingUserLoginFlow(
            result?.controls?.magicLinkEmailOrPhone.value,
            result?.controls?.magicLinkEmailOrPhone.valid
          );
        } else {
          await this.nonExistingUserLoginFlow(
            result?.controls?.magicLinkEmailOrPhone.value,
            result?.controls?.magicLinkEmailOrPhone.valid
          );
        }
      } else if (result?.controls?.magicLinkEmailOrPhone.valid === false) {
        this.dialogIsOpen.emit(false);
        this.snackbar.open('Datos invalidos', 'Cerrar', {
          duration: 3000,
        });
      }
    });
  }

  private async checkIfUserExists(emailOrPhone: string) {
    try {
      lockUI();
      const exists = await this.authService.checkUser(emailOrPhone);
      unlockUI();
      return exists;
    } catch (error) {
      console.log(error);
      unlockUI();
    }
  }

  private async nonExistingUserLoginFlow(credentials: string, isFormValid: boolean) {
    this.openTemplateCommerce(credentials)
  }

  //method currently not used
  async openTemplateUser(credentials: string) {
    let isUser = true;
    let formTemplateUser: FormData = {
      fields: [
        {
          label: 'Nombre:',
          name: 'name',
          type: 'text',
          validators: [Validators.pattern(/[\S]/), Validators.required],
          bottomButton: {
            text: 'Tengo un comercio',
            callback: () => {
              isUser = false;
              this.dialog.closeAll();
              this.openTemplateCommerce(credentials)
            },
            containerStyles: {
              position: 'absolute',
              top: '0px',
              left: '308px'
            }
          }
        },
        {
          label: 'Apellido:',
          name: 'lastname',
          type: 'text',
          validators: [Validators.pattern(/[\S]/), Validators.required],
        },
      ]
    }

    let dialogRef = this.dialog.open(FormComponent, {
      data: formTemplateUser,
      position: {
        bottom: '0px'
      }
    });
    if(isUser) {
      await dialogRef.afterClosed().subscribe((result) => {
          this.dialogIsOpen.emit(false);
          if (result.value.name && result.value.lastname) {
            this.authService.signup(
              {
                email: credentials,
                name: result.value.name,
                lastname: result.value.lastname,
                password: "123"
              },
              "none"
            ).then((res) => {
              console.log(res)
            })
            this.authService.generateMagicLink(
              credentials,
              this.redirectionRoute,
              this.redirectionRouteId,
              this.entity,
              {
                jsondata: this.jsondata,
              },
              []
            );
            let logins = JSON.parse(window.localStorage.getItem('logins')) || [];
            logins.push({
              name: result.value.name,
              email: credentials,
            });
            window.localStorage.setItem('logins', JSON.stringify(logins));

            this.dialogService.open(
              GeneralFormSubmissionDialogComponent,
              {
                type: 'centralized-fullscreen',
                props: {
                  icon: 'check-circle.svg',
                  showCloseButton: false,
                  message:
                    'Se ha enviado un link mágico a tu correo electrónico',
                },
                customClass: 'app-dialog',
                flags: ['no-header'],
              }
            );
          }
      });
    }
  }

  async openTemplateCommerce(credentials) {
    let isCommerce = true;
    let formTemplateCommerce: FormData = {
      fields: [
        {
          label: 'Nombre Comercial:',
          name: 'businessName',
          type: 'text',
          validators: [Validators.pattern(/[\S]/), Validators.required],
          /*bottomButton: {
            text: 'No tengo un comercio',
            callback: () => {
              isCommerce = false;
              this.dialog.closeAll();
              this.openTemplateUser(credentials)
            },
            containerStyles: {
              position: 'absolute',
              top: '0px',
              left: '283px'
            }
          }*/
        },
        {
          label: 'Whatsapp donde tus compradores te contactan:',
          name: 'phone',
          type: 'phone',
          validators: [Validators.required],
        },
      ],

    };

    let dialogRef = this.dialog.open(FormComponent, {
      data: formTemplateCommerce,
      position: {
        bottom: '0px'
      }
    });

    if(isCommerce) {
      await dialogRef.afterClosed().subscribe((result) => {
          this.dialogIsOpen.emit(false);
          console.log(result)
          if (result.value.phone && result.value.businessName) {
            let businessName = result.value.businessName;
            this.authService.signup(
              {
                email: credentials,
                phone: result.value.phone.e164Number,
                password: "123"
              },
              "none"
            ).then((res) => {
              this.merchantsService.createMerchant(
                {
                  name: businessName,
                  owner: res._id,
                }
              ).then((res) => {
                console.log(res)
              })
              this.authService.generateMagicLink(
                credentials,
                this.redirectionRoute,
                this.redirectionRouteId,
                this.entity,
                {
                  jsondata: this.jsondata,
                },
                [])

              let logins = JSON.parse(window.localStorage.getItem('logins')) || [];
              logins.push({
                name: businessName,
                email: credentials,
              });
              window.localStorage.setItem('logins', JSON.stringify(logins));

              this.dialogService.open(
                GeneralFormSubmissionDialogComponent,
                {
                  type: 'centralized-fullscreen',
                  props: {
                    icon: 'check-circle.svg',
                    showCloseButton: false,
                    message:
                      'Se ha enviado un link mágico a tu correo electrónico',
                  },
                  customClass: 'app-dialog',
                  flags: ['no-header'],
                }
              );
            })
        }
      });
    }
  }

  private async existingUserLoginFlow(credentials: any, isFormValid: boolean) {
    const emailOrPhone = credentials;

    let optionsDialogTemplate: DialogTemplate = {
      // TODO - Validar si es correo o telefono (actualmente se da por entendido que es solo correo)
      title: `Bienvenido de vuelta ${credentials}, prefieres:`,
      options: [
        {
          value: 'Con mi clave',
          callback: async () => {
            await this.addPassword(emailOrPhone);
          },
        },
        {
          value: `Desde mi correo (recibirás el acceso en ${emailOrPhone})`,
          callback: async () => {
            if (isFormValid) {
              const validEmail = new RegExp(
                /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/gim
              );

              let emailOrPhone = null;

              if (
                typeof credentials ===
                'string' &&
                validEmail.test(credentials)
              ) {
                emailOrPhone = credentials;
              } else {
                emailOrPhone =
                  credentials.e164Number.split(
                    '+'
                  )[1];
              }

              // lockUI();

              await this.authService.generateMagicLink(
                emailOrPhone,
                this.redirectionRoute,
                this.redirectionRouteId,
                this.entity,
                {
                  jsondata: this.jsondata,
                },
                []
              );

              unlockUI();
              

              this.dialogService.open(
                GeneralFormSubmissionDialogComponent,
                {
                  type: 'centralized-fullscreen',
                  props: {
                    icon: 'check-circle.svg',
                    showCloseButton: false,
                    message:
                      'Se ha enviado un link mágico a tu correo electrónico',
                  },
                  customClass: 'app-dialog',
                  flags: ['no-header'],
                }
              );
            } else if (
              isFormValid === false
            ) {
              unlockUI();
              this.snackbar.open('Datos invalidos', 'Cerrar', {
                duration: 3000,
              });
            }
          },
        },
      ],
    };

    this.bottomSheet.open(OptionsMenuComponent, {
      data: optionsDialogTemplate,
      disableClose: false,
    });
  }

  private typeOfMerchantFlow(credentials: any) {
    let optionsDialogTemplate: DialogTemplate = {
      title: `¿Qué tipo de comercio tienes?`,
      options: [
        {
          value: 'Soy tienda, vendo al consumidor final',
          callback: async () => {
            return this.router.navigate(
              ['/ecommerce/merchant-register'],
              {
                queryParams: {
                  credentials: credentials,
                  type: 'vendor',
                }
              }
            );
            // await this.registeringUserFlow(credentials);
          },
        },
        {
          value: 'Soy proveedor, le vendo a tiendas',
          callback: async () => {
            return this.router.navigate(
              ['/ecommerce/merchant-register'],
              {
                queryParams: {
                  credentials: credentials,
                  type: 'supplier',
                }
              }
            );
            // await this.registeringUserFlow(credentials);
          },
        },
      ],
    };

    this.dialog.open(OptionsMenuComponent, {
      data: optionsDialogTemplate,
      disableClose: true,
    });
  }

  private async addPassword(emailOrPhone: string) {
    if(this.emailDialogRef) {
      console.log('no mail')
      this.emailDialogRef.close()
    };
    this.loginEmail = null;
    console.log(emailOrPhone, 'notnull')
    let fieldsToCreate: FormData = {
      title: {
        text: 'Clave de Acceso:',
      },
      buttonsTexts: {
        accept: 'Accesar al Club',
        cancel: 'Cancelar',
      },
      fields: [
        {
          name: 'password',
          type: 'password',
          placeholder: 'Escribe la contraseña',
          validators: [Validators.pattern(/[\S]/)],
          bottomButton: {
            text: 'Prefiero recibir el correo con el enlace de acceso',
            callback: () => {
              //Cerrar 2do dialog
              this.loginEmail = null;
              return switchToMagicLinkDialog();
            },
          },
        },
      ],
    };

    const dialog2Ref = this.dialog.open(LoginFormComponent, {
      data: fieldsToCreate,
      disableClose: true,
    });

    dialog2Ref.afterClosed().subscribe(async (result: FormGroup) => {
      this.loginEmail = null;
      try {
        if (result?.controls?.password.valid) {
          let password = result?.value['password'];

          lockUI();

          const session = await this.authService.signin(
            emailOrPhone,
            password,
            true
          );
          console.log("🚀 ~ file: login-flow.component.ts:579 ~ LoginFlowComponent ~ dialog2Ref.afterClosed ~ session:", session)

          if (!session) throw new Error('invalid credentials');

          this.openNavigation = true;
          let merchantName;
          await this.merchantsService.merchantDefault().then((res) => {
            merchantName = res.name;
          })
          let logins : any[] = JSON.parse(window.localStorage.getItem('logins')) || [];
          if(!logins.find((login) => login.email === emailOrPhone)) {
            logins.push({
              name: merchantName ? merchantName: this.headerService.user.name,
              email: emailOrPhone,
            });
            window.localStorage.setItem('logins',JSON.stringify(logins));
          }
          unlockUI();
          this.dialogIsOpen.emit(false);
        } else if (result?.controls?.password.valid === false) {
          unlockUI();
          this.snackbar.open('Datos invalidos', 'Cerrar', {
            duration: 3000,
          });
        }
      } catch (error) {
        unlockUI();
        console.error(error);
        this.headerService.showErrorToast();

      }
    });

    const switchToMagicLinkDialog = () => {
      dialog2Ref.close();
      return this.openMagicLinkDialog();
    };
  };

  private async registeringUserFlow(credentials: any) {
    let fieldsToCreateInEmailDialog: FormData = {
      // title: {
      //   text: 'Acceso al Club:',
      // },
      buttonsTexts: {
        accept: 'Guardar mis datos comerciales',
        cancel: 'Cancelar',
      },
      containerStyles: {
        padding: '35px 23px 38px 18px',
      },
      fields: [
        {
          label: 'Nombre Comercial:',
          name: 'name',
          type: 'text',
          placeholder: 'Escribe el nombre comercial..',
          validators: [Validators.pattern(/[\S]/), Validators.required],
          inputStyles: {
            padding: '11px 1px',
          },
        },
        {
          label: 'WhatsApp donde tus compradores te contactan:',
          name: 'phone',
          type: 'phone',
          placeholder: 'Escribe el teléfono..',
          validators: [Validators.pattern(/[\S]/), Validators.required],
          inputStyles: {
            padding: '11px 1px',
          },
        },
        {
          label: 'País y ciudades donde tus compradores reciben lo que te compran:',
          name: 'country',
          type: 'text',
          placeholder: 'Escribe el teléfono..',
          validators: [Validators.pattern(/[\S]/), Validators.required],
          inputStyles: {
            padding: '11px 1px',
          },
        },
        {
          label: 'Industria de tu comercio:',
          name: 'industry',
          type: 'text',
          placeholder: 'Escribe el teléfono..',
          validators: [Validators.pattern(/[\S]/), Validators.required],
          inputStyles: {
            padding: '11px 1px',
          },
        },
      ],
    };

    this.emailDialogRef = this.dialog.open(LoginFormComponent, {
      data: fieldsToCreateInEmailDialog,
      disableClose: true,
    });

    // TODO - Capturar el evento de cerrar el dialogo y hacer el flujo de registro
  }
}
