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

@Component({
  selector: 'app-sale-detail',
  templateUrl: './sale-detail.component.html',
  styleUrls: ['./sale-detail.component.scss']
})
export class SaleDetailComponent implements OnInit {

  order: ItemOrder = null;
  merchant: Merchant = null;
  loggedIn: boolean = false;
  env: string = environment.assetsUrl;
  backgroundImg: string = "https://storage-rewardcharly.sfo2.digitaloceanspaces.com/new-assets/user-default.png";
  tags: any;
  orderTags: Record<string, boolean> = {};

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
      const { orderId } = routeParams;

      if (localStorage.getItem('session-token')) {
        const data = await this.authService.me()
        if (data) this.loggedIn = true;
      }

      if (this.loggedIn) {
        const { order } = await this.ordersService.order(orderId);
        this.order = order;

        this.order.tags.forEach(tag => {
          this.orderTags[tag] = true;
        });

        const merchantDefault = await this.merchantsService.merchantDefault();
        this.merchant = merchantDefault;

        let merchantFound = false;
        this.order.merchants.forEach(merchant => {
          if (merchant._id === merchantDefault._id) merchantFound = true;
        })

        if (!merchantFound) this.router.navigate(['/']);

        const { tagsByMerchant } = await this.tagsService.tagsByMerchant(merchantDefault._id);
        this.tags = tagsByMerchant;

        console.log(this.tags, "result");
      } else {
        this.router.navigate(['/']);
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

  redirect() {

    this.location.back();
  }

}
