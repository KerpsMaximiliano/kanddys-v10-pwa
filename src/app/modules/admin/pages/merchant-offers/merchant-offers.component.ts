import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { ItemSubOrderInput } from 'src/app/core/models/order';
import { Quotation, QuotationInput } from 'src/app/core/models/quotations';
import { PaginationInput } from 'src/app/core/models/saleflow';
import { HeaderService } from 'src/app/core/services/header.service';
import { ItemsService } from 'src/app/core/services/items.service';
import { QuotationsService } from 'src/app/core/services/quotations.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { createTrue } from 'typescript';

@Component({
  selector: 'app-merchant-offers',
  templateUrl: './merchant-offers.component.html',
  styleUrls: ['./merchant-offers.component.scss']
})
export class MerchantOffersComponent implements OnInit {
  drawerOpened: boolean = false;
  listItems = [];
  isItemInCart: boolean = false;
  itemsAmount: string;
  addedItemToQuotation: boolean = false;
  supplierViewer: boolean = false;
  quotation: Quotation = null;
  constructor(private itemService: ItemsService,
    private quotationsService: QuotationsService,
    public headerService: HeaderService,
    private appService: AppService,
    private router: Router,
    private saleflowService: SaleFlowService,
  ) { }

  async ngOnInit() {
    await this.getSuppliers();
    localStorage.removeItem("offersFlow");
  }

  async getSuppliers() {
    const paginate: PaginationInput = {
      findBy: {
        activeOffer: true,
        type: "supplier"
      }
    }
    const suppliers = await this.itemService.itemsSuppliersPaginate(paginate);
    console.log("🚀 ~ file: merchant-offers.component.ts:41 ~ MerchantOffersComponent ~ getSuppliers ~ suppliers:", suppliers)
    const suppliersResults = Object.keys(suppliers).map(data => {
      return suppliers[data].results
    })
    const suppliersId: string[] = [];
    suppliersResults[0].forEach(supplier => {
      if (supplier.items && Array.isArray(supplier.items)) {
        suppliersId.push(...supplier.items);
      }
    });
    await this.getListItems(suppliersId, suppliersResults[0]);

  }

  async getListItems(ids, suppliers) {
    const pagination: PaginationInput = {
      findBy: {
        _id: {
          __in: ids
        },
      },
      options: {
        sortBy: 'createdAt:desc',
        limit: -1,
        page: 1,
      },
    };
    const items = await this.itemService.listItems(pagination);
    console.log("🚀 ~ file: merchant-offers.component.ts:69 ~ MerchantOffersComponent ~ getListItems ~ items:", items)
    const listItemsResponse = Object.keys(items).map(data => {
      return items[data]
    })
    await this.updateListItems(suppliers, listItemsResponse);
  }

  async findAdditionalData(listItems, id) {
    const items = listItems[0].find(data => data._id === id);
    return items;
  }

  async updateListItems(suppliers, listItems) {
    let updatedListItems = [];
    suppliers.forEach(async supplier => {
      let supplierItems = [];
      await supplier.items.forEach(async (item: any) => {
        const items = await this.findAdditionalData(listItems, item);
        supplierItems.push(items);
      })
      updatedListItems.push({
        parent_id: supplier.parentItem._id,
        name: supplier.parentItem.name,
        description: supplier.parentItem.description,
        images: supplier.parentItem.images,
        suppliers: supplierItems
      })
    })
    this.listItems = updatedListItems;
  }

  getAverage(suppliers) {
    let price: number = 0;
    suppliers.forEach(item => {
      price += item.pricing
    })
    const avgPrice = price / suppliers.length
    return avgPrice.toFixed(2);
  }

  async saveProduct(item) {
    await this.setSaleFlow(item.merchant._id);

    if (item && item.type === 'supplier' && this.supplierViewer) {
      const foundItemIndex =
      this.quotationsService.selectedItemsForQuotation.findIndex(
        (itemId) => itemId === item._id
        );
      if (foundItemIndex < 0) {
        this.addedItemToQuotation = true;
        this.quotationsService.selectedItemsForQuotation.push(
          item._id
        );
      } else {
        this.addedItemToQuotation = false;
        this.quotationsService.selectedItemsForQuotation.splice(
          foundItemIndex,
          1
        );
      }

      if (this.quotationsService.quotationToUpdate) {
        lockUI();
        await this.quotationsService.updateQuotation(
          {
            items: this.quotationsService.selectedItemsForQuotation,
          },
          this.quotationsService.quotationToUpdate._id
        );
        unlockUI();
      }

      return;
    }

    this.addedItemToQuotation = true;
    this.quotationsService.selectedItemsForQuotation.push(
      item._id
    );

    if (this.quotationsService.quotationToUpdate) {
      lockUI();
      await this.quotationsService.updateQuotation(
        {
          items: this.quotationsService.selectedItemsForQuotation,
        },
        this.quotationsService.quotationToUpdate._id
      );
      unlockUI();
    }

    this.itemInCart(item);
    if (!this.isItemInCart && this.headerService.saleflow && !this.headerService.saleflow?.canBuyMultipleItems)
      this.headerService.emptyOrderProducts();

    console.log(item && this.headerService.saleflow);
    if (item && this.headerService.saleflow) {
      const product: ItemSubOrderInput = {
        item: item._id,
        amount: 1,
      };

      await this.headerService.storeOrderProduct(product);

      this.appService.events.emit({
        type: 'added-item',
        data: item._id,
      });
      await this.itemInCart(item);      
      if (this.isItemInCart) this.goToCheckout();
    }
  }

  async itemInCart(itemData) {
    const productData = this.headerService.order?.products.map(
      (subOrder) => subOrder.item
    );
    if (productData?.length) {
      this.isItemInCart = productData.some(
        (item) => item === itemData._id
      );
    } else this.isItemInCart = false;

    // Validation to avoid getting deleted or unavailable items in the count of the cart
    const itemsInCart = this.headerService.saleflow.items.filter((item) =>
      productData?.some((product) => product === item.item._id)
    );

    this.itemsAmount = itemsInCart.length > 0 ? itemsInCart.length + '' : null;
  }

  goToCheckout() {
    localStorage.setItem("offersFlow", "true");
    const queryParams = {
      offers: true
    };
    this.router.navigate([
      '/ecommerce/' + this.headerService.saleflow.merchant.slug + '/cart'
    ], {
      queryParams
    });
  }

  async setSaleFlow(merchantId) {
    const saleflow = await this.saleflowService.saleflowDefault(
      merchantId
    );
    this.headerService.saleflow = saleflow;
    await this.headerService.storeSaleflow(saleflow);
  }

}
