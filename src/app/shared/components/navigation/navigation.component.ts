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
  isCurrentUserASupplier: boolean = false;
  activeTabIndex: number = 0;

  tabName = {
    CLUB: 'El Club',
    ME: 'Yo',
    FLORISTS: 'Mi floristeria',
    PROVIDERS: 'Proveedor',
  };

  tabByName = {
    'El Club': 'CLUB',
    Yo: 'ME',
    'Mi floristeria': 'FLORISTS',
    Proveedor: 'PROVIDERS',
  };

  tabs: Array<{
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
  }> = [
    {
      headerText: 'Proveedor de ✨',
      text: this.tabName['ME'],
      active: true,
      links: [
        {
          text: 'Registrar nuevos afiliados 📒',
          routerLink: ['/admin/merchants-entry'],
          linkName: 'affiliate-entry',
        },
      ],
    },
    {
      headerText:
        'Es un ecosistema digital en constante desarrollo, diseñado para proporcionar soluciones a los desafíos que enfrentan las floristerías y sus proveedores.',
      text: this.tabName['CLUB'],
      active: false,
      links: [],
      textList: [
        {
          title: 'Gestión de las Ordenes',
          content:
            'Mantén el control de las ordenes desde tu celular. Mira las ordenes según su estado y notificale a tus clientes por WhatsApp o correo electrónico.',
        },
        {
          title: 'Cotización Eficiente con Proveedores',
          content:
            'Accede a una amplia red de proveedores de flores y obtén cotizaciones para tus compras. Compara y elige la oferta más conveniente para ti, maximizando tus ganancias.',
        },
        {
          title: 'Gestión Simplificada de Compras',
          content:
            'Convierte las cotizaciones de los proveedores en compras con un solo clic, manteniendo un seguimiento detallado para optimizar tus beneficios.',
        },
        {
          title: 'Inteligencia Artificial',
          content:
            'una bot entrenada a tu floristería para ahorrarte tiempo a ti o a tu personal de servicio y ser consistentes en el mensaje que reciben tus clientes.',
        },
        {
          title: 'Ventas con #hashtag',
          content:
            'asigna un #hashtag a tus artículos para que desde el Bio de tu Instagram tus compradores aterricen directo a comprar.',
        },
        {
          title: 'Ventas por WhatsApp',
          content:
            'Sube tus productos fácilmente y vende directamente a través de WhatsApp. Conecta con tus clientes donde ya se encuentran.',
        },
        {
          title: 'Experiencia Mejorada para tus Clientes',
          content:
            'Permite a tus clientes añadir videos a sus mensajes dedicatorios, añadiendo un toque personal único a sus regalos.',
        },
        {
          title: 'Tarifas de Entrega Personalizadas',
          content:
            'Ajusta tus tarifas de entrega en función de la zona de entrega, maximizando tus ingresos.',
        },
        {
          title: 'Marketing Segmentado',
          content:
            'Cuenta con una base de datos segmentada de tus compradores, facilitándote la planificación de tus futuras campañas de marketing.',
        },
        {
          title: 'Compra Fácil para los Clientes',
          content:
            'Tus clientes pueden comprar tus productos sin necesidad de descargar ninguna aplicación, facilitándoles la experiencia de compra.',
        },
        {
          title: 'Recompensas para tus Clientes',
          content:
            'Ofrece incentivos a tus clientes para fomentar la fidelidad y satisfacción.',
        },
        {
          title: 'Venden por Ti',
          content:
            'Paga comisiones a influencers e instituciones que están recaudando fondos dependiendo de las ventas enlazadas.',
        },
        {
          title: 'Comunicación Efectiva',
          content:
            'Informa a tus clientes sobre el estado de su pedido a través de WhatsApp, proporcionando un servicio transparente y eficiente.',
        },
        {
          title: 'Giftcards de terceros',
          content:
            'Para que seas tu quien colabores y comisiones con spas, salones y restaurantes.',
        },
      ],
    },
    {
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
        } /*
        {
          text: 'Carritos de compradores',
          routerLink: ['/ecommerce/supplier-items-selector'],
          queryParams: {
            createOrder: true,
          },
        }*/ /*
        {
          text: 'Recompensa a compradores ✨',
          routerLink: ['/admin/tba'],
        },
        {
          text: 'Comisiones a embajadores 📢',
          routerLink: ['/admin/tba'],
        },
        {
          text: 'Oferta de hoy de proveedores locales 🚨',
          routerLink: ['/admin/tba'],
        },
        {
          text: 'Carritos de proveedores',
          routerLink: ['/admin/tba'],
        },
        {
          text: 'Carritos de compradores',
          routerLink: ['/admin/tba'],
        },
        {
          text: 'Boletín del Genio 🧞‍♂️',
          routerLink: ['/admin/tba'],
        },
        /*
        {
          text: 'Mi KiosKo 💰',
          routerLink: ['/admin/dashboard'],
        },
        {
          text: 'Lo vendido 🧾',
          routerLink: ['/admin/reports/orders'],
        },
        {
          text: 'Progreso de facturas ⏩',
          routerLink: ['/admin/order-slides'],
        },
        {
          text: 'Vista de compradores 👀',
          routerLink: [
            '/ecommerce',
            this.merchantsService.merchantData?.slug ||
              this.headerService.saleflow?.merchant.slug,
            'store',
          ],
        },
        {
          text: 'Mis suplidores (compras y cotizaciones)',
          routerLink: ['/ecommerce/supplier-items-selector'],
          possibleRedirection: ['/ecommerce/quotations'],
        },*/,
      ],
      textList: [
        {
          title: 'Vende Fácil',
          content: 'Desde tu celular, online y por WhatsApp',
        },
        {
          title: 'Vende Más',
          content: 'Paga comisión a los embajadores que vendieron por ti',
        },
        {
          title: 'Sigue Vendiendo',
          content: 'Recompensa a tus compradores',
        },
      ],
      footer: {
        button: {
          text: 'Administración de mi KiosKo',
          callback: () => {
            this.router.navigate(['/admin/dashboard']);
          },
        },
      },
    },
    {
      headerText:
        'Alcanza a mas floristerías. Simplifica las cotizaciones y el proceso de ventas.',
      text: this.tabName['PROVIDERS'],
      active: false,
      links: [
        {
          text: 'Mi KiosKo 💰',
          routerLink: ['/admin/supplier-dashboard'],
          queryParams: {
            supplierMode: true,
          },
          hardcodedURL: '/admin/supplier-dashboard?supplierMode=true',
          linkName: 'my-dashboard',
        },
        {
          text: 'Carrito del Proveedor (yo vendo)',
          routerLink: ['/ecommerce/supplier-items-selector'],
          queryParams: {
            supplierMode: true,
          },
          hardcodedURL: '/ecommerce/supplier-items-selector?supplierMode=true',
          linkName: 'quotations-link',
        } 
      ],
      textList: [
        {
          title: 'Alcanza a mas floristerías',
          content: 'Desde tu celular, online y por WhatsApp',
        },
        {
          title: 'Simplifica las cotizaciones',
          content: 'Paga comisión a los embajadores que vendieron por ti',
        },
        {
          title: 'Proceso de ventas',
          content: 'Recompensa a tus compradores',
        },
      ],
      footer: {
        button: {
          text: 'Administración de mis artículos',
          callback: () => {
            this.router.navigate(['/admin/supplier-dashboard'], {
              queryParams: {
                supplierMode: true,
              },
            });
          },
        },
      },
    },
  ];

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
    private matSnackBar: MatSnackBar
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
  }

  async executeInitProcesses() {
    const isUserAMerchant =
      await this.headerService.checkIfUserIsAMerchantAndFetchItsData();

    if (!this.headerService.user || !isUserAMerchant) {
      /*
      this.tabs[2].links.splice(3, 1);
      */
    }

    if (!this.headerService.user) {
      //tab floristeria no registrada
      this.tabs[2].footer = {
        button: {
          text: 'Sube tu primer arreglo para vender',
          callback: () => {
            this.startArticleCreationForUnregisteredMerchant();
          },
        },
        swiper: {
          title: 'LO QUE MAS LE GUSTA A LOS MIEMBROS',
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
      };
    }

    if (this.headerService.user) {
      this.loggedUser = true;
    }

    if (this.headerService.user && isUserAMerchant) {
      /*
      this.tabs[2].links[3].routerLink = [
        '/ecommerce',
        this.merchantsService.merchantData?.slug ||
          this.headerService.saleflow?.merchant.slug,
        'store',
      ];*/

      const listItemsPagination: PaginationInput = {
        findBy: {
          merchant: this.merchantsService.merchantData._id,
          type: 'supplier',
        },
        options: {
          sortBy: 'createdAt:desc',
          limit: -1,
          page: 1,
        },
      };

      const items: Array<Item> = (
        await this.itemsService.listItems(listItemsPagination)
      )?.listItems;

      if (items.length) {
        //If the current user is a supplier, it redirects them to the screen where they may adjust the quotation items prices and stock
        this.isCurrentUserASupplier = true;
      }
    }

    //console.log('this.isCurrentUserASupplier', this.isCurrentUserASupplier);

    if (!this.isCurrentUserASupplier) {
      //tab proveedor no registrado
      this.tabs[3].footer = {
        button: {
          text: 'Sube los artículos que te comprarán las floristerias',
          callback: () => {
            return this.router.navigate(
              ['/ecommerce/supplier-items-selector'],
              {
                queryParams: {
                  supplierMode: true,
                },
              }
            );
          },
        },
        swiper: {
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
      };
    }

    if (this.headerService.navigationTabState)
      this.tabs = this.headerService.navigationTabState;

    let activeTabIndex = 0;

    let urlAlreadyFound: Record<string, boolean> = {};

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
        this.tabs[activeTabIndex].active = true;
        this.activeTabIndex = activeTabIndex;
      } else this.tabs[tabIndex].active = false;
    });

    if (this.merchantsService.merchantData) {
      this.quotations = await this.quotationsService.quotations({
        findBy: {
          merchant: this.merchantsService.merchantData._id,
        },
        options: { limit: -1 },
      });

      if (this.quotations.length > 0) {
        this.tabs[2].links[this.tabs[2].links.length - 1].routerLink = [
          '/ecommerce/quotations',
        ];
      }
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
    this.tabs[tabIndex].active = true;

    this.tabs.forEach((tab, index) => {
      if (index !== tabIndex) tab.active = false;
    });

    this.headerService.navigationTabState = this.tabs;
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
