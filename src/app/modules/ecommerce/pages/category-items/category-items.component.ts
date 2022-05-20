import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  Item,
  ItemCategory,
  ItemCategoryHeadline,
} from 'src/app/core/models/item';
import { SaleFlow } from 'src/app/core/models/saleflow';
import { HeaderService } from 'src/app/core/services/header.service';
import { ItemsService } from 'src/app/core/services/items.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { ItemSubOrderParamsInput } from 'src/app/core/models/order';
import { Subscription } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { filter } from 'rxjs/operators';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { ShowItemsComponent } from 'src/app/shared/dialogs/show-items/show-items.component';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/core/services/auth.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { SwiperOptions } from 'swiper';

@Component({
  selector: 'app-category-items',
  templateUrl: './category-items.component.html',
  styleUrls: ['./category-items.component.scss'],
})
export class CategoryItemsComponent implements OnInit {
  items: Item[] = [];
  originalItems: Item[] = [];
  saleflowData: SaleFlow;
  categoryName: string;
  iconImage: string;
  merchantId: string;
  filters: any[] = [];
  loadingSwiper: boolean;
  selectedTagsIds: any = [];
  hasCustomizer: boolean;
  bestSellers: Item[] = [];
  deleteEvent: Subscription;
  canOpenCart: boolean;
  isMerchant: boolean;
  public swiperConfig: SwiperOptions = {
    slidesPerView: 'auto',
    freeMode: true,
    spaceBetween: 1,
  };

  env: string = environment.assetsUrl;

  constructor(
    private dialog: DialogService,
    private route: ActivatedRoute,
    private router: Router,
    private saleflow: SaleFlowService,
    private item: ItemsService,
    private header: HeaderService,
    private appService: AppService,
    private authService: AuthService,
    private merchantService: MerchantsService,
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
        let productData = this.header.getItems(this.saleflowData._id);
        if (productData.length > 0) {
          for (let i = 0; i < productData.length; i++) {
            for (let j = 0; j < this.items.length; j++) {
              if (productData[i]._id === this.items[j]._id)
                this.items[j].isSelected = true;
              else this.items[j].isSelected = false;
            }
          }
        } else {
          for (let i = 0; i < this.items.length; i++) {
            this.items[i].isSelected = false;
          }
        }
        this.canOpenCart = this.items.some((item) => item.isSelected);
      });
    this.header.resetIsComplete();
    if (this.header.customizerData) this.header.customizerData = null;
    this.route.params.subscribe(async (params) => {
      lockUI();
      this.saleflowData = (await this.saleflow.saleflow(params.id)).saleflow;
      this.route.queryParams.subscribe(async (queries) => {
        if(queries.edit) {
          const user = await this.authService.me();
          if(user) {
            const merchants = await this.merchantService.myMerchants();
            if(merchants?.length > 0) {
              const merchant = merchants.find(element => element._id === this.saleflowData.merchant._id)
              if(merchant) {
                this.isMerchant = true;
              }
            }
          }
        }
      })
      const orderData = this.header.getOrder(this.saleflowData._id);
      let saleflowItems: {
        item: string;
        customizer: string;
        index: number;
      }[] = [];
      let items: Item[] = [];
      const merchantId = this.saleflowData.merchant._id;

      if (this.saleflowData.items.length !== 0) {
        for (let i = 0; i < this.saleflowData.items.length; i++) {
          saleflowItems.push({
            item: this.saleflowData.items[i].item._id,
            customizer: this.saleflowData.items[i].customizer?._id,
            index: this.saleflowData.items[i].index,
          });
        }
        if (saleflowItems.some((item) => item.customizer))
          this.hasCustomizer = true;
      }

      const selectedItems =
        orderData?.products?.length > 0
          ? orderData.products.map((subOrder) => subOrder.item)
          : [];
      items = await this.item.itemsByCategory(
        this.saleflowData._id,
        {
          options: {
            limit: 100,
          },
        },
        params.categoryId
      );
      const bestSellersIds = await this.item.bestSellersByMerchant(
        15,
        this.saleflowData.merchant._id
      );

      for (let i = 0; i < items.length; i++) {
        const saleflowItem = saleflowItems.find(
          (item) => item.item === items[i]._id
        );
        items[i].customizerId = saleflowItem?.customizer;
        items[i].index = saleflowItem?.index;
        if(!items[i].customizerId) items[i].isSelected = selectedItems.includes(items[i]._id);
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

      bestSellersIds.forEach((id) => {
        const item = items.find((item) => item._id === id);
        if (item) this.bestSellers.push(item);
      });
      this.items = [...items];
      this.originalItems = [...items];

      this.canOpenCart = orderData?.products?.length > 0;
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

      unlockUI();
    });
  }

  onClick(index: any, type?: string) {
    let itemData =
      type === 'slider' ? this.bestSellers[index] : this.items[index];
    // if (index.index) {
    //   itemData = this.items[index.index];
    // } else {
    //   itemData = this.items[index];
    // }
    this.header.items = [itemData];
    if (itemData.customizerId) {
      this.header.emptyOrderProducts(this.saleflowData._id);
      this.header.emptyItems(this.saleflowData._id);
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
        saleflow: this.saleflowData._id,
        name: itemData.name,
      };
      this.header.order = {
        products: [product],
      };
      this.header.storeOrderProduct(this.saleflowData._id, product);
      this.header.storeItem(this.saleflowData._id, itemData);
      this.router.navigate([
        `/ecommerce/provider-store/${this.saleflowData._id}/${itemData._id}`,
      ]);
    } else
      this.router.navigate([
        '/ecommerce/item-detail/' + this.saleflowData._id + '/' + itemData._id,
      ]);
  }

  closeTagEvent(e) {
    let tagOptions = e.map((values) => values.options);
    tagOptions = [].concat.apply([], tagOptions);

    this.selectedTagsIds = tagOptions.filter((el) => el.selected);

    if (this.selectedTagsIds.length === 0) {
      this.items = this.originalItems;
      return;
    }

    let filteredItems = [...this.originalItems];
    this.selectedTagsIds.forEach((tag) => {
      filteredItems = filteredItems.filter((item) => {
        let isValid = false;
        item.category.forEach((category) => {
          if (category._id === tag.id) isValid = true;
        });
        return isValid;
      });
    });
    this.items = filteredItems;
    this.loadingSwiper = false;
  }

  tagDeleted(e) {
    this.selectedTagsIds = this.selectedTagsIds.filter(
      (el) => el.id !== e.name[0].id
    );

    if (this.selectedTagsIds.length === 0) {
      this.items = this.originalItems;
      return;
    }

    let filteredItems = [...this.originalItems];
    this.selectedTagsIds.forEach((tag) => {
      filteredItems = filteredItems.filter((item) => {
        let isValid = false;
        item.category.forEach((category) => {
          if (category._id === tag.id) isValid = true;
        });
        return isValid;
      });
    });
    this.items = filteredItems;
    this.loadingSwiper = false;
  }

  startLoading(e: boolean) {
    this.loadingSwiper = e;
  }

  toggleSelected(type: string, index: number) {
    if (index != undefined) {
      const itemData =
        type === 'slider' ? this.bestSellers[index] : this.items[index];
      itemData.isSelected = !itemData.isSelected;
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
        saleflow: this.saleflowData._id,
        name: itemData.name,
      };
      this.header.storeOrderProduct(this.saleflowData._id, product);
      this.header.storeItem(this.saleflowData._id, itemData);
    }
    this.canOpenCart = this.items.some((item) => item.isSelected);
  }

  showShoppingCartDialog() {
    this.dialog.open(ShowItemsComponent, {
      type: 'flat-action-sheet',
      props: {
        headerButton: 'Ver mas productos',
        footerCallback: () =>
          this.router.navigate(['/ecommerce/create-giftcard']),
        headerCallback: () =>
          this.router.navigate([
            `ecommerce/megaphone-v3/${this.header.saleflow._id}`,
          ]),
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  }

  goBack() {
    this.router.navigate(['/ecommerce/megaphone-v3/' + this.saleflowData._id]);
  }
}
