import {
  Component,
  OnInit,
  ViewChildren,
  ElementRef,
  QueryList,
  Inject,
} from '@angular/core';
import {
  MatBottomSheetRef,
  MAT_BOTTOM_SHEET_DATA,
} from '@angular/material/bottom-sheet';
import { environment } from 'src/environments/environment';
import { HeaderService } from 'src/app/core/services/header.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { SwiperOptions } from 'swiper';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import {
  OptionsDialogComponent,
  OptionsDialogTemplate,
} from 'src/app/shared/dialogs/options-dialog/options-dialog.component';
import { GeneralFormSubmissionDialogComponent } from '../general-form-submission-dialog/general-form-submission-dialog.component';
import {
  FormComponent,
  FormData,
} from 'src/app/shared/dialogs/form/form.component';
import { AuthService } from 'src/app/core/services/auth.service';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { FormGroup, Validators } from '@angular/forms';
export interface DialogOptions {
  title: string;
  link?: string;
  icon?: string;
  callback: () => void;
}

export interface DialogSecondaryOptions {
  title: string;
  link?: string;
  callback: () => void;
}

export interface DialogTemplate {
  title: string;
  styles?: Record<string, Record<string, boolean>>;
  tabIndex: number;
  callback: (e: number) => void;
}

interface Tabs {
  text: string;
  subTabs?: Array<{
    text: string;
    active: boolean;
    content?: string[];
  }>;
  active?: boolean;
}

@Component({
  selector: 'app-club-dialog',
  templateUrl: './club-dialog.component.html',
  styleUrls: ['./club-dialog.component.scss']
})
export class ClubDialogComponent implements OnInit {

  tabIndex = 0
  openNavigation = false
  tabProvider = [
    {
      text: "🌼 Vitrina Online, para que vendas fácil",
      routerLink: ["/ecommerce/supplier-items-selector"],
      linkName: "",
      queryParams: {
        supplierMode: true
      },
      authorization: false,
      isDummy: false,
      isShowDialog: false
    },
    {
      text: "🧞‍♂️‍️️️ Ofertas Flash, para que vendas más",
      routerLink: ["/admin/order-progress"],
      linkName: "",
      queryParams: {},
      authorization: true,
      isDummy: false,
      isShowDialog: false
    },
    {
      text: "📦 Control, seguimiento de los pedidos",
      routerLink: ["/admin/supplier-dashboard"],
      linkName: "",
      queryParams: {
        supplierMode: true
      },
      authorization: true,
      isDummy: true,
      isShowDialog: false
    },
    {
      text: "✨ Recompensas, para fidelizar a Compradores",
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
      text: "🎁 Premios, para incentivar a que te mencionen en las redes sociales",
      routerLink: ["/admin/merchant-offers"],
      linkName: "",
      queryParams: {
        supplierMode: true
      },
      authorization: true,
      isDummy: false,
      isShowDialog: false
    },
    {
      text: "📢 Colaborar con Embajadores, para que alcances a sus seguidores",
      routerLink: ["/admin/items-offers"],
      linkName: "",
      queryParams: {
        supplierMode: true
      },
      authorization: true,
      isDummy: false,
      isShowDialog: false
    },
    {
      text: "🛒 Cotizar a potenciales compradores",
      routerLink: ["/admin/order-progress"],
      linkName: "",
      queryParams: {
        supplierMode: true
      },
      authorization: true,
      isDummy: false,
      isShowDialog: false
    },
    {
      text: "🏷️ Mostrarte artículos que pudieras comprar y sus ofertas para que ahorre$",
      routerLink: ["/"],
      linkName: "",
      queryParams: {
        supplierMode: true
      },
      authorization: true,
      isDummy: true,
      isShowDialog: false
    },
    {
      text: "💸 Beneficios por factura, para saber la realidad del costo de cada venta",
      routerLink: ["/"],
      linkName: "",
      queryParams: {
        supplierMode: true
      },
      authorization: true,
      isDummy: true,
      isShowDialog: false
    },
    {
      text: "💰 Ingresos y Egresos, para que sepas exactamente lo que ganas después de impuestos",
      routerLink: ["/"],
      linkName: "",
      queryParams: {
        supplierMode: true
      },
      authorization: true,
      isDummy: true,
      isShowDialog: false
    },
    {
      text: "✋ Análisis de las opiniones de los compradores para que innoves y crezcas",
      routerLink: ["/"],
      linkName: "",
      queryParams: {
        supplierMode: true
      },
      authorization: true,
      isDummy: true,
      isShowDialog: false
    }
  ]
  tabs: Array<Tabs> = [
    {
      text: 'Control',
      subTabs: [
        {
          text: 'Ordenes',
          active: true,
          content: [
            '“.. puedo ver el estado actualizado de cada orden desde mi celular”',
            '“.. la función de notificar a los clientes por WhatsApp o correo electrónico es una verdadera maravilla!”',
            '“¡Es como magia para mantener todo bajo control!”',
            '“.. me permite estar al tanto de cada orden de una manera que nunca imaginé”',
            '“.. puedo filtrar las facturas según su estado para priorizar lo que necesito atender primero”',
            '“.. es como tener a tu asistente personal siempre contigo”',
            '“.. puedo ver qué órdenes necesitan mi atención inmediata y cuáles están en camino”',
          ],
        },
        {
          text: 'Entregas',
          active: false,
          content: [
            '“.. puedo cobrar extra según la zona de entrega especificada por el comprador”',
            '“..  maximizo lo que cobro y me permite entregar mas lejos”',
            '“..  me muestra un enfoque estratégico de las entregas y eso me ayuda en la logística para entregar a tiempo”',
          ],
        },
        {
          text: 'Clientes',
          active: false,
          content: [
            '“.. los reportes que puedo exportar me ayudan a planificar y ejecutar campañas”',
            '“..  puedo dirigir mis mensajes a grupos específicos con información precisa basado en sus preferencias”',
            '“..  tener una visión clara de quiénes son mis compradores y qué quieren”',
          ],
        },
      ],
      active: false,
    },
    {
      text: 'Más Ventas',
      subTabs: [
        {
          text: '#hashtags',
          active: false,
          content: [
            '“.. asigno un simple #hashtag y, voilà, los interesados pueden dirigirse directamente a la compra desde cualquier red social”',
            '“.. es una manera genial de simplificar el proceso de compra desde las plataformas sociales”',
            '“.. convierto a los seguidores en compradores de manera rápida y sencilla”',
          ],
        },
        {
          text: 'Proveedores',
          active: true,
          content: [
            '“.. puedo acceder a una red amplia de proveedores de flores en un abrir y cerrar de ojos.”',
            '¡Esta función de Cotización Eficiente con Proveedores en la aplicación es como tener un equipo de compras personal a tu disposición!',
            '“.. es como si los proveedores compitieran por ofrecerme las mejores ofertas, lo cual me siento confiado de donde comprar”',
            '“.. me permite conectarme con un montón de proveedores y pedir cotizaciones en cuestión de minutos”',
            '“.. significa que puedo tomar decisiones más inteligentes y aumentar mis ganancias”',
            '“.. puedo pedir cotizaciones y luego simplemente comparar y elegir la opción más conveniente”',
            '“.. no solo ahorro dinero, sino que también ahorro tiempo al evitar largas negociaciones, realmente es un ganar-ganar”',
          ],
        },
        {
          text: 'Premios',
          active: false,
          content: [
            '“.. brindo incentivos a mis clientes, lo que realmente fomenta la fidelidad y la satisfacción”',
            '“.. el programa de recompensar su lealtad es simplemente brillante”',
            '“..  los premios no solo los mantiene contentos, sino que también crea un vínculo más sólido con nosotros”',
          ],
        },
      ],
      active: true,
    },
  ];
  activeTabIndex: number = 0;

  swiperConfig: SwiperOptions = {
    slidesPerView: 1,
    freeMode: false,
    spaceBetween: 0,
    pagination: {
      el: '.swiper-pagination',
      type: 'bullets',
      clickable: true,
    },
  };
  emailDialogRef: MatDialogRef<FormComponent, any> = null;

  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: DialogTemplate,
    private _bottomSheetRef: MatBottomSheetRef,
    public headerService: HeaderService,
    private router: Router,
    private dialog: MatDialog,
    private snackbar: MatSnackBar,
    private authService: AuthService,
    private dialogService: DialogService
  ) {}

  env: string = environment.assetsUrl;
  URI: string = environment.uri;
  

  ngOnInit(): void {
    if(this.data && this.data.styles && this.data.styles['fullScreen']) {
      const element: HTMLElement = document.querySelector('.mat-bottom-sheet-container');
      element.style.maxHeight = 'unset';
    }
    if (this.data.tabIndex) {
      console.log("tabIndex1")
    }
    this.tabIndex = this.data.tabIndex
  }

  redirectToLink(link: any) {
    this.headerService.flowRouteForEachPage[link.linkName] = this.router.url;

    if (link.isDummy) {
      const message = `Hola, me interesa esta funcionalidad: ${link.text}`;
      const phone = '19188156444';
      window.location.href = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`;
      return;
    }

    this.headerService.flowRoute = this.headerService.buildURL(
      link.routerLink.join('/'),
      link.queryParams ? link.queryParams : null
    );

    this.router.navigate(link.routerLink, {
      queryParams: link.queryParams ? link.queryParams : {},
    });

    this._bottomSheetRef.dismiss();
  }

  changeTab(tabIndex: number) {
    this.tabs[tabIndex].active = true;
    this.activeTabIndex = tabIndex;

    this.tabs.forEach((tab, index) => {
      if (index !== tabIndex) tab.active = false;
    });
  }

  changeSubtab(tabIndex: number, subTabIndex: number) {
    this.tabs[tabIndex].subTabs[subTabIndex].active = true;

    this.tabs[tabIndex].subTabs.forEach((subTab, index) => {
      if (index !== subTabIndex) subTab.active = false;
    });
  }

  openLink(event?: MouseEvent): void {
    this._bottomSheetRef.dismiss();
    if (event) event.preventDefault();
  }

  onClick(index: number) {
    this.data.callback(index)
    this.tabIndex = index
    this._bottomSheetRef.dismiss();
  }

  share() {
    if (!this.headerService.user) {
      this.openMagicLinkDialog()
    }
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

}
