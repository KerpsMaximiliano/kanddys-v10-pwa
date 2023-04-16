import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import {
  Item,
  ItemCategory,
  ItemCategoryHeadline,
} from 'src/app/core/models/item';
import { ItemSubOrderParamsInput } from 'src/app/core/models/order';
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
  StoreShareList,
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
        let productData = this.header.getItems();
        const selectedItems = productData?.length
          ? productData.map((item) => item)
          : [];
        this.items.forEach((item) => {
          if (!item.customizerId)
            item.isSelected = selectedItems.includes(item._id);
        });
      });
    this.header.resetOrderProgress();
    if (this.header.customizerData) this.header.customizerData = null;
    this.route.params.subscribe(async ({ categoryId }) => {
      lockUI();
      this.categoryId = categoryId;
      const user = await this.authService.me();
      if (user) {
        const merchants = await this.merchantService.myMerchants();
        if (merchants?.length > 0) {
          const merchant = merchants.find(
            (element) => element._id === this.header.saleflow.merchant._id
          );
          if (merchant) this.isMerchant = true;
        }
      }
      //   }
      // });
      let saleflowItems: {
        item: string;
        customizer: string;
        index: number;
      }[] = [];
      let items: Item[] = [];
      const merchantId = this.header.saleflow.merchant._id;

      if (this.header.saleflow.items.length !== 0) {
        for (let i = 0; i < this.header.saleflow.items.length; i++) {
          saleflowItems.push({
            item: this.header.saleflow.items[i].item._id,
            customizer: this.header.saleflow.items[i].customizer?._id,
            index: this.header.saleflow.items[i].index,
          });
        }
        if (saleflowItems.some((item) => item.customizer))
          this.hasCustomizer = true;
      }

      const selectedItems =
        this.header.order?.products?.length > 0
          ? this.header.order.products.map((subOrder) => subOrder.item)
          : [];
      items = (
        await this.item.itemsByCategory(
          categoryId,
          {
            options: {
              limit: 100,
            },
          },
          this.header.saleflow._id
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
      //     this.header.saleflow.merchant._id
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
        (category) => category._id === categoryId
      )?.name;
      const headlines = await this.item.itemCategoryHeadlineByMerchant(
        merchantId
      );
      await this.getCategories(itemCategoriesList, headlines);
      if (this.isMerchant) {
        const totalByItems = await this.item.totalByItem(
          this.header.saleflow.merchant._id,
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

  onClick(index: any, type?: string) {}

  onShareClick = () => {
    const list: StoreShareList[] = [
      {
        qrlink: `${this.URI}/ecommerce/${this.header.saleflow.merchant.slug}/category-items/${this.categoryId}`,
        options: [
          {
            text: 'Copia el link',
            mode: 'clipboard',
            link: `${this.URI}/ecommerce/${this.header.saleflow.merchant.slug}/category-items/${this.categoryId}`,
          },
          {
            text: 'Comparte el link',
            mode: 'share',
            link: `${this.URI}/ecommerce/${this.header.saleflow.merchant.slug}/category-items/${this.categoryId}`,
          },
        ],
      },
    ];

    if (!this.hasCustomizer) {
      list[0].options.push({
        text: 'Ir a la vista del visitante',
        mode: 'func',
        func: () =>
          this.router.navigate([`../../category-items/${this.categoryId}`], {
            relativeTo: this.route,
          }),
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
    this.router.navigate([`../../store`], {
      relativeTo: this.route,
    });
  }
}
