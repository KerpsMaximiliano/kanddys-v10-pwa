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

@Component({
  selector: 'app-category-items',
  templateUrl: './category-items.component.html',
  styleUrls: ['./category-items.component.scss'],
})
export class CategoryItemsComponent implements OnInit {
  sliderLabel: string = 'DISEÑOS DE SERVILLETAS MAS COMPRADOS';
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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private saleflow: SaleFlowService,
    private item: ItemsService,
    private header: HeaderService
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
    this.header.resetIsComplete();
    if (this.header.customizerData) this.header.customizerData = null;
    this.route.params.subscribe(async (params) => {
      lockUI();

      this.saleflowData = (await this.saleflow.saleflow(params.id)).saleflow;
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

      console.log('tiene customizer', this.hasCustomizer);

      const selectedItems =
        orderData?.products?.length > 0
          ? orderData.products.map((subOrder) => subOrder.item)
          : [];
      items = await this.item.itemsByCategory(this.saleflowData._id, {
        options: {
          limit: 100,
        },
      }, params.categoryId);
      console.log(items);
      const bestSellersIds = await this.item.bestSellersByMerchant(15, this.saleflowData.merchant._id)
      console.log(bestSellersIds);

      for (let i = 0; i < items.length; i++) {
        const saleflowItem = saleflowItems.find(
          (item) => item.item === items[i]._id
        );
        items[i].customizerId = saleflowItem?.customizer;
        items[i].index = saleflowItem?.index;
        items[i].isSelected = selectedItems.includes(items[i]._id);
        if (items[i].hasExtraPrice)
          items[i].totalPrice =
            items[i].fixedQuantity * items[i].params[0].values[0].price +
            items[i].pricing;
      };
      if (items.every((item) => item.index)) {
        items = items.sort((a, b) =>
          a.index > b.index ? 1 : b.index > a.index ? -1 : 0
        );
      };

      bestSellersIds.forEach((id) => {
        const item = items.find((item) => item._id === id);
        if(item) this.bestSellers.push(item);
      })
      console.log(this.bestSellers);
      this.items = [...items];
      this.originalItems = [...items];

      const itemCategoriesList = (
        await this.item.itemCategories(merchantId, {})
      ).itemCategoriesList;
      this.categoryName = itemCategoriesList.find(
        (category) => category._id === params.categoryId
      ).name;
      const headlines = await this.item.itemCategoryHeadlineByMerchant(
        merchantId
      );
      this.getCategories(itemCategoriesList, headlines);

      unlockUI();
    });
  }

  onClick(index: any) {
    console.log(index);
    let itemData = this.items[index];
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
      if(itemData.params.length > 0) {
        itemParams = [{
          param: itemData.params[0]._id,
          paramValue:
          itemData.params[0].values[0]._id,
        }];
      };
      const product = {
        item: itemData._id,
        customizer: itemData.customizerId,
        params: itemParams,
        amount: itemData.customizerId ? undefined : 1,
        saleflow: this.saleflowData._id,
        name: itemData.name,
      }
      this.header.order = {
        products: [product],
      };
      this.header.storeOrderProduct(this.saleflowData._id, product);
      this.header.storeItem(this.saleflowData._id, itemData);
      this.router.navigate([`/ecommerce/provider-store`]);
    }
    else this.router.navigate([
      '/ecommerce/item-detail/' +
      this.header.saleflow._id +
      '/' +
      itemData._id,
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
    if (type === 'item') {
      if (index != undefined) {
        const itemData = this.originalItems[index];
        itemData.isSelected =
          !itemData.isSelected;
        let itemParams: ItemSubOrderParamsInput[];
        if(itemData.params.length > 0) {
          itemParams = [{
            param: itemData.params[0]._id,
            paramValue:
            itemData.params[0].values[0]._id,
          }];
        };
        const product = {
          item: itemData._id,
          customizer: itemData.customizerId,
          params: itemParams,
          amount: itemData.customizerId ? undefined : 1,
          saleflow: this.saleflowData._id,
          name: itemData.name,
        };
        this.header.storeOrderProduct(this.saleflowData._id, product);
        this.header.storeItem(
          this.saleflowData._id,
          itemData
        );
      }
    } else if (type === 'package') {
      //
    }
  }

  goBack() {
    this.router.navigate(['/ecommerce/megaphone-v3/' + this.saleflowData._id]);
  }
}
