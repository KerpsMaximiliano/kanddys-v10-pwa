import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { Item } from 'src/app/core/models/item';
import { Merchant } from 'src/app/core/models/merchant';
import { SaleFlow } from 'src/app/core/models/saleflow';
import { Tag } from 'src/app/core/models/tags';
import { User } from 'src/app/core/models/user';
import { AuthService } from 'src/app/core/services/auth.service';
import { ItemsService } from 'src/app/core/services/items.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { OrderService } from 'src/app/core/services/order.service';
import { SaleFlowService } from 'src/app/core/services/saleflow.service';
import { DialogService } from 'src/app/libs/dialog/services/dialog.service';
import { StoreShareComponent, StoreShareList } from 'src/app/shared/dialogs/store-share/store-share.component';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-entity-detail-metrics',
  templateUrl: './entity-detail-metrics.component.html',
  styleUrls: ['./entity-detail-metrics.component.scss']
})
export class EntityDetailMetricsComponent implements OnInit {
  URI: string = environment.uri;
  merchant: Merchant;
  items: Item[];
  user: User;
  users: User[];
  mode: 'collections' | 'store' = 'store';
  ordersTotal: {
    total: number;
    length: number;
  };
  tags: { text: string}[];
  categories: { text: string}[];
  admin: boolean;
  saleflow: SaleFlow;

  constructor(
    private merchantsService: MerchantsService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private ordersService: OrderService,
    private itemsService: ItemsService,
    private saleflowService: SaleFlowService,
    private dialogService: DialogService,
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(async params => {
      lockUI();
      this.merchant = await this.merchantsService.merchant(params.id);
      if(!this.merchant) return;
      this.items = (await this.merchantsService.itemsByMerchant(params.id))?.itemsByMerchant;

      this.user = await this.authService.me();
      if(this.user) {
        if(this.merchant.owner._id !== this.user._id) return;
        this.admin = true;
        await Promise.all([
          this.getOrderTotal(),
          this.getMerchantBuyers(),
          this.getTags(),
          this.getCategories(),
          this.getSaleflow(),
        ]);
      };
      unlockUI();
    })
  }

  async getOrderTotal() {
    try {
      this.ordersTotal = await this.ordersService.ordersTotal(['in progress', 'to confirm', 'completed'], this.merchant._id);
    } catch (error) {
      console.log(error);
    }
  }

  async getMerchantBuyers() {
    try {
      this.users = await this.merchantsService.usersOrderMerchant(this.merchant._id);
    } catch (error) {
      console.log(error);
    }
  }

  async getTags() {
    try {
      const tags = (await this.merchantsService.tagsByMerchant(this.merchant._id))?.tagsByMerchant;
      if(!tags) return;
      this.tags = tags.filter(tag => tag.tags?.name).map(tag => ({text: tag.tags.name}));
    } catch (error) {
      console.log(error);
    }
  }

  async getCategories() {
    try {
      const categories = (await this.itemsService.itemCategories(this.merchant._id, {
        options: {
          limit: 1000,
        },
      }))?.itemCategoriesList;
      if(!categories) return;
      this.categories = categories.filter(category => category.name).map(category => ({text: category.name}));
    } catch (error) {
      console.log(error);
    }
  }

  async getSaleflow() {
    try {
      this.saleflow = await this.saleflowService.saleflowDefault(this.merchant._id)
    } catch (error) {
      console.log(error);
    }
  }

  onShareClick = () => {
    const list: StoreShareList[] = [
      {
        qrlink: `${this.URI}/ecommerce/megaphone-v3/${this.saleflow._id}`,
        options: [
          {
            text: 'Copia el link',
            mode: 'clipboard',
            link: `${this.URI}/ecommerce/megaphone-v3/${this.saleflow._id}`,
          },
          {
            text: 'Comparte el link',
            mode: 'share',
            link: `${this.URI}/ecommerce/megaphone-v3/${this.saleflow._id}`,
          },
          {
            text: 'Ir a la vista del visitante',
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

  onPencilClick = () => {
    this.router.navigate(['ecommerce/user-creator']);
  }

  redirectToCreateItem = () => {
    this.router.navigate(['ecommerce/item-creator']);
  }

}
