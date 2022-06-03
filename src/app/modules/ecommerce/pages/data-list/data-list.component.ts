import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Tag } from 'src/app/core/models/tags';
import { AuthService } from 'src/app/core/services/auth.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { OrderService } from 'src/app/core/services/order.service';
import { TagsService } from 'src/app/core/services/tags.service';

@Component({
  selector: 'app-data-list',
  templateUrl: './data-list.component.html',
  styleUrls: ['./data-list.component.scss']
})
export class DataListComponent implements OnInit {
  keyword: string = '';
  tagList: Tag[] = [];
  filteredTagList: Tag[] = [];
  merchantId: string;
  orderId: string;
  viewtype: 'merchant' | 'user';

  constructor(
    private tagsService: TagsService,
    private orderService: OrderService,
    private route: ActivatedRoute,
    private auth: AuthService,
    private headerService: HeaderService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe((queries) => {
      if(queries.viewtype === 'merchant') this.viewtype = 'merchant';
      else if(queries.viewtype === 'user') this.viewtype = 'user';
      else return this.redirect();
    })
    if(this.viewtype === 'merchant') {
      this.merchantId = this.headerService.merchantInfo?._id;
      if(!this.merchantId) return this.redirect();
    }
    this.route.params.subscribe(async (params) => {
      if(!params.orderId) return this.redirect();
      const order = (await this.orderService.order(params.orderId))?.order;
      if(!order) return this.redirect();
      this.orderId = order._id;
      const user = await this.auth.me();
      if(!user) return this.redirect();
      const tags = await this.tagsService.tagsByUser();
      tags.forEach((tag) => {
        if(order.tags.includes(tag._id)) {
          if(this.viewtype === 'merchant') tag.notifyMerchantOrder = true;
          if(this.viewtype === 'user') tag.notifyUserOrder = true;
        }
      })
      this.tagList = tags;
      this.filteredTagList = tags;
    })
  }

  redirect() {
    this.router.navigate([`ecommerce/error-screen/`], {
      queryParams: { type: 'item' },
    });
  }

  onTagClick(tag: Tag) {
    if(this.viewtype === 'merchant') {
      if(tag.notifyMerchantOrder) {
        tag.counter--;
        this.tagsService.removeTagsInOrder(this.merchantId, tag._id, this.orderId)
          .then((value) => {
            console.log('removed successfully!')
          })
          .catch((error) => {
            console.log(error);
            tag.counter++;
          });
      }
      else {
        tag.counter++;
        this.tagsService.addTagsInOrder(this.merchantId, tag._id, this.orderId)
          .then((value) => {
            console.log('added successfully!')
          })
          .catch((error) => {
            console.log(error);
            tag.counter--;
          }); 
      }
      tag.notifyMerchantOrder = !tag.notifyMerchantOrder;
    }
    if(this.viewtype === 'user') {
      // if(tag.notifyUserOrder) {
      //   tag.counter--;
      //   this.tagsService.removeTagsInUserOrder(tag._id, this.orderId)
      //   .then((value) => {
      //     console.log(value);
      //     console.log('removed successfully!')
      //   })
      //   .catch((error) => {
      //     console.log(error);
      //     tag.counter++;
      //   });
      // } else {
      //   tag.counter++;
      //   this.tagsService.addTagsInUserOrder(this.merchantId, tag._id, this.orderId)
      //     .then((value) => {
      //       console.log(value);
      //       console.log('added successfully!')
      //     })
      //     .catch((error) => {
      //       console.log(error);
      //       tag.counter--;
      //     }); 
      // }
    }
  }

  searchKeyword() {
    this.filteredTagList = this.tagList.filter((tag) => tag.name.includes(this.keyword));
  }

  back() {
    const route = `/ecommerce/${this.viewtype === 'merchant' ? 'order-sales/'+this.merchantId : 'user-dashboard/tiendas'}`
    this.router.navigate([route]);
  }

}
