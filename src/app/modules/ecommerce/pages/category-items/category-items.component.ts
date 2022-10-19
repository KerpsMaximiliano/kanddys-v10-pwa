import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import {
  Item,
  ItemCategory,
  ItemCategoryHeadline
} from 'src/app/core/models/item';
import { ItemSubOrderParamsInput } from 'src/app/core/models/order';
import { SaleFlow } from 'src/app/core/models/saleflow';
import { AuthService } from 'src/app/core/services/auth.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { ItemsService } from 'src/app/core/services/items.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { environment } from 'src/environments/environment';
// import { SwiperOptions } from 'swiper';
import { OrderService } from 'src/app/core/services/order.service';
import {
  StoreShareComponent,
  StoreShareList
} from 'src/app/shared/dialogs/store-share/store-share.component';

@Component({
  selector: 'app-category-items',
  templateUrl: './category-items.component.html',
  styleUrls: ['./category-items.component.scss'],
})
export class CategoryItemsComponent implements OnInit {
  URI: string = environment.uri;
  items: Item[] = [];
  originalItems: Item[] = [];
  saleflow: SaleFlow;
  categoryId: string;
  categoryName: string;
  iconImage: string;
  filters: any[] = [];
  loadingSwiper: boolean;
  selectedTagsIds: any = [];
  hasCustomizer: boolean;
  bestSellers: Item[] = [];
  deleteEvent: Subscription;
  isMerchant: boolean;
  totalByItems: {
    item: Item;
    itemInOrder: number;
    total: number;
  }[] = [];
  ordersTotal: {
    total: number;
    length: number;
  };
  // public swiperConfig: SwiperOptions = {
  //   slidesPerView: 'auto',
  //   freeMode: true,
  //   spaceBetween: 1,
  // };

  env: string = environment.assetsUrl;

  constructor(
    private dialog: DialogService,
    private route: ActivatedRoute,
    private router: Router,
    private item: ItemsService,
    private header: HeaderService,
    private appService: AppService,
    private authService: AuthService,
    private merchantService: MerchantsService,
    private orderService: OrderService
  ) {}

  async getCategories(
    itemCategoriesList: ItemCategory[],
    headlines: ItemCategoryHeadline[]
  ) {
    if (itemCategoriesList.length === 0) return;

    const ignoreCategories = ['Tragos', 'Comidas', 'Baño'];
    itemCategoriesList = itemCategoriesList.filter(
      (value) => !ignoreCategories.includes(value.name)
    );
    headlines = headlines.filter((value) => value.headline !== 'Categorias');

    const filters = headlines.map((headline) => {
      const options = headline.itemsCategories
        .map((value) =>
          itemCategoriesList.find((element) => element._id === value)
        )
        .filter((item) => item)
        .map((filter) => {
          return {
            id: filter._id,
            label: filter.name,
            type: 'label',
            selected: false,
          };
        });

      return {
        section: 'categories',
        title: 'Categorías',
        subtitle: headline.headline,
        property: 'category',
        options,
      };
    });

    this.filters = filters;
  }

  ngOnInit(): void {
    this.deleteEvent = this.appService.events
      .pipe(filter((e) => e.type === 'deleted-item'))
      .subscribe((e) => {
        let productData: Item[] = this.header.getItems(this.saleflow._id);
        const selectedItems = productData?.length
          ? productData.map((item) => item._id)
          : [];
        this.items.forEach((item) => {
          if (!item.customizerId)
            item.isSelected = selectedItems.includes(item._id);
        });
      });
    this.header.resetIsComplete();
    if (this.header.customizerData) this.header.customizerData = null;
    this.route.params.subscribe(async (params) => {
      lockUI();
      this.saleflow = await this.header.fetchSaleflow(params.id);
      this.categoryId = params.categoryId;
      // this.route.queryParams.subscribe(async (queries) => {
      //   if (queries.edit) {
      const user = await this.authService.me();
      if (user) {
        const merchants = await this.merchantService.myMerchants();
        if (merchants?.length > 0) {
          const merchant = merchants.find(
            (element) => element._id === this.saleflow.merchant._id
          );
          if (merchant) this.isMerchant = true;
        }
      }
      //   }
      // });
      const orderData = this.header.getOrder(this.saleflow._id);
      let saleflowItems: {
        item: string;
        customizer: string;
        index: number;
      }[] = [];
      let items: Item[] = [];
      const merchantId = this.saleflow.merchant._id;

      if (this.saleflow.items.length !== 0) {
        for (let i = 0; i < this.saleflow.items.length; i++) {
          saleflowItems.push({
            item: this.saleflow.items[i].item._id,
            customizer: this.saleflow.items[i].customizer?._id,
            index: this.saleflow.items[i].index,
          });
        }
        if (saleflowItems.some((item) => item.customizer))
          this.hasCustomizer = true;
      }

      const selectedItems =
        orderData?.products?.length > 0
          ? orderData.products.map((subOrder) => subOrder.item)
          : [];
      items = (
        await this.item.itemsByCategory(
          params.categoryId,
          {
            options: {
              limit: 100,
            },
          },
          this.saleflow._id
        )
      ).filter((item) => item.status == 'active');
      for (let i = 0; i < items.length; i++) {
        const saleflowItem = saleflowItems.find(
          (item) => item.item === items[i]._id
        );
        items[i].customizerId = saleflowItem?.customizer;
        items[i].index = saleflowItem?.index;
        if (!items[i].customizerId)
          items[i].isSelected = selectedItems.includes(items[i]._id);
        if (items[i].hasExtraPrice)
          items[i].totalPrice =
            items[i].fixedQuantity * items[i].params[0].values[0].price +
            items[i].pricing;
      }
      if (items.every((item) => item.index)) {
        items = items.sort((a, b) =>
          a.index > b.index ? 1 : b.index > a.index ? -1 : 0
        );
      }

      // if(!this.hasCustomizer) {
      //   const bestSellersIds = await this.item.bestSellersByMerchant(
      //     15,
      //     this.saleflow.merchant._id
      //   );
      //   bestSellersIds.forEach((id) => {
      //     const item = items.find((item) => item._id === id);
      //     if (item) this.bestSellers.push(item);
      //   });
      // }

      this.items = [...items];
      this.originalItems = [...items];

      const itemCategoriesList = (
        await this.item.itemCategories(merchantId, {
          options: {
            limit: 20,
          },
        })
      ).itemCategoriesList;
      this.categoryName = itemCategoriesList.find(
        (category) => category._id === params.categoryId
      )?.name;
      const headlines = await this.item.itemCategoryHeadlineByMerchant(
        merchantId
      );
      await this.getCategories(itemCategoriesList, headlines);
      if (this.isMerchant) {
        const totalByItems = await this.item.totalByItem(
          this.saleflow.merchant._id,
          items.map((item) => item._id)
        );
        for (let i = 0; i < items.length; i++) {
          const sale = totalByItems.find(
            (item) => item.item._id === items[i]._id
          );
          this.totalByItems.push(sale);
        }
        this.ordersTotal = await this.orderService.ordersTotal(
          ['completed', 'to confirm', 'verifying'],
          merchantId,
          [],
          this.categoryId
        );
      }
      unlockUI();
    });
  }

  onClick(index: any, type?: string) {
    let itemData =
      type === 'slider' ? this.bestSellers[index] : this.items[index];
    this.header.items = [itemData];
    if (itemData.customizerId) {
      this.header.emptyOrderProducts(this.saleflow._id);
      this.header.emptyItems(this.saleflow._id);
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
        amount: itemData.customizerId ? undefined : 1,
        saleflow: this.saleflow._id,
        name: itemData.name,
      };
      this.header.order = {
        products: [product],
      };
      this.header.storeOrderProduct(this.saleflow._id, product);
      this.header.storeItem(this.saleflow._id, itemData);
      this.router.navigate([
        `/ecommerce/provider-store/${this.saleflow._id}/${itemData._id}`,
      ]);
    } else
      this.router.navigate(
        ['/ecommerce/item-detail/' + this.saleflow._id + '/' + itemData._id],
        {
          queryParams: { viewtype: this.isMerchant ? 'merchant' : 'community' },
        }
      );
  }

  onShareClick = () => {
    const list: StoreShareList[] = [
      {
        qrlink: `${this.URI}/ecommerce/category-items/${this.saleflow._id}/${this.categoryId}`,
        options: [
          {
            text: 'Copia el link',
            mode: 'clipboard',
            link: `${this.URI}/ecommerce/category-items/${this.saleflow._id}/${this.categoryId}`,
          },
          {
            text: 'Comparte el link',
            mode: 'share',
            link: `${this.URI}/ecommerce/category-items/${this.saleflow._id}/${this.categoryId}`,
          },
        ],
      },
    ];

    if (!this.hasCustomizer) {
      list[0].options.push({
        text: 'Ir a la vista del visitante',
        mode: 'func',
        func: () =>
          this.router.navigate([
            `/ecommerce/category-items/${this.saleflow._id}/${this.categoryId}`,
          ]),
      });
    }

    this.dialog.open(StoreShareComponent, {
      type: 'fullscreen-translucent',
      props: {
        list,
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  };

  goBack() {
    this.router.navigate(['/ecommerce/store/' + this.saleflow._id]);
  }
}
