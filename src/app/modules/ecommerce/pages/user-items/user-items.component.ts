import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { Item, ItemCategory } from 'src/app/core/models/item';
import { Merchant } from 'src/app/core/models/merchant';
import { SaleFlow } from 'src/app/core/models/saleflow';
import { User } from 'src/app/core/models/user';
import { AuthService } from 'src/app/core/services/auth.service';
import { ItemsService } from 'src/app/core/services/items.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { OrderService } from 'src/app/core/services/order.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { StoreShareComponent, StoreShareList } from 'src/app/shared/dialogs/store-share/store-share.component';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-user-items',
  templateUrl: './user-items.component.html',
  styleUrls: ['./user-items.component.scss']
})
export class UserItemsComponent implements OnInit {
  URI: string = environment.uri;
  tabOptions: string[] = [];
  items: Item[] = [];
  filteredItems: Item[] = [];
  ordersTotal: {
    total: number;
    length: number;
  };
  users: User[];
  merchant: Merchant;
  saleflow: SaleFlow;
  hasSalesData: boolean = false;
  categories: ItemCategory[];

  constructor(
    private itemsService: ItemsService,
    private ordersService: OrderService,
    private merchantsService: MerchantsService,
    private saleflowService: SaleFlowService,
    private authService: AuthService,
    private dialogService: DialogService,
    private headerService: HeaderService,
    private router: Router
  ) { }

  async ngOnInit(): Promise<void> {
    lockUI();
    await this.authService.me().then(data => {
      if (!data || data === undefined) this.errorScreen();
    });

    // TODO: Replace this with a header service  call to get the merchant ID
    // const merchantID = "616a13a527bcf7b8ba3ac312";

    await this.getMerchant();

    await Promise.all([
      this.getOrderTotal(this.merchant._id),
      this.getMerchantBuyers(this.merchant._id),
      this.getItems(this.merchant._id),
      this.getSaleflow(this.merchant._id),
      this.getCategories(this.merchant._id),
    ]);
    if (this.ordersTotal.total || (this.users != undefined)) this.hasSalesData = true;
    unlockUI();
  }

  async getMerchant() {
    try {
      this.merchant = await this.merchantsService.merchantDefault();
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
      const items = (await this.itemsService.itemsByMerchant(merchantID)).itemsByMerchant;
      this.items = items;
      this.filteredItems = items;
    } catch (error) {
      console.log(error);
    }
  }

  async getCategories(merchantID: string) {
    try {
      this.categories = (await this.itemsService.itemCategories(merchantID, {
        options: {
          limit: 100,
        },
      }))?.itemCategoriesList;
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
            func: () => {
              this.headerService.flowRoute = this.router.url;

              this.itemsService.temporalItem = null;
              this.router.navigate(['/ecommerce/item-creator'])
            }
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
        title:  'Mi Tienda',
        options: [
          {
            text: 'Copia el link',
            mode: 'clipboard',
            link: `${this.URI}/ecommerce/store/${this.saleflow._id}`,
          },
          {
            text: 'Comparte el link',
            mode: 'share',
            link: `${this.URI}/ecommerce/store/${this.saleflow._id}`,
          },
          {
            text: 'Descarga el qrCode',
            mode: 'qr',
            link: `${this.URI}/ecommerce/store/${this.saleflow._id}`,
          },
          {
            text: 'Vista del Comprador',
            mode: 'func',
            func: () => this.router.navigate([`/ecommerce/store/${this.saleflow._id}`]),
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

  errorScreen() {
    unlockUI();
    this.router.navigate([`ecommerce/error-screen/`]);
  }

  editItem(id: string) {
    this.router.navigate([`/ecommerce/item-display/${id}`], {
      queryParams: { mode: 'edit' }
    })
  }

  goToCategoryItemDetail(id: string) {
    this.router.navigate([`/ecommerce/category-item-detail/${id}`]);
  }

  goToDashBoard() {
    this.router.navigate([`/ecommerce/user-dashboard`]);
  }

  goToSales() {
    this.router.navigate([`/ecommerce/order-sales/${this.merchant._id}`]);
  }

  activeCategory: number;
  mouseDown: boolean;
  startX: number;
  scrollLeft: number;
  showAll() {
    this.activeCategory = null;
    this.filteredItems = [...this.items];
  }

  changeTab(index: number) {
    this.activeCategory = index;
    this.filteredItems = this.items.filter((item) => item.category?.some((category) => category._id === this.categories[this.activeCategory]._id));
  }

  startDragging(e: MouseEvent, el: HTMLDivElement) {
    this.mouseDown = true;
    this.startX = e.pageX - el.offsetLeft;
    this.scrollLeft = el.scrollLeft;
  }

  stopDragging() {
    this.mouseDown = false;
  }

  moveEvent(e: MouseEvent, el: HTMLDivElement) {
    e.preventDefault();
    if (!this.mouseDown) {
      return;
    }
    const x = e.pageX - el.offsetLeft;
    const scroll = x - this.startX;
    el.scrollLeft = this.scrollLeft - scroll;
  }

}