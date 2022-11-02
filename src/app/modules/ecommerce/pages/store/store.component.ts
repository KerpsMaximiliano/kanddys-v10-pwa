import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import {
  Item,
  ItemCategory,
  ItemCategoryHeadline,
} from 'src/app/core/models/item';
import { Merchant } from 'src/app/core/models/merchant';
import { ItemSubOrderParamsInput } from 'src/app/core/models/order';
import { SaleFlow } from 'src/app/core/models/saleflow';
import { AuthService } from 'src/app/core/services/auth.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { ItemsService } from 'src/app/core/services/items.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { OrderService } from 'src/app/core/services/order.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import {
  StoreShareComponent,
  StoreShareList,
} from 'src/app/shared/dialogs/store-share/store-share.component';
import { environment } from 'src/environments/environment';
import { SwiperOptions } from 'swiper';

@Component({
  selector: 'app-store',
  templateUrl: './store.component.html',
  styleUrls: ['./store.component.scss'],
})
export class StoreComponent implements OnInit {
  URI: string = environment.uri;
  env: string = environment.assetsUrl;
  saleflowData: SaleFlow;
  hasCustomizer: boolean;
  items: Item[] = [];
  itemsByCategory: {
    label: string;
    items: Item[];
    images: {
      src: string;
      alt?: string;
      callback: () => void;
    }[];
    earnings?: string;
    sales?: number;
    shareCallback: () => void;
    callback: () => void;
  }[] = [];
  categorylessItems: Item[] = [];
  categories: ItemCategory[] = [];
  contactLandingRoute: string;
  highlightedItems: Item[] = [];
  // canOpenCart: boolean;
  itemCartAmount: number;
  deleteEvent: Subscription;
  status: 'idle' | 'loading' | 'complete' | 'error' = 'idle';
  admin: boolean;
  public swiperConfig: SwiperOptions = {
    slidesPerView: 'auto',
    freeMode: true,
    spaceBetween: 5,
  };

  swiperConfigHighlightedItems: SwiperOptions = {
    slidesPerView: 'auto',
    freeMode: false,
    spaceBetween: 0,
  };

  constructor(
    private dialog: DialogService,
    private router: Router,
    private merchant: MerchantsService,
    public header: HeaderService,
    private saleflow: SaleFlowService,
    private item: ItemsService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private orderService: OrderService,
    private location: Location
  ) {}

  setMerchant(merchant: Merchant) {
    this.header.merchantInfo = merchant;
    localStorage.setItem('merchantInfo', JSON.stringify(merchant));
  }

  getCategories(
    itemCategoriesList: ItemCategory[],
    headlines: ItemCategoryHeadline
  ) {
    if (itemCategoriesList.length === 0) return;
    const categories =
      headlines?.itemsCategories.length > 0
        ? headlines.itemsCategories
            .map((value) =>
              itemCategoriesList.find((element) => element._id === value)
            )
            .filter((value) => value)
        : [];
    return categories;
  }

  async organizeItems(merchant: Merchant) {
    this.categorylessItems = this.items.filter((item) => !item.category.length);
    // .sort((a, b) => a.pricing - b.pricing);
    const highlightedItemsObject = {};
    this.highlightedItems = [];

    for (const item of this.categorylessItems) {
      if (item.status === 'featured') {
        this.highlightedItems.push(item);
        highlightedItemsObject[item._id] = true;
      }
    }

    if (!this.categories || !this.categories.length) return;
    this.categories.forEach(async (saleflowCategory) => {
      if (
        this.items.some((item) =>
          item.category.some(
            (category) => category.name === saleflowCategory.name
          )
        )
      ) {
        lockUI();
        let ordersTotal: { total: number; length: number };
        if (this.admin)
          ordersTotal = await this.orderService.ordersTotal(
            ['completed', 'to confirm', 'verifying'],
            merchant._id,
            [],
            saleflowCategory._id
          );
        const url = `/ecommerce/category-items/${this.header.saleflow._id}/${saleflowCategory._id}`;
        this.itemsByCategory.push({
          label: saleflowCategory.name,
          items: this.items.filter((item) =>
            item.category.some(
              (category) => category.name === saleflowCategory.name
            )
          ),
          images: this.items
            .filter((item) =>
              item.category.some(
                (category) => category.name === saleflowCategory.name
              )
            )
            .map((item) => ({
              src: item.images?.length ? item.images[0] : '',
              callback: () => this.onItemClick(item._id),
            })),
          earnings: ordersTotal?.total.toLocaleString('es-MX'),
          sales: ordersTotal?.length,
          callback: () => this.router.navigate([url]),
          shareCallback: () => this.onShareCallback(url),
        });

        for (const itemCategory of this.itemsByCategory) {
          for (const item of itemCategory.items) {
            if (!highlightedItemsObject[item._id]) {
              this.highlightedItems.push(item);
              highlightedItemsObject[item._id] = true;
            }
          }
        }

        unlockUI();
      }
    });
  }

  // =====================================================

  async ngOnInit(): Promise<void> {
    this.executeProcessesAfterLoading();
  }

  executeProcessesAfterLoading() {
    this.route.params.subscribe(async (params) => {
      this.status = 'loading';
      lockUI();

      // Resetear status de la ultima orden creada
      this.header.orderId = null;
      // Fetch data del saleflow obtenido de la ruta
      this.saleflowData = await this.header.fetchSaleflow(params.id);

      // Obteniendo las categorias, el merchant de la tienda y el usuario actual
      const [itemCategories, headlines, merchant, user] = await Promise.all([
        this.item.itemCategories(this.saleflowData.merchant._id, {
          options: {
            limit: 20,
          },
        }),
        this.item.itemCategoryHeadlineByMerchant(
          this.saleflowData.merchant._id
        ),
        this.merchant.merchant(this.saleflowData.merchant._id),
        this.authService.me(),
      ]);
      // Determina si el usuario actual es el dueño de la tienda
      if (user?._id === merchant?.owner?._id) {
        this.admin = true;
      }
      this.categories = this.getCategories(
        itemCategories.itemCategoriesList,
        headlines[0]
      );
      this.setMerchant(merchant);
      this.contactLandingRoute = `user-contact-landing/${merchant.owner._id}`;
      // Obteniendo el ID de los productos, los customizers y el orden
      const saleflowItems = this.saleflowData.items.map((saleflowItem) => ({
        item: saleflowItem.item._id,
        customizer: saleflowItem.customizer?._id,
        index: saleflowItem.index,
      }));
      // Determina si la tienda maneja customizers
      if (saleflowItems.some((item) => item.customizer))
        this.hasCustomizer = true;
      // Fetching la data de los productos
      const items = await this.saleflow.listItems({
        findBy: {
          _id: {
            __in: ([] = saleflowItems.map((items) => items.item)),
          },
        },
        options: {
          sortBy: 'createdAt:desc',
          limit: 60,
        },
      });
      // Obteniendo la lista de los items seleccionados
      const selectedItems =
        this.header.order?.products?.map((subOrder) => subOrder.item) || [];
      // Filtrando los productos activos y destacados
      this.items = items.listItems.filter((item) => {
        return item.status === 'active' || item.status === 'featured';
      });
      this.items.forEach((item) => {
        const saleflowItem = saleflowItems.find(
          (saleflowItem) => saleflowItem.item === item._id
        );
        // Asignando customizer e index a los productos correspondientes
        item.customizerId = saleflowItem.customizer;
        item.index = saleflowItem.index;
        // Si la tienda permite compra múltiple, marcar items seleccionados
        if (this.saleflowData.canBuyMultipleItems)
          item.isSelected = selectedItems.includes(item._id);
        // Si el producto tiene precio extra, aplicar fórmula
        if (item.hasExtraPrice)
          item.totalPrice =
            item.fixedQuantity * item.params[0].values[0].price + item.pricing;
      });
      // Si todos los productos tienen un index, ordenar por index
      if (this.items.every((item) => item.index)) {
        this.items = this.items.sort((a, b) =>
          a.index > b.index ? 1 : b.index > a.index ? -1 : 0
        );
      }
      // Sacando productos del carrito que fueron eliminados de la tienda
      if (this.header.order?.products?.length) {
        let itemIDs: string[] = [];
        this.header.order.products.forEach((item) => {
          if (!this.items.some((product) => product._id === item.item)) {
            itemIDs.push(item.item);
            this.header.removeOrderProduct(this.saleflowData._id, item.item);
            this.header.removeItem(this.saleflowData._id, item.item);
          }
        });
        this.header.order.products = this.header.order.products.filter(
          (product) => !itemIDs.includes(product.item)
        );
      }
      // Organizando productos según su estado y categoría
      await this.organizeItems(merchant);
      if (this.header.customizerData) this.header.customizerData = null;
      // Marcar carga de la tienda como completada
      this.status = 'complete';
      unlockUI();
    });
  }

  seeCategories(index: number | string) {
    if (typeof index === 'string')
      this.router.navigate([
        `ecommerce/category-items/${this.saleflowData._id}/${index}`,
      ]);
    else
      this.router.navigate([
        `ecommerce/category-items/${this.saleflowData._id}/${
          this.itemsByCategory[index].items[0].category.find(
            (category) => category.name === this.itemsByCategory[index].label
          )._id
        }`,
      ]);
  }

  onItemClick(id: string) {
    const itemData = this.items.find((item) => item._id === id);
    if (!itemData) return;
    if (itemData.category.length)
      this.header.categoryId = itemData.category[0]?._id;
    if (!this.header.saleflow.canBuyMultipleItems) {
      this.header.emptyOrderProducts(this.saleflowData._id);
      this.header.emptyItems(this.saleflowData._id);
    }
    if (itemData.customizerId) {
      let itemParams: ItemSubOrderParamsInput[];
      if (itemData.params.length > 0) {
        itemParams = [
          {
            param: itemData.params[0]._id,
            paramValue: itemData.params[0].values[0]._id,
          },
        ];
      }
      const product = {
        item: itemData._id,
        customizer: itemData.customizerId,
        params: itemParams,
        amount: undefined,
        saleflow: this.saleflowData._id,
      };
      this.header.items = [itemData];
      this.header.order = {
        products: [product],
      };
      this.header.storeOrderProduct(this.saleflowData._id, product);
      this.header.storeItem(this.saleflowData._id, itemData);
      this.router.navigate([
        `/ecommerce/provider-store/${this.saleflowData._id}/${itemData._id}`,
      ]);
    } else {
      this.router.navigate(
        [`/ecommerce/item-detail/${this.saleflowData._id}/${itemData._id}`],
        {
          replaceUrl: this.header.checkoutRoute ? true : false,
        }
      );
    }
  }

  onShareCallback = (url: string) => {
    const list: StoreShareList[] = [
      {
        qrlink: `${this.URI}${url}`,
        options: [
          {
            text: 'Copia el link',
            mode: 'clipboard',
            link: `${this.URI}${url}`,
          },
          {
            text: 'Comparte el link',
            mode: 'share',
            link: `${this.URI}${url}`,
          },
        ],
      },
    ];
    this.dialog.open(StoreShareComponent, {
      type: 'fullscreen-translucent',
      props: {
        list,
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  };

  openLogoutDialog() {
    this.dialog.open(StoreShareComponent, {
      type: 'fullscreen-translucent',
      props: {
        alternate: true,
        buttonText: 'Cerrar Sesión',
        buttonCallback: () => {
          this.authService.signoutThree();
        },
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  }

  back() {
    this.location.back();
  }
}
