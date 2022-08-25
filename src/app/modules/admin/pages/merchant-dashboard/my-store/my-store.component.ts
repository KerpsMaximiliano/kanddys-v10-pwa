import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Item, ItemCategory } from 'src/app/core/models/item';
import { ItemsService } from 'src/app/core/services/items.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { OrderService } from 'src/app/core/services/order.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-my-store',
  templateUrl: './my-store.component.html',
  styleUrls: ['./my-store.component.scss']
})
export class MyStoreComponent implements OnInit {
  env: string = environment.assetsUrl;
  showCategories: boolean = false;
  showActiveItems: boolean = true;
  tagsData: Array<any> = ['', '', '', ''];
  categories: ItemCategory[] = [];
  items: Item[] = [];
  filteredItems: Item[] = [];
  ordersTotal: {
    total: number,
    length: number
  };
  status: 'idle' | 'loading' | 'complete' | 'error' = 'idle';

  constructor(
    private route: ActivatedRoute,
    private itemsService: ItemsService,
    private orderService: OrderService,
    private merchantsService: MerchantsService,
  ) { }

  async ngOnInit(): Promise<void> {
    this.route.parent.params.subscribe(async (params) => {
      this.status = 'loading';
      console.log(params.merchantId)
      this.items = (await this.itemsService.itemsByMerchant(params.merchantId)).itemsByMerchant;
      this.filteredItems = this.items.filter((item) => item.status === 'active');
      this.status = 'complete';
      const merchantOrders = (await this.merchantsService.ordersByMerchant(params.merchantId))?.ordersByMerchant;
      if(merchantOrders && merchantOrders.length) {
        const ordersId = merchantOrders.map((order) => order._id)
        this.ordersTotal = await this.orderService.ordersTotal(['completed', 'in progress', 'to confirm'], params.merchantId, ordersId);
      }
      this.categories = (
        await this.itemsService.itemCategories(params.merchantId, {
          options: {
            limit: 20,
          },
        })
      ).itemCategoriesList;
    })
  }

  filterItems(filter: 'active' | 'inactive') {
    if(filter === 'active') {
      if(this.showActiveItems) return;
      this.showActiveItems = true;
      this.filteredItems = this.items.filter((item) => item.status === 'active');
    }
    if(filter === 'inactive') {
      if(!this.showActiveItems) return;
      this.showActiveItems = false;
      this.filteredItems = this.items.filter((item) => item.status === 'disabled');
    }
  }
}
