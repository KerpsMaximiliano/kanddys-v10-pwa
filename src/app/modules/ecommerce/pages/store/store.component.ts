import { Component, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { SwiperComponent } from 'ngx-swiper-wrapper';
import { AppService } from 'src/app/app.service';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { Item } from 'src/app/core/models/item';
import { Merchant } from 'src/app/core/models/merchant';
import { ItemSubOrderInput } from 'src/app/core/models/order';
import { PaginationInput } from 'src/app/core/models/saleflow';
import { Tag } from 'src/app/core/models/tags';
import { HeaderService } from 'src/app/core/services/header.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { TagsService } from 'src/app/core/services/tags.service';
import { environment } from 'src/environments/environment';
import { SwiperOptions } from 'swiper';
import SwiperCore, { Virtual } from 'swiper/core';
import { IntegrationsService } from 'src/app/core/services/integrations.service';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { StoreShareComponent, StoreShareList } from 'src/app/shared/dialogs/store-share/store-share.component';

SwiperCore.use([Virtual]);

@Component({
  selector: 'app-store',
  templateUrl: './store.component.html',
  styleUrls: ['./store.component.scss'],
})
export class StoreComponent implements OnInit {
  URI: string = environment.uri;
  env: string = environment.assetsUrl;
  items: Item[] = [];
  tags: Tag[] = [];
  status: 'idle' | 'loading' | 'complete' | 'error' = 'idle';
  userDefaultMerchant: Merchant = null;
  paginationState: {
    pageSize: number;
    page: number;
    status: 'loading' | 'complete';
  } = {
    page: 1,
    pageSize: 15,
    status: 'loading',
  };
  renderItemsPromise: Promise<any>;
  showOptionsBar: boolean = false;
  reachedTheEndOfPagination: boolean = false;
  hasCollections: boolean = false;

  public swiperConfigTag: SwiperOptions = {
    slidesPerView: 'auto',
    freeMode: true,
    spaceBetween: 0,
  };

  public swiperConfig: SwiperOptions = {
    slidesPerView: 'auto',
    freeMode: true,
    spaceBetween: 5,
  };

  azulPaymentsSupported: boolean = false;
  swiperConfigHighlightedItems: SwiperOptions = {
    slidesPerView: 'auto',
    freeMode: false,
    spaceBetween: 0,
  };

  windowWidth: number = 0;

  link: string;

  async infinitePagination() {
    const page = document.querySelector('.store-page');
    const pageScrollHeight = page.scrollHeight;
    const verticalScroll = window.innerHeight + page.scrollTop;

    if (verticalScroll >= pageScrollHeight) {
      if (
        this.paginationState.status === 'complete' &&
        !this.reachedTheEndOfPagination
      ) {
        await this.getItems();
      }
    }
  }

  @ViewChild('tagsSwiper') tagsSwiper: SwiperComponent;
  terms: any[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private merchantService: MerchantsService,
    public headerService: HeaderService,
    private saleflow: SaleFlowService,
    private tagsService: TagsService,
    public _DomSanitizer: DomSanitizer,
    private authService: AuthService,
    private integrationService: IntegrationsService,
    private dialog: DialogService,
    private appService: AppService
  ) {}

  async ngOnInit(): Promise<void> {
    setTimeout(() => {
      this.route.queryParams.subscribe(async (queryParams) => {
        let { startOnSnapshot } = queryParams;
        startOnSnapshot = Boolean(startOnSnapshot);
        localStorage.removeItem('flowRoute');
        this.headerService.flowRoute = null;

        if (
          !this.headerService.storeTemporalData &&
          localStorage.getItem('storeTemporalData')
        ) {
          this.headerService.storeTemporalData = JSON.parse(
            localStorage.getItem('storeTemporalData')
          );
        }

        // if (!this.headerService.storeTemporalData || !startOnSnapshot)
        this.executeProcessesAfterLoading();
        // else this.getPageSnapshot();
      });

      this.windowWidth = window.innerWidth >= 500 ? 500 : window.innerWidth;

      window.addEventListener('resize', () => {
        this.windowWidth = window.innerWidth >= 500 ? 500 : window.innerWidth;
      });
      const viewsMerchants = (async () => {
        const pagination: PaginationInput = {
          findBy: {
            type: 'refund',
          },
        };
        const types: any[] = [
          { type: 'refund', text: 'Políticas de reembolsos' },
          { type: 'delivery-politics', text: 'Políticas de entregas' },
          { type: 'security', text: 'Políticas de seguridad' },
          { type: 'privacy', text: 'Políticas de privacidad' },
        ];
        for (const { type, text } of types) {
          pagination.findBy.type = type;
          const [{ _id, description }] =
            ((await this.merchantService.viewsMerchants(
              pagination
            )) as any) || { _id: '' };

          this.terms.push({ _id, text });
        }
      })();
    }, 300);
    this.link = `${this.URI}/ecommerce/${this.headerService.saleflow.merchant.slug}/store`;
  }

  onTabClick(index: number) {
    if (index === 1)
      this.router.navigate([`../collections`], {
        relativeTo: this.route,
      });
  }

  async executeProcessesAfterLoading() {
    this.status = 'loading';
    lockUI();

    // Resetear status de la ultima orden creada
    this.headerService.orderId = null;
    this.getTags();
    this.headerService.merchantInfo = this.headerService.saleflow.merchant;
    if (this.headerService.user)
      this.userDefaultMerchant = await this.merchantService.merchantDefault();
    // Obteniendo el ID de los productos, los customizers y el orden
    const saleflowItems = this.headerService.saleflow.items.map(
      (saleflowItem) => ({
        item: saleflowItem.item._id,
        customizer: saleflowItem.customizer?._id,
        index: saleflowItem.index,
      })
    );
    // Fetching la data de los productos
    const items = await this.saleflow.listItems({
      findBy: {
        _id: {
          __in: ([] = saleflowItems.map((items) => items.item)),
        },
      },
      options: {
        sortBy: 'createdAt:desc',
        limit: this.paginationState.pageSize,
      },
    });
    const { listItems: allItems } = await this.saleflow.hotListItems({
      findBy: {
        _id: {
          __in: ([] = saleflowItems.map((items) => items.item)),
        },
        $or: [
          {
            status: 'active',
          },
          {
            status: 'featured',
          },
        ],
      },
      options: {
        sortBy: 'createdAt:desc',
        limit: -1,
      },
    });

    //Verifica si son soportados los pagos con azul
    this.azulPaymentsSupported =
      await this.integrationService.integrationPaymentMethod(
        'azul',
        this.headerService.saleflow.merchant._id
      );

    // Obteniendo la lista de los items seleccionados
    const selectedItems = this.headerService.order?.products?.length
      ? this.headerService.order.products.map((subOrder) => subOrder.item)
      : [];
    // Filtrando los productos activos y destacados
    this.items = items?.listItems.filter(
      (item) => item.status === 'active' || item.status === 'featured'
    ).map((item) => ({images: item.images.sort(({index:a},{index:b}) => a>b?1:-1),...item}));

    for (let i = 0; i < this.items?.length; i++) {
      // Asignando el status a los items del saleflow
      const item = this.headerService.saleflow.items.find(
        (saleflowItem) => saleflowItem.item._id === this.items[i]._id
      );
      item.item.status = this.items[i].status;
      // Si la tienda permite compra múltiple, marcar items seleccionados
      if (this.headerService.saleflow.canBuyMultipleItems)
        this.items[i].isSelected = selectedItems.includes(this.items[i]._id);
    }
    // Sacando productos del carrito que fueron eliminados de la tienda
    if (this.headerService.order?.products?.length) {
      let itemIDs: string[] = [];
      this.headerService.order.products.forEach((item) => {
        if (!allItems.some((product) => product._id === item.item)) {
          itemIDs.push(item.item);
          this.headerService.removeOrderProduct(item.item);
          this.headerService.removeItem(item.item);
        }
      });
      this.headerService.order.products =
        this.headerService.order.products.filter(
          (product) => !itemIDs.includes(product.item)
        );
    }

    this.status = 'complete';
    this.paginationState.status = 'complete';
    unlockUI();
    if (this.headerService.customizerData)
      this.headerService.customizerData = null;
  }

  onItemClick(id: string) {
    this.savePageSnapshot();
    this.router.navigate([`../article-detail/item/${id}`], {
      relativeTo: this.route,
      queryParams: {
        mode: 'saleflow',
        id: this.headerService.saleflow._id,
      },
    });
  }

  //Same dialog as openDialog() but with StoreShare
  openUserManagementDialog = () => {
    const list: StoreShareList[] = [
      {
        title: 'Menu de opciones',
        options: [
          {
            text: 'Ir a mi perfil',
            mode: 'func',
            func: async () => {
              await this.router.navigate([
                `/others/user-contact-landing/${this.headerService.user._id}`,
              ]);
            },
          },
          {
            text: 'Cerrar sesión',
            mode: 'func',
            func: async () => {
              await this.authService.signoutThree();
            },
          },
        ],
      },
    ];

    if (!this.headerService.user) {
      list[0].options = [];
      list[0].options.push({
        text: 'Iniciar sesión',
        mode: 'func',
        func: async () => {
          this.router.navigate(['auth/login'], {
            queryParams: {
              redirect: `ecommerce/${this.headerService.saleflow.merchant.slug}/store`,
            },
          });
        },
      });
    }

    this.dialog.open(StoreShareComponent, {
      type: 'fullscreen-translucent',
      props: {
        list,
        alternate: true,
        hideCancelButtton: true,
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  };

  async getTags() {
    const { tags: tagsList } = await this.tagsService.tags({
      findBy: {
        entity: 'item',
        status: 'active',
        user: this.headerService.saleflow.merchant.owner._id,
      },
      options: {
        limit: -1,
      },
    });
    if (tagsList) {
      this.tags = tagsList;
      this.hasCollections = tagsList.some(
        (tag) => tag.notes != null && tag.notes != ''
      );
    }
  }

  async getItems(restartPagination = false) {
    this.paginationState.status = 'loading';
    // this.headerService.getOrder();

    const saleflowItems = this.headerService.saleflow.items.map(
      (saleflowItem) => ({
        item: saleflowItem.item._id,
        customizer: saleflowItem.customizer?._id,
        index: saleflowItem.index,
      })
    );

    if (restartPagination) {
      this.paginationState.page = 1;
    } else {
      this.paginationState.page++;
    }

    const pagination: PaginationInput = {
      findBy: {
        _id: {
          __in: ([] = saleflowItems.map((items) => items.item)),
        },
      },
      options: {
        sortBy: 'createdAt:desc',
        limit: this.paginationState.pageSize,
        page: this.paginationState.page,
      },
    };

    this.renderItemsPromise = this.saleflow.listItems(pagination, true);
    this.renderItemsPromise
      .then((response) => {
        const items = response;
        const itemsQueryResult = items.listItems.filter((item) => {
          return item.status === 'active' || item.status === 'featured';
        });

        if (this.paginationState.page === 1) {
          this.items = itemsQueryResult;
        } else {
          this.items = this.items.concat(itemsQueryResult);
        }

        if (itemsQueryResult.length === 0) {
          this.reachedTheEndOfPagination = true;
        }

        this.paginationState.status = 'complete';
      })
      .catch((err) => {
        console.log(err);
      });
  }

  savePageSnapshot() {
    this.headerService.storeTemporalData = {
      saleflowData: this.headerService.saleflow,
      items: this.items,
      tags: this.tags,
      user: this.headerService.user,
      userDefaultMerchant: this.userDefaultMerchant,
      paginationState: this.paginationState,
    };

    localStorage.setItem(
      'storeTemporalData',
      JSON.stringify(this.headerService.storeTemporalData)
    );

    this.headerService.flowRoute = this.router.url + '?startOnSnapshot=true';
    localStorage.setItem('flowRoute', this.headerService.flowRoute);
  }

  getPageSnapshot() {
    for (const property of Object.keys(this.headerService.storeTemporalData)) {
      if (property !== 'searchBar') {
        this[property] = this.headerService.storeTemporalData[property];
      }
    }

    this.headerService.storeTemporalData = null;
    localStorage.removeItem('storeTemporalData');
  }

  redirectToTermsOfUse(term: any) {
    this.headerService.flowRoute = this.router.url;
    localStorage.setItem('flowRoute', this.headerService.flowRoute);

    this.savePageSnapshot();

    this.router.navigate([
      '/ecommerce/' +
        this.headerService.saleflow.merchant.slug +
        '/terms-of-use/' +
        term._id,
    ]);
  }

  closeFooter() {
    document.getElementById('footer').classList.add('hide');
    document.getElementById('footerbtn').classList.remove('hide');
  }
  displayFooter() {
    document.getElementById('footer').classList.remove('hide');
    document.getElementById('footerbtn').classList.add('hide');
  }

  toggleItemInCart(index: number) {
    const item = this.items[index];

    /* Validaciones para saleflows donde solo se puede comprar un item a la vez */
    if (!item.isSelected && !this.headerService.saleflow.canBuyMultipleItems) {
      this.headerService.emptyOrderProducts();
      this.headerService.emptyItems();
    }
    /* ... */

    const product: ItemSubOrderInput = {
      item: item._id,
      amount: 1,
    };
    this.headerService.storeOrderProduct(product);
    this.appService.events.emit({
      type: 'added-item',
      data: item._id,
    });
    // this.headerService.storeItem(item);

    this.items[index].isSelected = !this.items[index].isSelected;
  }
}
