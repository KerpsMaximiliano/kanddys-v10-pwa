import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { environment } from 'src/environments/environment';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { MerchantsService } from 'src/app/core/services/merchants.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { OrderService } from 'src/app/core/services/order.service';
import { TagsService } from 'src/app/core/services/tags.service';
import { ItemOrder } from 'src/app/core/models/order';
import { Merchant } from 'src/app/core/models/merchant';
import { formatID } from 'src/app/core/helpers/strings.helpers';
import { User } from 'src/app/core/models/user';
import { lockUI, unlockUI } from 'src/app/core/helpers/ui.helpers';

@Component({
  selector: 'app-sale-detail',
  templateUrl: './sale-detail.component.html',
  styleUrls: ['./sale-detail.component.scss']
})
export class SaleDetailComponent implements OnInit {

  order: ItemOrder = null;
  merchant: Merchant = null;
  env: string = environment.assetsUrl;
  backgroundImg: string = "https://storage-rewardcharly.sfo2.digitaloceanspaces.com/new-assets/user-default.png";
  tags: any;
  orderId: string = null;
  orderTags: Record<string, boolean> = {};
  user: User;

  constructor(
    private route: ActivatedRoute,
    private merchantsService: MerchantsService,
    private router: Router,
    private authService: AuthService,
    private location: Location,
    private ordersService: OrderService,
    private tagsService: TagsService
  ) { }


  ngOnInit(): void {
    this.route.params.subscribe(async routeParams => {
      try {
        const { orderId } = routeParams;
        lockUI();
        if (localStorage.getItem('session-token')) {
          this.user = await this.authService.me()
        }

        if(!this.user) return this.errorScreen();

        const data = await this.ordersService.order(orderId);

        if (!data || !data.order) return this.errorScreen();

        this.order = data.order;
        this.orderId = formatID(data.order.dateId);

        this.order.tags.forEach(tag => {
          this.orderTags[tag] = true;
        });

        const merchantDefault = await this.merchantsService.merchantDefault();
        if (!merchantDefault) return this.errorScreen();

        this.merchant = merchantDefault;

        let merchantFound = false;
        this.order.merchants.forEach(merchant => {
          if (merchant._id === merchantDefault._id) merchantFound = true;
        })

        if (!merchantFound) this.router.navigate(['/']);

        const { tagsByMerchant } = await this.tagsService.tagsByMerchant(merchantDefault._id);
        this.tags = tagsByMerchant;

        unlockUI();
        console.log(this.tags, "result");
      } catch (error) {
        console.log(error);
        return this.errorScreen();
      }
    });
  }


  async addOrRemoveTag(clickedTagId: string, isTagAssociatedToThisItem: boolean) {
    let newItemTags;

    console.log(clickedTagId);

    if (isTagAssociatedToThisItem) {
      newItemTags = Object.keys(this.orderTags).filter(tagId => tagId !== clickedTagId);

      Object.keys(this.orderTags).forEach(tagId => {
        if (!newItemTags.includes(tagId)) {
          delete this.orderTags[tagId]

          this.tags.forEach(tag => {
            if (tagId === tag.tags._id) tag.tags.counter--;
          })
        };
      })

      await this.tagsService.removeTagsInOrder(this.merchant._id, clickedTagId, this.order._id);
    } else {
      newItemTags = Object.keys(this.orderTags);
      newItemTags.push(clickedTagId);

      this.orderTags[clickedTagId] = true;

      this.tags.forEach(tag => {
        if (clickedTagId === tag.tags._id) tag.tags.counter++;
      })

      await this.tagsService.addTagsInOrder(this.merchant._id, clickedTagId, this.order._id);
    }
  }

  errorScreen() {
    unlockUI();
    this.router.navigate([`ecommerce/error-screen/`]);
  }

  redirect() {
    this.router.navigate([`ecommerce/order-sales/${this.merchant._id}`]);
  }

}
