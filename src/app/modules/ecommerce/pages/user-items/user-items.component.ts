import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Item } from 'src/app/core/models/item';
import { Merchant } from 'src/app/core/models/merchant';
import { SaleFlow } from 'src/app/core/models/saleflow';
import { User } from 'src/app/core/models/user';
import { AuthService } from 'src/app/core/services/auth.service';
import { ItemsService } from 'src/app/core/services/items.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { OrderService } from 'src/app/core/services/order.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { StoreShareComponent, StoreShareList } from 'src/app/shared/dialogs/store-share/store-share.component';

@Component({
  selector: 'app-user-items',
  templateUrl: './user-items.component.html',
  styleUrls: ['./user-items.component.scss']
})
export class UserItemsComponent implements OnInit {
  items: Item[] = [];
  // merchantID: string;
  ordersTotal: {
    total: number;
    length: number;
  };
  users: User[];
  merchant: Merchant;
  saleflow: SaleFlow;
  hasSalesData: boolean = false;

  constructor(
    private itemsService: ItemsService,
    private ordersService: OrderService,
    private merchantsService: MerchantsService,
    private saleflowService: SaleFlowService,
    private authService: AuthService,
    private dialogService: DialogService,
    private router: Router
  ) { }

  async ngOnInit(): Promise<void> {

    await this.authService.me().then(data => {
      if (!data || data === undefined) this.redirect();
      console.log(data)
    });

    // TODO: Replace this with a header service  call to get the merchant ID
    // const merchantID = "616a13a527bcf7b8ba3ac312";

    await this.getMerchant();

    await Promise.all([
      this.getOrderTotal(this.merchant._id),
      this.getMerchantBuyers(this.merchant._id),
      this.getItems(this.merchant._id),
      this.getSaleflow(this.merchant._id),
    ]);
    this.hasSalesData = true;
  }

  async getMerchant() {
    try {
      this.merchant = await this.merchantsService.merchantDefault();
      console.log("MERCHANT");
      console.log(this.merchant);
    } catch (error) {
      console.log(error);
    }
  }

  async getOrderTotal(merchantID: string) {
    try {
      this.ordersTotal = await this.ordersService.ordersTotal(['in progress', 'to confirm', 'completed'], merchantID);
    } catch (error) {
      console.log(error);
    }
  }

  async getMerchantBuyers(merchantID: string) {
    try {
      this.users = await this.merchantsService.usersOrderMerchant(merchantID);
    } catch (error) {
      console.log(error);
    }
  }

  async getItems(merchantID: string) {
    try {
      this.items = (await this.itemsService.itemsByMerchant(merchantID)).itemsByMerchant;
    } catch (error) {
      console.log(error);
    }
  }

  async getSaleflow(merchantID: string) {
    try {
      this.saleflow = await this.saleflowService.saleflowDefault(merchantID);
    } catch (error) {
      console.log(error);
    }
  }

  openCreateNew() {
    const list: StoreShareList[] = [
      {
        title:  'Crear Nuevo(a)',
        options: [
          {
            text: 'Item',
            mode: 'func',
            func: () => this.router.navigate(['/ecommerce/item-creator']),
          },
          {
            text: 'Categoria',
            mode: 'func',
            func: () => {
              this.router.navigate(['/ecommerce/data-list'], {
                queryParams: { mode: 'category', viewtype: 'merchant' }
              })
            },
          },
        ]
      }
    ]
    this.dialogService.open(StoreShareComponent, {
      type: 'fullscreen-translucent',
      props: {
        list
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  }

  openShare() {
    const list: StoreShareList[] = [
      // {
      //   title:  'Mi Contacto',
      //   options: [
      //     {
      //       text: 'Copia el link',
      //       mode: 'clipboard',
      //       link: 'fsdfdsfsdf',
      //     },
      //     {
      //       text: 'Comparte el link',
      //       mode: 'share',
      //       link: 'hfghfgh',
      //     },
      //     {
      //       text: 'Descarga el qrCode',
      //       mode: 'qr',
      //       link: 'hfghfgh',
      //     },
      //     {
      //       text: 'Vista del Comprador',
      //       mode: 'func',
      //       func: () => console.log('test'),
      //     },
      //   ]
      // },
      {
        title:  'Mi Contacto',
        options: [
          {
            text: 'Copia el link',
            mode: 'clipboard',
            link: `https://kanddys.com/ecommerce/megaphone-v3/${this.saleflow._id}`,
          },
          {
            text: 'Comparte el link',
            mode: 'share',
            link: `https://kanddys.com/ecommerce/megaphone-v3/${this.saleflow._id}`,
          },
          {
            text: 'Descarga el qrCode',
            mode: 'qr',
            link: `https://kanddys.com/ecommerce/megaphone-v3/${this.saleflow._id}`,
          },
          {
            text: 'Vista del Comprador',
            mode: 'func',
            func: () => this.router.navigate([`/ecommerce/megaphone-v3/${this.saleflow._id}`]),
          },
        ]
      },
    ]
    this.dialogService.open(StoreShareComponent, {
      type: 'fullscreen-translucent',
      props: {
        list
      },
      customClass: 'app-dialog',
      flags: ['no-header'],
    });
  }

  redirect() {
    this.router.navigate([`/`]);
  }

  editItem(i) {
    this.router.navigate([`/ecommerce/item-display/${this.items[i]._id}`], {
      queryParams: { mode: 'edit' }
    })
  }

  goToCategoryItemDetail(i) {
    this.router.navigate([`/ecommerce/category-item-detail/${this.items[i]._id}`]);
  }

  goToSales() {
    this.router.navigate([`/ecommerce/order-sales/${this.merchant._id}`]);
  }

}