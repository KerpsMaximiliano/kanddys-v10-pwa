import {
  Component,
  OnInit,
  ViewChild,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSidenav } from '@angular/material/sidenav';
import { Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { Item } from 'src/app/core/models/item';
import { Quotation } from 'src/app/core/models/quotations';
import { PaginationInput } from 'src/app/core/models/saleflow';
import { AuthService } from 'src/app/core/services/auth.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { ItemsService } from 'src/app/core/services/items.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { QuotationsService } from 'src/app/core/services/quotations.service';
import {
  LoginDialogComponent,
  LoginDialogData,
} from 'src/app/modules/auth/pages/login-dialog/login-dialog.component';
import { SwiperOptions } from 'swiper';
import { FormComponent, FormData } from '../../dialogs/form/form.component';
import { FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { environment } from 'src/environments/environment';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { ClubDialogComponent } from 'src/app/shared/dialogs/club-dialog/club-dialog.component';
import { OptionsMenuComponent } from 'src/app/shared/dialogs/options-menu/options-menu.component';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import {
  OptionsDialogComponent,
  OptionsDialogTemplate,
} from 'src/app/shared/dialogs/options-dialog/options-dialog.component';
import { GeneralFormSubmissionDialogComponent } from 'src/app/shared/dialogs/general-form-submission-dialog/general-form-submission-dialog.component';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
interface NavigationTab {
  headerText: string;
  text: string;
  active?: boolean;
  links?: Array<{
    text: string;
    routerLink: Array<string>;
    possibleRedirection?: Array<string>;
    queryParams?: Record<string, any>;
    possibleRedirectionQueryParams?: Record<string, any>;
    hardcodedURL?: string;
    linkName: string;
  }>;
  textList?: Array<{
    title?: string;
    content: string;
  }>;
  footer?: {
    button: {
      text: string;
      callback: any;
    };
    swiper?: {
      title: string;
      slides: Array<{
        content: string;
      }>;
    };
  };
}

interface underTab {
  text: string;
  subTabs?: Array<{
    text: string;
    active: boolean;
    content?: string[];
  }>
  active?: boolean;
}

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss'],
})
export class NavigationComponent implements OnInit {
  @Input() opened: boolean;
  @Output() closed = new EventEmitter();
  quotations: Array<Quotation> = [];
  loggedUser: boolean = false;
  isCurrentUserASeller: boolean = false;
  isCurrentUserASupplier: boolean = false;
  isCurrentUserAnAdmin: boolean = false;
  activeTabIndex: number = 0;
  assetsFolder: string = environment.assetsUrl;

  tabName = {
    CLUB: 'El Club',
    ME: 'Yo',
    FLORISTS: 'Floristeria',
    PROVIDERS: 'Proveedor',
    ADMIN: 'Super Admin',
  };

  tabByName = {
    'El Club': 'CLUB',
    Yo: 'ME',
    Floristeria: 'FLORISTS',
    Proveedor: 'PROVIDERS',
    'Super Admin': 'ADMIN',
  };

  adminTab: NavigationTab = {
    headerText:
      'Resuelve problemas a las floristerías para darle valor a la plataforma de ventas.',
    text: this.tabName['ADMIN'],
    active: false,
    links: [
      {
        text: 'Gestión de los Artículos Globales',
        routerLink: ['/admin/provider-items-management'],
        linkName: 'provider-items-management',
      },
    ],
  };

  providerTab: NavigationTab = {
    headerText:
      'Alcanza a mas floristerías. Simplifica las cotizaciones y el proceso de ventas.',
    text: this.tabName['PROVIDERS'],
    active: false,
    links: [
      {
        text: 'Mi KiosKo',
        routerLink: ['/admin/supplier-dashboard'],
        queryParams: {
          supplierMode: true,
        },
        hardcodedURL: '/admin/supplier-dashboard?supplierMode=true',
        linkName: 'my-dashboard',
      },
      {
        text: 'Artículos & Ventas 💰',
        routerLink: ['/ecommerce/provider-items'],
        linkName: 'provider-pov-link',
      },
      {
        text: 'El club',
        routerLink: ['/ecommerce/club-landing'],
        linkName: 'club-link',
      },
    ],
  };

  sellerTab: NavigationTab = {
    headerText:
      'Vendes. Venden por ti. Recompensa a compradores. Cotiza y compra al proveedor conveniente',
    text: this.tabName['FLORISTS'],
    active: false,
    links: [
      {
        text: 'Mi KiosKo 💰',
        routerLink: ['/admin/dashboard'],
        linkName: 'my-dashboard',
      },
      {
        text: 'Carrito del Proveedor (yo compro)',
        routerLink: ['/ecommerce/supplier-items-selector'],
        possibleRedirection: ['/ecommerce/quotations'],
        linkName: 'quotations-link',
      },
      {
        text: 'El club',
        routerLink: ['/ecommerce/club-landing'],
        linkName: 'club-link',
      },
    ],
  };

  tabs: Array<NavigationTab> = [];

  tabContents : any = {
    tab1: [
      {
        text: "💰 Adicionar mi primer artículo para venderlo online y por WhatsApp",
        routerLink: [""],
        linkName: ""
      },
      {
        text: "🛟 Cotizar fácilmente con los Proveedores",
        routerLink: [""],
        linkName: ""
      },
      {
        text: "🧞 Saber de las “Ofertas Flash” de los Proveedores",
        routerLink: [""],
        linkName: ""
      },
      {
        text: "📢 Más alcance pagándoles comisiones a quienes venden por mi",
        routerLink: [""],
        linkName: ""
      },
      {
        text: "🎁 Más alcance premiando a quienes me mencionan en sus cuentas sociales ",
        routerLink: [""],
        linkName: ""
      },
      {
        text: "✨ Recompensar a mis clientes según lo que facturaron",
        routerLink: [""],
        linkName: ""
      },
      {
        text: "✋ Saber la opinión de mis clientes después que recibieron lo que compraron ",
        routerLink: [""],
        linkName: ""
      },
      {
        text: "Preparar un 🛒 con algunas cosas que vendo para cotizar o facturar (NCF es opcional)",
        routerLink: [""],
        linkName: ""
      },
      {
        text: "Ir al enlace de Youtube donde hay muchos videos de como preparar arreglos florales",
        routerLink: [""],
        linkName: ""
      },
      {
        text: "Volver a ver la opiniones de los Miembros del Club",
        routerLink: [""],
        linkName: ""
      }
    ],
    tab2: [
      {
        text: "💰 Empezar a cotizar online y vender automáticamante",
        routerLink: [""],
        linkName: ""
      },
      {
        text: "🧞 Adicionar artículos que vendo en el boletín con de “Ofertas Flash” que reciben los miembros",
        routerLink: [""],
        linkName: ""
      },
      {
        text: "📢 Más alcance pagándoles comisiones a quienes venden por mi",
        routerLink: [""],
        linkName: ""
      },
      {
        text: "🎁 Más alcance premiando a quienes me mencionan en sus cuentas sociales ",
        routerLink: [""],
        linkName: ""
      },
      {
        text: "✨ Recompensar a mis clientes según lo que facturaron",
        routerLink: [""],
        linkName: ""
      },
      {
        text: "✋ Saber la opinión de mis clientes después que recibieron lo que compraron ",
        routerLink: [""],
        linkName: ""
      },
      {
        text: "Preparar un 🛒 con algunas cosas que vendo para cotizar o facturar (NCF es opcional)",
        routerLink: [""],
        linkName: ""
      },
      {
        text: "Déjanos saber lo que mas te gusta de las herramientas o lo que necesitas",
        routerLink: [""],
        linkName: ""
      },
    ],
    tab3: [
      {
        text: " 💰 Gestionar lo que vendo, ver mis beneficios, compartir mi tienda",
        routerLink: [""],
        linkName: ""
      },
      {
        text: "📦 Organización de lo vendido,  notificar a mis clientes del status de lo que facturaron ",
        routerLink: [""],
        linkName: ""
      },
      {
        text: "🛟 Cotizaciones que comparan los precios de los Proveedores antes de comprarles ",
        routerLink: [""],
        linkName: ""
      },
      {
        text: " 📢 Gestionar las comisiones de quienes venden por mi",
        routerLink: [""],
        linkName: ""
      },
      {
        text: "✨ Gestionar los premios y las recompensas de mis clientes",
        routerLink: [""],
        linkName: ""
      },
      {
        text: "📢 Gestionar los premios de quienes me mencionan en sus cuentas sociales",
        routerLink: [""],
        linkName: ""
      },
      {
        text: "✋ Ver las opiniones de mis compradores ",
        routerLink: [""],
        linkName: ""
      },
      {
        text: "Gestionar los  🛒 cpara mandar cotizaciones o facturas a mis clientes (NCF es opcional)",
        routerLink: [""],
        linkName: ""
      },
      {
        text: "Ir al enlace de Youtube donde hay muchos videos de como preparar arreglos florales",
        routerLink: [""],
        linkName: ""
      },
      {
        text: "Déjanos saber lo que mas te gusta de las herramientas o lo que necesitas",
        routerLink: [""],
        linkName: ""
      }
    ],
    tab4: [
      {
        text: " 💰 Gestionar y compartir lo que vendo, ver mis beneficios",
        routerLink: [""],
        linkName: ""
      },
      {
        text: "📦 Organización de lo vendido,  notificar a mis clientes del status de lo que facturaron ",
        routerLink: [""],
        linkName: ""
      },
      {
        text: "🧞 Adicionar artículos que vendo en el boletín con de “Ofertas Flash” que reciben los miembros",
        routerLink: [""],
        linkName: ""
      },
      {
        text: " 📢 Gestionar las comisiones de quienes venden por mi",
        routerLink: [""],
        linkName: ""
      },
      {
        text: "✨ Gestionar los premios y las recompensas de mis clientes",
        routerLink: [""],
        linkName: ""
      },
      {
        text: "📢 Gestionar los premios de quienes me mencionan en sus cuentas sociales",
        routerLink: [""],
        linkName: ""
      },
      {
        text: "✋ Ver las opiniones de mis compradores ",
        routerLink: [""],
        linkName: ""
      },
      {
        text: "Gestionar los  🛒 con cotizaciones que he hecho, crear facturas y mandar cotizaciones",
        routerLink: [""],
        linkName: ""
      },
      {
        text: "Déjanos saber lo que mas te gusta de las herramientas o lo que necesitas",
        routerLink: [""],
        linkName: ""
      }
    ]
  }

  underTabs: Array<underTab> = [
    {
      text: "Control",
      subTabs: [
        {
          text: "Ordenes",
          active: true,
          content: [
            "“.. puedo ver el estado actualizado de cada orden desde mi celular”",
            "“.. la función de notificar a los clientes por WhatsApp o correo electrónico es una verdadera maravilla!”",
            "“¡Es como magia para mantener todo bajo control!”",
            "“.. me permite estar al tanto de cada orden de una manera que nunca imaginé”",
            "“.. puedo filtrar las facturas según su estado para priorizar lo que necesito atender primero”",
            "“.. es como tener a tu asistente personal siempre contigo”",
            "“.. puedo ver qué órdenes necesitan mi atención inmediata y cuáles están en camino”"
          ]
        },
        {
          text: "Entregas",
          active: false,
          content: [
            "“.. puedo cobrar extra según la zona de entrega especificada por el comprador”",
            "“..  maximizo lo que cobro y me permite entregar mas lejos”",
            "“..  me muestra un enfoque estratégico de las entregas y eso me ayuda en la logística para entregar a tiempo”"
          ]
        },
        {
          text: "Clientes",
          active: false,
          content: [
            "“.. los reportes que puedo exportar me ayudan a planificar y ejecutar campañas”",
            "“..  puedo dirigir mis mensajes a grupos específicos con información precisa basado en sus preferencias”",
            "“..  tener una visión clara de quiénes son mis compradores y qué quieren”"
          ]
        }
      ],
      active: false
    },
    {
      text: "Más Ventas",
      subTabs: [
        {
          text: "#hashtags",
          active: false,
          content: [
            "“.. asigno un simple #hashtag y, voilà, los interesados pueden dirigirse directamente a la compra desde cualquier red social”",
            "“.. es una manera genial de simplificar el proceso de compra desde las plataformas sociales”",
            "“.. convierto a los seguidores en compradores de manera rápida y sencilla”"
          ]
        },
        {
          text: "Proveedores",
          active: true,
          content: [
            "“.. puedo acceder a una red amplia de proveedores de flores en un abrir y cerrar de ojos.”",
            "¡Esta función de Cotización Eficiente con Proveedores en la aplicación es como tener un equipo de compras personal a tu disposición!",
            "“.. es como si los proveedores compitieran por ofrecerme las mejores ofertas, lo cual me siento confiado de donde comprar”",
            "“.. me permite conectarme con un montón de proveedores y pedir cotizaciones en cuestión de minutos”",
            "“.. significa que puedo tomar decisiones más inteligentes y aumentar mis ganancias”",
            "“.. puedo pedir cotizaciones y luego simplemente comparar y elegir la opción más conveniente”",
            "“.. no solo ahorro dinero, sino que también ahorro tiempo al evitar largas negociaciones, realmente es un ganar-ganar”"
          ]
        },
        {
          text: "Premios",
          active: false,
          content: [
            "“.. brindo incentivos a mis clientes, lo que realmente fomenta la fidelidad y la satisfacción”",
            "“.. el programa de recompensar su lealtad es simplemente brillante”",
            "“..  los premios no solo los mantiene contentos, sino que también crea un vínculo más sólido con nosotros”"
          ]
        }
      ],
      active: true
    }
  ];

  routerLinks = [
    {
      routerLink: ['/admin/dashboard'],
      linkName: 'my-dashboard',
    },
    {
      routerLink: ['/ecommerce/quotations'],
      linkName: 'quotations-link',
    },
    {
      routerLink: ['/ecommerce/club-landing'],
      linkName: 'club-link',
    },
  ]

  tabIndex = 0;
  userID = ""
  isVendor = false;
  isProvider = false;

  footerSwiperConfig: SwiperOptions = {
    slidesPerView: 1,
    freeMode: false,
    spaceBetween: 0,
    pagination: {
      el: '.swiper-pagination',
      type: 'bullets',
      clickable: true,
    },
  };


  constructor(
    private authService: AuthService,
    public merchantsService: MerchantsService,
    public headerService: HeaderService,
    private appService: AppService,
    private quotationsService: QuotationsService,
    private itemsService: ItemsService,
    private router: Router,
    private matDialog: MatDialog,
    private translate: TranslateService,
    private matSnackBar: MatSnackBar,
    private bottomSheet: MatBottomSheet,
    private dialogService: DialogService,
    ) {
    translate.setDefaultLang('en');
    translate.use('en');
  }

  async ngOnInit() {
    if (localStorage.getItem('session-token')) {
      if (!this.headerService.user) {
        let sub = this.appService.events
          .pipe(filter((e) => e.type === 'auth'))
          .subscribe((e) => {
            this.executeInitProcesses();

            sub.unsubscribe();
          });
      } else this.executeInitProcesses();
    } else this.executeInitProcesses();
    const me = await this.authService.me()
    this.userID = me?.name || me?.email || me?.phone;
    if (this.userID) {
      const merchant = await this.merchantsService.merchantDefault();
      // console.log(merchant)
      if (merchant?._id) {
        const supplier_pagination: PaginationInput = {
          findBy: {
            type: "supplier",
            merchant: merchant._id
          },
          options: {
            sortBy: 'createdAt:desc',
            limit: 1
          },
        };
        let supplier: Array<any> = [];
        supplier =(await this.itemsService.listItems(supplier_pagination))?.listItems;
    
        const vendor_pagination: PaginationInput = {
          findBy: {
            type: ["default", null],
            merchant: merchant._id
          },
          options: {
            sortBy: 'createdAt:desc',
            limit: 1
          },
        };
        let vendor: Array<any> = [];
        vendor =(await this.itemsService.listItems(vendor_pagination))?.listItems;
    
        if (supplier.length) {
          this.isProvider = true
          this.tabIndex = 1
        }
        if (vendor.length) {
          this.isVendor = true
          this.tabIndex = 0
        }
        // console.log(supplier)
        // console.log(vendor)
      }
    }
  }

  calcLink (link, options) {
    return {...link, ...options}
  }

  openDialog() {
    this.bottomSheet.open(ClubDialogComponent, {
      data: {
        title: "SELECCION DE HERRAMIENTAS",
        styles: {
          fullScreen: true,
        },
        tabIndex: this.tabIndex
      },
    });
  }

  filterData () {
    if (this.isVendor == this.isProvider){
      if (this.tabIndex) return this.tabContents.tab2;
      else return this.tabContents.tab1
    }
    else if (this.isVendor && !this.isProvider) {
      return this.tabContents.tab3
    }
    else return this.tabContents.tab4
  }

  enterClub() {
    this.bottomSheet.open(OptionsMenuComponent, {
      data: {
        options: [
          {
            value: `Soy miembro`,
            callback: async () => {
              await this.openMagicLinkDialog();
            },
          },
          {
            value: `Quiero entrar como invitado`,
            callback: () => {
              // this.openNavigation = true;
            },
          },
        ],
        styles: {
          fullScreen: true,
        },
      },
    });
  }

  async openMagicLinkDialog() {
    let fieldsToCreateInEmailDialog: FormData = {
      title: {
        text: 'Acceso al Club:',
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

    const emailDialogRef = this.matDialog.open(FormComponent, {
      data: fieldsToCreateInEmailDialog,
      disableClose: true,
    });

    emailDialogRef.afterClosed().subscribe(async (result: FormGroup) => {
      if (result?.controls?.magicLinkEmailOrPhone.valid) {
        const emailOrPhone = result?.value['magicLinkEmailOrPhone'];

        let optionsDialogTemplate: OptionsDialogTemplate = {
          options: [
            {
              value: 'Accederé con la clave',
              callback: async () => {
                await addPassword(emailOrPhone);
              },
            },
            {
              value: 'Prefiero recibir el enlace de acceso en mi correo',
              callback: async () => {
                if (result?.controls?.magicLinkEmailOrPhone.valid) {
                  const validEmail = new RegExp(
                    /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/gim
                  );

                  let emailOrPhone = null;

                  if (
                    typeof result?.value['magicLinkEmailOrPhone'] ===
                      'string' &&
                    validEmail.test(result?.value['magicLinkEmailOrPhone'])
                  ) {
                    emailOrPhone = result?.value['magicLinkEmailOrPhone'];
                  } else {
                    emailOrPhone =
                      result?.value['magicLinkEmailOrPhone'].e164Number.split(
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
                  result?.controls?.magicLinkEmailOrPhone.valid === false
                ) {
                  unlockUI();
                  this.matSnackBar.open('Datos invalidos', 'Cerrar', {
                    duration: 3000,
                  });
                }
              },
            },
          ],
        };

        this.matDialog.open(OptionsDialogComponent, {
          data: optionsDialogTemplate,
          disableClose: true,
        });
      } else if (result?.controls?.magicLinkEmailOrPhone.valid === false) {
        unlockUI();
        this.matSnackBar.open('Datos invalidos', 'Cerrar', {
          duration: 3000,
        });
      }
    });

    const addPassword = async (emailOrPhone: string) => {
      emailDialogRef.close();

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

      const dialog2Ref = this.matDialog.open(FormComponent, {
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

            // if (session) this.openNavigation = true;

            unlockUI();
          } else if (result?.controls?.password.valid === false) {
            unlockUI();
            this.matSnackBar.open('Datos invalidos', 'Cerrar', {
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
  }

  changeSubtab(tabIndex: number, subTabIndex: number) {
    this.underTabs[tabIndex].subTabs[subTabIndex].active = true;

    this.underTabs[tabIndex].subTabs.forEach((subTab, index) => {
      if (index !== subTabIndex) subTab.active = false;
    });
  }

  async executeInitProcesses() {
    const isUserAMerchant =
      await this.headerService.checkIfUserIsAMerchantAndFetchItsData();

    if (this.headerService.user) this.loggedUser = true;

    this.tabs.push(this.providerTab);
    this.tabs.push(this.sellerTab);

    if (this.headerService.user && isUserAMerchant)
      await this.checkIfUserIsAProviderOrASeller();

    //console.log('this.isCurrentUserASupplier', this.isCurrentUserASupplier);

    if (this.headerService.navigationTabState)
      this.tabs = this.headerService.navigationTabState;

    let activeTabIndex = 0;

    let urlAlreadyFound: Record<string, boolean> = {};

    if (this.isCurrentUserASeller) {
      this.quotationsService
        .quotations({
          findBy: {
            merchant: this.merchantsService.merchantData._id,
          },
          options: { limit: -1 },
        })
        .then((quotations) => {
          this.tabs = [];

          if (quotations.length > 0) {
            this.sellerTab.links[1].routerLink = ['/ecommerce/quotations'];
          }

          this.tabs.push(this.providerTab);
          this.tabs.push(this.sellerTab);

          if (
            this.isCurrentUserAnAdmin &&
            !this.tabs.find((tab) => tab.text === this.tabName['ADMIN'])
          ) {
            this.tabs.unshift(this.adminTab);
          }
        });
    }

    this.tabs.forEach((tab, tabIndex) => {
      const isCurrentURLInCurrentTab = tab.links.find((link, linkIndex) => {
        const doesCurrentURLHaveQueryParams = this.router.url.includes('?');

        const doesRouterLinkMatchCurrentURL =
          doesCurrentURLHaveQueryParams && link.queryParams && link.hardcodedURL
            ? link.hardcodedURL === this.router.url
            : !link.queryParams &&
              JSON.stringify(link.routerLink.join('/')) ===
                JSON.stringify(this.router.url);

        const doesPossibleRedirectionRouterLinkMatchURL =
          doesCurrentURLHaveQueryParams &&
          link.possibleRedirectionQueryParams &&
          link.hardcodedURL
            ? link.hardcodedURL === this.router.url
            : !link.possibleRedirectionQueryParams &&
              link.possibleRedirection &&
              JSON.stringify(link.possibleRedirection.join('/')) ===
                JSON.stringify(this.router.url);

        if (doesPossibleRedirectionRouterLinkMatchURL) {
          this.tabs[tabIndex].links[linkIndex].routerLink =
            link.possibleRedirection;

          if (link.possibleRedirectionQueryParams && link.hardcodedURL) {
            this.tabs[tabIndex].links[linkIndex].queryParams =
              link.possibleRedirectionQueryParams;
          }
        }

        if (!urlAlreadyFound[this.router.url]) {
          return (
            doesRouterLinkMatchCurrentURL ||
            doesPossibleRedirectionRouterLinkMatchURL
          );
        }
      });

      if (isCurrentURLInCurrentTab) activeTabIndex = tabIndex;
    });

    this.tabs.forEach((tab, tabIndex) => {
      if (tabIndex === activeTabIndex) {
        this.tabs[tabIndex].active = true;
        this.activeTabIndex = tabIndex;

        if (this.tabByName[this.tabs[tabIndex].text] === 'FLORISTS') {
          this.sellerTab.active = true;
        } else if (this.tabByName[this.tabs[tabIndex].text] === 'PROVIDERS') {
          this.providerTab.active = true;
        } else if (this.tabByName[this.tabs[tabIndex].text] === 'ADMIN') {
          this.adminTab.active = true;
        }
      } else {
        this.tabs[tabIndex].active = false;

        if (this.tabByName[this.tabs[tabIndex].text] === 'FLORISTS') {
          this.sellerTab.active = false;
        } else if (this.tabByName[this.tabs[tabIndex].text] === 'PROVIDERS') {
          this.providerTab.active = false;
        } else if (this.tabByName[this.tabs[tabIndex].text] === 'ADMIN') {
          this.adminTab.active = false;
        }
      }
    });


    if (
      this.isCurrentUserAnAdmin &&
      !this.tabs.find((tab) => tab.text === this.tabName['ADMIN'])
    ) {
      this.tabs.unshift(this.adminTab);
    }
  }

  async checkIfUserIsAProviderOrASeller() {
    const isTheUserAnAdmin = this.headerService.user?.roles?.find(
      (role) => role.code === 'ADMIN'
    );
    if (isTheUserAnAdmin) {
      this.isCurrentUserAnAdmin = true;
    }

    const normalItemsPagination: PaginationInput = {
      findBy: {
        merchant: this.merchantsService.merchantData._id,
        type: {
          $ne: 'supplier',
        },
      },
      options: {
        sortBy: 'createdAt:desc',
        limit: 1,
        page: 1,
      },
    };

    const supplierItemsPagination: PaginationInput = {
      findBy: {
        merchant: this.merchantsService.merchantData._id,
        type: 'supplier',
      },
      options: {
        sortBy: 'createdAt:desc',
        limit: 1,
        page: 1,
      },
    };

    const [normalItemsPromiseResult, supplierItemsPromiseResult] =
      await Promise.all([
        this.itemsService.listItems(normalItemsPagination),
        this.itemsService.listItems(supplierItemsPagination),
      ]);

    const normalItems: Array<Item> = normalItemsPromiseResult?.listItems;
    const supplierItems: Array<Item> = supplierItemsPromiseResult?.listItems;

    if (supplierItems.length) {
      this.isCurrentUserASupplier = true;
    }

    //If the current user is a supplier, it redirects them to the screen where they may adjust the quotation items prices and stock
    if (normalItems.length) {
      this.isCurrentUserASeller = true;
    }
  }

  startArticleCreationForUnregisteredMerchant() {
    let fieldsToCreate: FormData = {
      fields: [
        {
          label: '¿Cuál es el precio de venta?',
          name: 'price',
          type: 'currency',
          validators: [
            Validators.pattern(/[\S]/),
            Validators.required,
            Validators.min(0.1),
          ],
        },
      ],
      automaticallyFocusFirstField: true,
    };

    const dialogRef = this.matDialog.open(FormComponent, {
      data: fieldsToCreate,
    });

    dialogRef.afterClosed().subscribe((result: FormGroup) => {
      const fields = [
        {
          fieldName: 'pricing',
          fieldKey: 'price',
        },
      ];

      this.itemsService.temporalItemInput = this.itemsService.temporalItemInput
        ? this.itemsService.temporalItemInput
        : {};

      fields.forEach((field) => {
        try {
          if (
            result?.value[field.fieldKey] &&
            result?.controls[field.fieldKey].valid
          ) {
            this.itemsService.createUserAlongWithItem = true;
            this.itemsService.temporalItemInput[field.fieldName] =
              result?.value[field.fieldKey];

            this.headerService.flowRouteForEachPage['florist-creating-item'] =
              this.router.url;
            this.router.navigate(['/ecommerce/item-management']);
          } else if (result?.value[field.fieldKey] !== undefined) {
            this.headerService.showErrorToast();
          }
        } catch (error) {
          console.error(error);
          this.headerService.showErrorToast();
        }
      });
    });
  }

  signout() {
    this.authService.signouttwo();
  }

  changeTab(tabIndex: number) {
    this.underTabs[tabIndex].active = true;
    this.activeTabIndex = tabIndex;

    this.underTabs.forEach((tab, index) => {
      if (index !== tabIndex) tab.active = false;
    });

    this.headerService.navigationTabState = this.underTabs;
  }

  login() {
    const matDialogRef = this.matDialog.open(LoginDialogComponent, {
      data: {
        magicLinkData: {
          redirectionRoute: this.router.url,
          entity: 'UserAccess',
        },
      } as LoginDialogData,
    });
    matDialogRef.afterClosed().subscribe(async (value) => {
      if (!value) return;
      if (value.user?._id || value.session.user._id) {
        this.close();
      }
    });
  }

  redirectToLink(link: any) {
    this.headerService.flowRouteForEachPage[link.linkName] = this.router.url;

    //console.log("ARMANDO");

    this.headerService.flowRoute = this.headerService.buildURL(
      link.routerLink.join('/'),
      link.queryParams ? link.queryParams : null
    );

    this.router.navigate(link.routerLink, {
      queryParams: link.queryParams ? link.queryParams : {},
    });

    this.close();
  }

  @ViewChild('sidenav') sidenav: MatSidenav;

  close() {
    this.sidenav.close();
  }
}
