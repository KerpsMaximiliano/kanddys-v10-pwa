import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { HeaderService } from 'src/app/core/services/header.service';
import { SwiperOptions } from 'swiper';
import { environment } from 'src/environments/environment';
import { NgNavigatorShareService } from 'ng-navigator-share';
import { Location } from '@angular/common';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatIcon } from '@angular/material/icon';
import { OptionsMenuComponent } from 'src/app/shared/dialogs/options-menu/options-menu.component';
import { ClubDialogComponent } from 'src/app/shared/dialogs/club-dialog/club-dialog.component';
import { MessageDialogComponent } from 'src/app/shared/dialogs/message-dialog/message-dialog.component';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { ItemsService } from 'src/app/core/services/items.service';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { GeneralFormSubmissionDialogComponent } from 'src/app/shared/dialogs/general-form-submission-dialog/general-form-submission-dialog.component';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { PaginationInput } from 'src/app/core/models/saleflow';

import {
  FormComponent,
  FormData,
} from 'src/app/shared/dialogs/form/form.component';
import { FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  OptionsDialogComponent,
  OptionsDialogTemplate,
} from 'src/app/shared/dialogs/options-dialog/options-dialog.component';
import { MerchantsService } from 'src/app/core/services/merchants.service';

import { SelectRoleDialogComponent } from 'src/app/shared/dialogs/select-role-dialog/select-role-dialog.component';
import { SpecialDialogComponent } from 'src/app/shared/dialogs/special-dialog/special-dialog.component';
import { CompareDialogComponent } from 'src/app/shared/dialogs/compare-dialog/compare-dialog.component';
import { Clipboard } from '@angular/cdk/clipboard';
import { base64ToBlob } from 'src/app/core/helpers/files.helpers';

interface ReviewsSwiper {
  title: string;
  slides: Array<{
    content: string;
  }>;
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
  selector: 'app-club-landing',
  templateUrl: './club-landing.component.html',
  styleUrls: ['./club-landing.component.scss'],
})
export class ClubLandingComponent implements OnInit, OnDestroy {
  assetsFolder: string = environment.assetsUrl;
  URI: string = environment.uri;
  openNavigation: boolean = false;
  queryParamsSubscription: Subscription = null;
  routerParamsSubscription: Subscription = null;

  isFlag = false;
  tabIndex = 0;
  userID = ""
  isVendor = false;
  isProvider = false;
  mainTitle = "HERRAMIENTAS GRATIS  PARA PROVEEDORES"
  isOpen = false;
  curRole = 0;
  tabarIndex = 0;

  list = [
    {
      text: '\"Laia, nos impulsa a avanzar para no quedarnos atrás\"',
      avatar: '',
      name: 'José Miguel Caffaro',
      role: 'Proveedor de flores frescas, follajes y bases'
    },
    {
      text: '\"Laia, nos impulsa a avanzar para no quedarnos atrás\"',
      avatar: '',
      name: 'José Miguel Caffaro',
      role: 'Proveedor de flores frescas, follajes y bases'
    },
    {
      text: '\"Laia, nos impulsa a avanzar para no quedarnos atrás\"',
      avatar: '',
      name: 'José Miguel Caffaro',
      role: 'Proveedor de flores frescas, follajes y bases'
    }
  ]

  activeTabIndex: number = 0;

  swipers: Array<ReviewsSwiper> = [
    {
      title: 'LO QUE MAS LE GUSTA A LAS FLORISTERIAS',
      slides: [
        {
          content:
            '“.. lo de las ventas a través de WhatsApp, mensajes de video para clientes, comunicación de estado de pedidos, y la base de datos de mis clientes segmentada”',
        },
        {
          content:
            '“.. lo fácil que es convertir cotizaciones en compras y mantener un seguimiento de todas las transacciones, me ayuda a gestionar los costos y mi inventario”',
        },
        {
          content:
            '“.. me aseguro de ahorrarme $ al obtener las cotizaciones de múltiples proveedores al mismo tiempo”',
        },
      ],
    },
    {
      title: 'LO QUE MAS LE GUSTA A LOS PROVEEDORES',
      slides: [
        {
          content:
            '“.. es que no hay manera más fácil de cotizarles a las floristerías, me ahorra tiempo y una empleada.”',
        },
        {
          content:
            '“.. las floristerías convierten las cotizaciones en compras con un solo clic y eso simplifica el proceso de venta”',
        },
      ],
    },
  ];
  link: string = this.URI;
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

  @ViewChild('qrcode', { read: ElementRef }) qrcode: ElementRef;

  constructor(
    public headerService: HeaderService,
    private ngNavigatorShareService: NgNavigatorShareService,
    private bottomSheet: MatBottomSheet,
    private itemsService: ItemsService,
    private dialogService: DialogService,
    private dialog: MatDialog,
    private snackbar: MatSnackBar,
    private authService: AuthService,
    private merchantsService: MerchantsService,
    private route: ActivatedRoute,
    private router: Router,
    private clipboard: Clipboard,
  ) {}

  ngOnInit() {
    this.openLaiaDialog()
  }

  showRoleDialog() {
    const dialogRef = this.dialog.open(SelectRoleDialogComponent, {});
    dialogRef.afterClosed().subscribe(role => {
      if (role != undefined) {
        this.setRole(parseInt(role))
        return
      }
      switch (role) {
        case "0":
          
          break;
        case "1":
          
          break;
        case "2":
          
          break;
        case "3":
          
          break;
        case "4":
        
          break;
        case "5":
        
          break;
      
        default:
          break;
      }
    });
  }

  setRole(role: number) {
    this.curRole = role;
    switch (role) {
      case 0:
        this.tabIndex = 0
        break;
      case 1:
        this.tabIndex = 1
        break;
      case 2:
        this.tabIndex = 1
        break;
      case 3:
        this.tabIndex = 0
        break;  
      default:
        this.tabIndex = 1;
        break;
      }
      this.isOpen = false;
  }

  shareDialog() {
    const dialogRef = this.bottomSheet.open(OptionsMenuComponent, {
      data: {
        title: "Compartir enlace",
        options: [
          {
            value: "Copiar enlace",
            callback: () => {
              this.clipboard.copy(this.link);
              this.snackbar.open("Enlace copiado", "Cerrar", {
                duration: 3000,
              });
            },
          },
          {
            value: "Compartir enlace",
            callback: () => {
              this.ngNavigatorShareService.share({
                title: "Compartir enlace de www.flores.club",
                url: `${this.link}`,
              });
            },
          },
          {
            value: "Enviar por WhatsApp",
            callback: () => {
              const message = `${this.link}`;
              window.location.href = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
            },
          },
          {
            value: "Enviar por correo electrónico",
            callback: () => {
              window.location.href = `mailto:?body=${this.link}`;
            },
          },
          {
            value: "Descargar QR",
            callback: () => {
              this.downloadQr()
            }
          }
        ]
      },
    });
  }

  showDialog() {
    const dialogRef = this.dialog.open(SpecialDialogComponent, {});
    const link = `${this.URI}/ecommerce/club-landing`;

    dialogRef.afterClosed().subscribe(role => {
      if (!role) {
        // this.setRole(parseInt(role))
        return
      }
      console.log(role)
      switch (role) {
        case "0":
          this.ngNavigatorShareService.share({
            title: '',
            url: `${link}`,
          });
          break;
        case "1":
          this.ngNavigatorShareService.share({
            title: '',
            url: `${link}`,
          });
          break;
        case "2":
          const message = `${link}`;
          const phone = '19188156444';
          window.location.href = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
          break;
        case "3":
          window.location.href = "mailto:"
          break;
        default:
          break;
      }
    });
  }

  close() {
    // if (this.headerService.user) this.location.back();
    this.openNavigation = true;
  }

  openLaiaDialog() {
    this.bottomSheet.open(OptionsMenuComponent, {
      data: {
        title: "LaiaChat con desconocido de la industria floral",
        description:"Hola, soy Laia, en que te puedo ser mas útil?",
        options: [
          {
            value: "En lo que compras",
            callback: () => {
            },
          },
          {
            value: "En lo que vendes",
            callback: () => {
            },
          },
          {
            value: "Quisieras vender más",
            callback: () => {
            },
          },
          {
            value: "En el seguimiento de lo que vendiste",
            callback: () => {
            },
          },
          {
            value: "En el control de tus ingresos y egresos",
            callback: () => {
            },
          },
        ],
        styles: {
          title:{
            color: "var(--Fondo-de-Pantallas, #F6F6F6)",
            fontFamily: "Inter",
            fontSize: "16px",
          },
          description: {
            borderRadius: "57.335px",
            opacity: "0.8",
            backgroundColor: "var(--El-verdecito, #87CD9B)",
            color: "var(--El-mas-oscuro, #181D17)",
            fontFamily: "Inter",
            fontSize: "16.107px",
            width: "215px",
            padding: "6px 12px",
          },
          noDarkOverlay: true,
          lightBg: true,
        },
      },
    });
  }

  openClubDialog() {
    this.bottomSheet.open(ClubDialogComponent, {
      data: {
        title: "",
        styles: {
          fullScreen: true,
        },
        tabIndex: this.tabIndex,
        callback: (e: number) => {
          this.tabIndex = e;
        }
      },
    });
  }
  openCompareDialog(){
    this.bottomSheet.open(CompareDialogComponent, {
      data: {
        title: "",
        styles: {
          fullScreen: true,
        },
        tabIndex: this.tabIndex,
        callback: (e: number) => {
          this.tabIndex = e;
        }
      },
    });
  }
  openMsgDialog() {
    const dialogRef = this.dialog.open(MessageDialogComponent, {});

    dialogRef.afterClosed().subscribe(role => {
      if (!role) {
        // this.setRole(parseInt(role))
        return
      }
      console.log(role)
    });
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

    this.close();
  }

  share() {
    if (!this.headerService.user) {
      this.openMagicLinkDialog()
    }
    // else this.showDialog()
  }

  enterClub() {
    if(!this.headerService.user) this.openMagicLinkDialog();
    else this.showDialog()
  }

  ngOnDestroy(): void {
    this.queryParamsSubscription.unsubscribe();
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

    this.emailDialogRef = this.dialog.open(FormComponent, {
      data: fieldsToCreateInEmailDialog,
      disableClose: true,
    });

    // TODO - Capturar el evento de cerrar el dialogo y hacer el flujo de registro
  }

  sendWhatsappToAppOwner(emailOrPhone: string) {
    let message =
      `Algo anda mal porque es la primera vez que trato de acceder con este correo: ` +
      emailOrPhone;

    const whatsappLink = `https://api.whatsapp.com/send?phone=19188156444&text=${encodeURIComponent(
      message
    )}`;

    window.location.href = whatsappLink;
  }

  downloadQr() {
    const parentElement =
      this.qrcode.nativeElement.querySelector('img').src;
    let blobData = base64ToBlob(parentElement);
    if (window.navigator && (window.navigator as any).msSaveOrOpenBlob) {
      //IE
      (window.navigator as any).msSaveOrOpenBlob(blobData, 'Landing QR Code');
    } else {
      // chrome
      const blob = new Blob([blobData], { type: 'image/png' });
      const url = window.URL.createObjectURL(blob);
      // window.open(url);
      const link = document.createElement('a');
      link.href = url;
      link.download = "Landing QR Code";
      link.click();
    }
  }
}
