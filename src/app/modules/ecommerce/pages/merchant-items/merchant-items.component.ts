import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { Item } from 'src/app/core/models/item';
import { Merchant } from 'src/app/core/models/merchant';
import { AuthService } from 'src/app/core/services/auth.service';
import { ItemsService } from 'src/app/core/services/items.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { OrderService } from 'src/app/core/services/order.service';

@Component({
  selector: 'app-merchant-items',
  templateUrl: './merchant-items.component.html',
  styleUrls: ['./merchant-items.component.scss']
})
export class MerchantItemsComponent implements OnInit {

  merchant: Merchant;
  items: Item[] = [];
  ordersTotal: {
    total: number;
    length: number;
  };
  hasSalesData: boolean = false;
  status: 'idle' | 'loading' | 'complete' | 'error' = 'idle';

  // Dummy Data
  itemList: Array<any> = [{
    price: 0.00,
    quantity: 0
  },{
    price: 0.01,
    quantity: 0
  },{
    price: 0.02,
    quantity: 0
  },{
    price: 0.03,
    quantity: 0
  },{
    price: 0.04,
    quantity: 0
  },{
    price: 0.05,
    quantity: 0
  }];

  constructor(
    private merchantsService: MerchantsService,
    private itemsService: ItemsService,
    private ordersService: OrderService,
    private authService: AuthService,
    private router: Router,
    private location: Location
  ) { }

  async ngOnInit(): Promise<void> {
    lockUI();
    this.status = 'loading';
    await this.authService.me().then(data => {
      if (!data || data === undefined) this.errorScreen();
    });

    // TODO: Replace this with a header service  call to get the merchant ID
    // const merchantID = "616a13a527bcf7b8ba3ac312";

    await this.getMerchant();

    await Promise.all([
      this.getOrderTotal(this.merchant._id),
      this.getItems(this.merchant._id)
    ]);
    this.status = 'complete';
    if (this.ordersTotal.total) this.hasSalesData = true;
    unlockUI();
  }

  async getMerchant() {
    try {
      this.merchant = await this.merchantsService.merchantDefault();
    } catch (error) {
      this.status = 'error';
      console.log(error);
    }
  }

  async getItems(merchantID: string) {
    try {
      const items = (await this.itemsService.itemsByMerchant(merchantID, true)).itemsByMerchant;
      console.log(items);
      this.items = items;
    } catch (error) {
      this.status = 'error';
      console.log(error);
    }
  }


  testing = () =>{
    console.log('test')
  }

  async getOrderTotal(merchantID: string) {
    try {
      this.ordersTotal = await this.ordersService.ordersTotal(['in progress', 'to confirm', 'completed'], merchantID);
    } catch (error) {
      this.status = 'error';
      console.log(error);
    }
  }

  goToDetail(id: string) {
    this.router.navigate([`ecommerce/item-display/${id}`]);
  }

  errorScreen() {
    unlockUI();
    this.status = 'error';
    this.router.navigate([`ecommerce/error-screen/`]);
  }

   goToMetrics = () =>{
    this.router.navigate([`ecommerce/entity-detail-metrics`]);
  }

  back() {
    this.router.navigate([`ecommerce/entity-detail-metrics`]);
  }
}
