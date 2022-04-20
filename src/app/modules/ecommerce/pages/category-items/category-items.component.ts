import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  Item,
  ItemCategory,
  ItemCategoryHeadline,
  ItemParam,
  ItemParamValue,
} from 'src/app/core/models/item';
import { SaleFlow } from 'src/app/core/models/saleflow';
import { HeaderService } from 'src/app/core/services/header.service';
import { ItemsService } from 'src/app/core/services/items.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';

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
  filters: any[];
  loadingSwiper: boolean;
  selectedTagsIds: any = [];

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
      let customizersId: string[] = [];
      let itemsId: string[] = [];
      let items: Item[] = [];
      const merchantId = this.saleflowData.merchant._id;

      if (this.saleflowData.items.length !== 0) {
        for (let i = 0; i < this.saleflowData.items.length; i++) {
          if (this.saleflowData?.items[i]?.customizer?._id)
            customizersId.push(this.saleflowData.items[i].customizer._id);
          itemsId.push(this.saleflowData.items[i].item._id);
        }
      }

      const selectedItems = orderData?.products?.length > 0 ? orderData.products.map((subOrder) => subOrder.item) : [];
      items = (
        await this.saleflow.listItems({
          findBy: {
            _id: {
              __in: ([] = itemsId),
            },
          },
          options: {
            limit: 100,
          },
        })
      ).listItems;

      for (let i = 0; i < items.length; i++) {
        items[i].customizerId = customizersId[i];
        items[i].isSelected = selectedItems.includes(items[i]._id);
        if (items[i].hasExtraPrice)
          items[i].totalPrice =
            items[i].fixedQuantity * items[i].params[0].values[0].price +
            items[i].pricing;
      }

      this.items = items.filter((item) =>
        item.category.some((category) => category._id === params.categoryId)
      );
      this.originalItems = items.filter((item) =>
        item.category.some((category) => category._id === params.categoryId)
      );

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
      // if(this.categoryName === 'Tragos') this.iconImage = "https://storage-rewardcharly.sfo2.digitaloceanspaces.com/images/Trago.png";
      // if(this.categoryName === 'Baño') this.iconImage = "https://storage-rewardcharly.sfo2.digitaloceanspaces.com/images/Banio.png";
      // if(this.categoryName === 'Comidas') this.iconImage = "https://storage-rewardcharly.sfo2.digitaloceanspaces.com/images/Comida.png";
    });
  }

  onClick(index: any) {
    console.log(index);
    let itemData;
    if (index.index) {
      itemData = this.items[index.index];
    }else{
      itemData = this.items[index]
    }
    let params: ItemParam;
    let selectedValue: ItemParamValue;
    if (itemData.params.length > 0) {
      params = itemData.params[0];
      selectedValue = params.values[0];
    }
    // const amount = itemData.fixedQuantity ?? 1;
    // const itemQuantity = itemData.fixedQuantity ?? 1;
    // const total = itemData.pricing + itemQuantity * selectedValue.price;

    // itemData.total = total;
    // itemData.amount = amount;
    this.header.items = [itemData];

    const order = {
      products: [{}],
    };
    this.header.order = order;
    this.header.order.products[0].item = itemData._id;
    // this.header.order.products[0].amount = amount;
    this.header.order.products[0].saleflow = this.header.saleflow._id;
    if (params) {
      this.header.order.products[0].params = [];
      this.header.order.products[0].params[0] = {
        param: params._id,
        paramValue: selectedValue._id,
      };
    }

    this.router.navigate([`/ecommerce/provider-store`]);
    //this.router.navigate(['/ecommerce/item-detail/' + this.header.saleflow._id + '/' + itemData._id]);
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
    if(type === 'item') {
      if(index != undefined) {
        this.originalItems[index].isSelected = !this.originalItems[index].isSelected;
        let itemParams = {
          param: this.originalItems[index].params[0]._id,
          paramValue: this.originalItems[index].params[0].values[0]._id
        }
        this.header.storeItems(this.saleflowData._id, {
            item: this.originalItems[index]._id,
            customizer: this.originalItems[index].customizerId,
            params: [itemParams],
            saleflow: this.saleflowData._id,
        });
        this.header.storeItemProduct(this.saleflowData._id, this.originalItems[index]);
      }
    } else if(type === 'package') {
      //
    }
  }

  goBack() {
    this.router.navigate(['/ecommerce/megaphone-v3/' + this.saleflowData._id]);
  }
}
