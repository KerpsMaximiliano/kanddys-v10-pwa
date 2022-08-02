import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { Item } from 'src/app/core/models/item';
import { Merchant } from 'src/app/core/models/merchant';
import { SaleFlow } from 'src/app/core/models/saleflow';
import { AuthService } from 'src/app/core/services/auth.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { ItemsService } from 'src/app/core/services/items.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { OrderService } from 'src/app/core/services/order.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { StoreShareComponent } from 'src/app/shared/dialogs/store-share/store-share.component';
import { StoreShareList } from 'src/app/shared/dialogs/store-share/store-share.component';

@Component({
  selector: 'app-merchant-items',
  templateUrl: './merchant-items.component.html',
  styleUrls: ['./merchant-items.component.scss']
})
export class MerchantItemsComponent implements OnInit {

  merchant: Merchant;
  saleflow: SaleFlow;
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
    private saleflowService: SaleFlowService,
    private itemsService: ItemsService,
    private ordersService: OrderService,
    private authService: AuthService,
    private router: Router,
    private location: Location,
    private dialog: DialogService,
    private headerService: HeaderService
  ) { }

  async ngOnInit(): Promise<void> {
    lockUI();
    this.authService.ready.subscribe(async observer => {
      if (observer != undefined) {
        console.log(observer);
        this.status = 'loading';
        const user = await this.authService.me();
        if (!user) this.errorScreen();

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
      } else {
        this.errorScreen();
      }
    });
  }

  async getMerchant() {
    try {
      this.merchant = await this.merchantsService.merchantDefault();
      this.saleflow = await this.saleflowService.saleflowDefault(this.merchant._id);
    } catch (error) {
      this.status = 'error';
      console.log(error);
    }
  }

  async getItems(merchantID: string) {
    try {
      const items = (await this.itemsService.itemsByMerchant(merchantID, true)).itemsByMerchant;
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

  createItem(){
    this.headerService.flowRoute = this.router.url;
    this.router.navigate([`ecommerce/item-creator/`]);
  }

  openDeleteDialog(item: Item) {
    const list: StoreShareList[] = [
      {
          title: `Eliminar ${item.name || 'producto'}?`,
          description: 'Esta acción es irreversible, estás seguro que deseas eliminar este producto?',
          message: 'Eliminar',
          messageCallback: async () => {
            const removeItemFromSaleFlow = await this.saleflowService.removeItemFromSaleFlow(item._id, this.saleflow._id);
            if(!removeItemFromSaleFlow) return;
            const deleteItem = await this.itemsService.deleteItem(item._id);
            if(!deleteItem) return;
            this.items = this.items.filter(listItem => listItem._id !== item._id);
          }
      },
    ];

  this.dialog.open(StoreShareComponent, {
      type: 'fullscreen-translucent',
      props: {
        list,
        alternate: true
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
  });
  }

  openDialog = () => {

    const list: StoreShareList[] = [
        {
          title:  'Crear',
          options: [
            {
              text: 'Un nuevo Item',
              mode: 'func',
              func: () => {
                this.router.navigate(['ecommerce/item-creator/']);
              }
            }
          ]
        }
    ];
        
    this.dialog.open(StoreShareComponent, {
        type: 'fullscreen-translucent',
        props: {
          list,
          alternate: true
        },
        customClass: 'app-dialog',
        flags: ['no-header'],
    });
    };
}