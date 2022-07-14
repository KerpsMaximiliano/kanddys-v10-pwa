import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';
import { Item } from 'src/app/core/models/item';
import { Merchant } from 'src/app/core/models/merchant';
import { Tag } from 'src/app/core/models/tags';
import { User } from 'src/app/core/models/user';
import { AuthService } from 'src/app/core/services/auth.service';
import { ItemsService } from 'src/app/core/services/items.service';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { OrderService } from 'src/app/core/services/order.service';

@Component({
  selector: 'app-entity-detail-metrics',
  templateUrl: './entity-detail-metrics.component.html',
  styleUrls: ['./entity-detail-metrics.component.scss']
})
export class EntityDetailMetricsComponent implements OnInit {
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

  constructor(
    private merchantsService: MerchantsService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private ordersService: OrderService,
    private itemsService: ItemsService,
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
      console.log(categories);
      if(!categories) return;
      this.categories = categories.filter(category => category.name).map(category => ({text: category.name}));
    } catch (error) {
      console.log(error);
    }
  }

  onShareClick = () => {
    //
  }

  onPencilClick = () => {
    //
  }

}
