import { Component, OnInit } from '@angular/core';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FormComponent } from 'src/app/shared/dialogs/form/form.component';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { AuthService } from 'src/app/core/services/auth.service';
import { OptionsDialogTemplate, OptionsDialogComponent } from 'src/app/shared/dialogs/options-dialog/options-dialog.component';
import { FormGroup, Validators } from '@angular/forms';
import { FormData } from 'src/app/shared/dialogs/form/form.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HeaderService } from 'src/app/core/services/header.service';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { GeneralFormSubmissionDialogComponent } from 'src/app/shared/dialogs/general-form-submission-dialog/general-form-submission-dialog.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-proflora-link-dialog',
  templateUrl: './proflora-link-dialog.component.html',
  styleUrls: ['./proflora-link-dialog.component.scss']
})
export class ProfloraLinkDialogComponent {

  emailDialogRef: MatDialogRef<FormComponent, any> = null;
  openNavigation = false
  
  constructor(
    private _bottomSheetRef: MatBottomSheetRef,
    private dialog: MatDialog,
    private authService: AuthService,
    private snackbar: MatSnackBar,
    private headerService: HeaderService,
    private dialogService: DialogService,
    private router: Router
  ) { }

  tabProvider = [
    {
      text: "🌼 Vitrina Online de ComercioID",
      routerLink: ["/admin/supplier-dashboard"],
      linkName: "",
      queryParams: {
        supplierMode: true
      },
      authorization: true,
      isDummy: false,
      isShowDialog: false
    },
    {
      text: "🧾 Facturas",
      routerLink: ["/admin/order-progress"],
      linkName: "",
      queryParams: {},
      authorization: true,
      isDummy: false,
      isShowDialog: false
    },
    {
      text: "🛟 Cotizaciones de Artículos que pudiera comprar",
      routerLink: ["/admin/supplier-dashboard"],
      linkName: "",
      queryParams: {
        supplierMode: true
      },
      authorization: true,
      isDummy: false,
      isShowDialog: false
    },
    {
      text: "🏷️ Tienda con Artículos que pudiera comprar",
      routerLink: ["/admin/supplier-dashboard"],
      linkName: "",
      queryParams: {
        supplierMode: true
      },
      authorization: true,
      isDummy: false,
      isShowDialog: true
    },
    {
      text: "⚡️️ Ver ofertas flash que pudiera comprar",
      routerLink: ["/admin/supplier-dashboard"],
      linkName: "",
      queryParams: {
        supplierMode: true
      },
      authorization: true,
      isDummy: false,
      isShowDialog: false
    },
    {
      text: "🧞‍♂️‍️️️ Crea ofertas flash para vender",
      routerLink: ["/admin/supplier-dashboard"],
      linkName: "",
      queryParams: {
        supplierMode: true
      },
      authorization: true,
      isDummy: false,
      isShowDialog: false
    },
    {
      text: "📦 Seguimiento de los pedidos",
      routerLink: ["/admin/supplier-dashboard"],
      linkName: "",
      queryParams: {
        supplierMode: true
      },
      authorization: true,
      isDummy: false,
      isShowDialog: false
    },
    {
      text: "💸 Seguimiento del dinero por factura",
      routerLink: ["/admin/supplier-dashboard"],
      linkName: "",
      queryParams: {
        supplierMode: true
      },
      authorization: true,
      isDummy: false,
      isShowDialog: false
    },
    {
      text: "🛒 Carritos y cotizaciones de lo que vendo",
      routerLink: ["/admin/supplier-dashboard"],
      linkName: "",
      queryParams: {
        supplierMode: true
      },
      authorization: true,
      isDummy: false,
      isShowDialog: false
    },
    {
      text: "📢 Mercado de Referencias",
      routerLink: ["/admin/supplier-dashboard"],
      linkName: "",
      queryParams: {
        supplierMode: true
      },
      authorization: true,
      isDummy: false,
      isShowDialog: false
    },
    {
      text: "✨ Recompensas de Compradores",
      routerLink: ["/admin/supplier-dashboard"],
      linkName: "",
      queryParams: {
        supplierMode: true
      },
      authorization: true,
      isDummy: false,
      isShowDialog: false
    },
    {
      text: "🎁 Premios de seguidores que te mencionan",
      routerLink: ["/admin/supplier-dashboard"],
      linkName: "",
      queryParams: {
        supplierMode: true
      },
      authorization: true,
      isDummy: false,
      isShowDialog: false
    },
    {
      text: "💰 Control, Beneficios e Impuestos",
      routerLink: ["/admin/supplier-dashboard"],
      linkName: "",
      queryParams: {
        supplierMode: true
      },
      authorization: true,
      isDummy: false,
      isShowDialog: false
    },
    {
      text: "✋ Analiza las opiniones de los compradores",
      routerLink: ["/admin/supplier-dashboard"],
      linkName: "",
      queryParams: {
        supplierMode: true
      },
      authorization: true,
      isDummy: false,
      isShowDialog: false
    },
    {
      text: "💚 Monetizaciones mensual invitando al Club ",
      routerLink: ["/admin/supplier-dashboard"],
      linkName: "",
      queryParams: {
        supplierMode: true
      },
      authorization: true,
      isDummy: false,
      isShowDialog: false
    },
  ]

  ngOnInit(): void {
    
    const element: HTMLElement = document.querySelector('.mat-bottom-sheet-container');

    element.style.maxHeight = 'unset';
    element.style.padding = '0px';
  }

  openEmailDialog() {
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
          validators: [Validators.pattern(/[\S]/), Validators.required],
          inputStyles: {
            padding: '11px 1px',
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
          },
        },
      ],
    };

    this.emailDialogRef = this.dialog.open(FormComponent, {
      data: fieldsToCreateInEmailDialog,
      disableClose: false,
    });

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
  private async existingUserLoginFlow(credentials: any, isFormValid: boolean) {
    const emailOrPhone = credentials;

    let optionsDialogTemplate: OptionsDialogTemplate = {
      // TODO - Validar si es correo o telefono (actualmente se da por entendido que es solo correo)
      title: `Bienvenido de vuelta ${credentials}, prefieres:`,
      options: [
        {
          value: 'Prefiero acceder con la clave',
          callback: async () => {
            await this.addPassword(emailOrPhone);
          },
        },
        {
          value: 'Prefiero recibir el enlace de acceso en mi correo',
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
                '/ecommerce/club-landing',
                null,
                'MerchantAccess',
                {
                  jsondata: JSON.stringify({
                    openNavigation: true,
                  }),
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
        {
          value: 'Algo anda mal porque es la primera vez que trato de acceder con este correo',
          callback: () => {
            const phone = '19188156444';
            const message = 'Algo anda mal porque es la primera vez que trato de acceder con este correo';
            window.location.href = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`;
          }
        }
      ],
    };

    this.dialog.open(OptionsDialogComponent, {
      data: optionsDialogTemplate,
      disableClose: true,
    });
  }

  private async nonExistingUserLoginFlow(credentials: any, isFormValid: boolean) {
    const emailOrPhone = credentials;

    let optionsDialogTemplate: OptionsDialogTemplate = {
      title: `Notamos que es la primera vez que intentas acceder con este correo, prefieres:`,
      options: [
        {
          value: 'Empezar mi Membresía al Club con este correo electrónico',
          callback: async () => {
            this.typeOfMerchantFlow(credentials);
          },
        },
        {
          value: 'Intentar con otro correo electrónico.',
          callback: async () => {
            await this.openMagicLinkDialog();
          },
        },
        {
          value: 'Algo anda mal porque no es la primera vez que trato de acceder con este correo',
          callback: () => {
            const phone = '19188156444';
            const message = 'Algo anda mal porque no es la primera vez que trato de acceder con este correo';
            window.location.href = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`;
          }
        }
      ],
    };

    this.dialog.open(OptionsDialogComponent, {
      data: optionsDialogTemplate,
      disableClose: true,
    });
  }
  private async addPassword (emailOrPhone: string) {
    this.emailDialogRef.close();


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

              return switchToMagicLinkDialog();
            },
          },
        },
      ],
    };

    const dialog2Ref = this.dialog.open(FormComponent, {
      data: fieldsToCreate,
      disableClose: true,
    });

    dialog2Ref.afterClosed().subscribe(async (result: FormGroup) => {
      try {
        if (result?.controls?.password.valid) {
          let password = result?.value['password'];

          lockUI();

          const session = await this.authService.signin(
            emailOrPhone,
            password,
            true
          );

          if (!session) throw new Error('invalid credentials');

          this.openNavigation = true;

          unlockUI();
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
          validators: [Validators.pattern(/[\S]/), Validators.required],
          inputStyles: {
            padding: '11px 1px',
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
          },
        },
      ],
    };

    this.emailDialogRef = this.dialog.open(FormComponent, {
      data: fieldsToCreateInEmailDialog,
      disableClose: false,
    });

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
        this.snackbar.open('Datos invalidos', 'Cerrar', {
          duration: 3000,
        });
      }
    });
  }
  private typeOfMerchantFlow(credentials: any) {
    let optionsDialogTemplate: OptionsDialogTemplate = {
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

    this.dialog.open(OptionsDialogComponent, {
      data: optionsDialogTemplate,
      disableClose: true,
    });
  }

  close() {
    this._bottomSheetRef.dismiss();
  }
}
