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
        text: 'Recompensa a compradores ✨',
        routerLink: ['/admin/stars-landing'],
        linkName: 'stars-landing',
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
            this.sellerTab.links[2].routerLink = ['/ecommerce/quotations'];
          }

          this.tabs.push(this.providerTab);
          this.tabs.push(this.sellerTab);

          if(this.isCurrentUserAnAdmin) {
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

    if(this.isCurrentUserAnAdmin) {
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
    this.tabs[tabIndex].active = true;
    this.activeTabIndex = tabIndex;

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
